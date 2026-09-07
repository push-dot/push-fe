use crate::{cli, safety, storage};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use sqlx::{Row, SqlitePool};
use std::{
    fs::{self, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
};
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

pub struct NativeState {
    pub root: PathBuf,
}
fn uuid(value: &str) -> Result<(), String> {
    uuid::Uuid::parse_str(value)
        .map(|_| ())
        .map_err(|_| "INVALID_ID".into())
}
fn private_file(path: &Path) -> Result<std::fs::File, String> {
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    options
        .open(path)
        .map_err(|_| "FILE_EXISTS_OR_UNAVAILABLE".into())
}
fn device(root: &Path) -> Result<String, String> {
    let path = root.join("device-id");
    if let Ok(mut file) = private_file(&path) {
        let id = uuid::Uuid::new_v4().to_string();
        file.write_all(id.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|_| "DEVICE_STORAGE_FAILED")?;
    }
    let value = fs::read_to_string(path).map_err(|_| "DEVICE_STORAGE_FAILED")?;
    uuid(&value)?;
    Ok(value)
}
#[tauri::command]
pub fn device_id(state: State<'_, NativeState>) -> Result<String, String> {
    device(&state.root)
}
async fn account_db(root: &Path, account: &str) -> Result<SqlitePool, String> {
    uuid(account)?;
    let pool = storage::database(&root.join(format!("account-{account}.sqlite"))).await?;
    sqlx::query("CREATE TABLE IF NOT EXISTS records(key TEXT PRIMARY KEY,value TEXT NOT NULL)")
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    Ok(pool)
}
#[tauri::command]
pub async fn local_read(
    state: State<'_, NativeState>,
    account_id: String,
    key: String,
) -> Result<Option<String>, String> {
    let pool = account_db(&state.root, &account_id).await?;
    let result = sqlx::query_scalar("SELECT value FROM records WHERE key=?")
        .bind(key)
        .fetch_optional(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE".into());
    pool.close().await;
    result
}
#[derive(Deserialize)]
pub struct Entry {
    key: String,
    value: String,
}
#[tauri::command]
pub async fn local_write(
    state: State<'_, NativeState>,
    account_id: String,
    key: String,
    value: String,
) -> Result<(), String> {
    write_entries(&state.root, &account_id, vec![Entry { key, value }]).await
}
#[tauri::command]
pub async fn local_write_batch(
    state: State<'_, NativeState>,
    account_id: String,
    entries: Vec<Entry>,
) -> Result<(), String> {
    write_entries(&state.root, &account_id, entries).await
}
async fn write_entries(root: &Path, account: &str, entries: Vec<Entry>) -> Result<(), String> {
    if entries.is_empty()
        || entries.len() > 50
        || entries.iter().any(|v| {
            v.key.is_empty()
                || v.key.len() > 256
                || v.value.len() > 5 * 1024 * 1024
                || serde_json::from_str::<Value>(&v.value).is_err()
        })
    {
        return Err("INVALID_LOCAL_RECORD".into());
    }
    let pool = account_db(root, account).await?;
    let mut transaction = pool
        .begin()
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    for entry in entries {
        sqlx::query("INSERT INTO records(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(entry.key).bind(entry.value).execute(&mut *transaction).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?;
    }
    transaction
        .commit()
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    pool.close().await;
    Ok(())
}
#[tauri::command]
pub async fn detect_clis() -> Vec<cli::Detection> {
    cli::detections().await
}
#[derive(Serialize)]
pub struct SourceFile {
    name: String,
    bytes: Vec<u8>,
}
#[tauri::command]
pub async fn import_source(app: AppHandle) -> Result<Option<SourceFile>, String> {
    let selected = app
        .dialog()
        .file()
        .add_filter("Documents", &["pdf", "docx", "txt", "md"])
        .blocking_pick_file();
    let Some(file) = selected else {
        return Ok(None);
    };
    let path = file.into_path().map_err(|_| "INVALID_PATH")?;
    let file = fs::File::open(&path).map_err(|_| "FILE_READ_FAILED")?;
    if !file.metadata().map_err(|_| "FILE_READ_FAILED")?.is_file() {
        return Err("INVALID_FILE".into());
    }
    let mut bytes = Vec::new();
    file.take(20 * 1024 * 1024 + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| "FILE_READ_FAILED")?;
    if bytes.len() > 20 * 1024 * 1024 {
        return Err("FILE_TOO_LARGE".into());
    }
    let name = path
        .file_name()
        .ok_or("INVALID_PATH")?
        .to_string_lossy()
        .into_owned();
    let extension = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    let valid = match extension.as_str() {
        "pdf" => bytes.starts_with(b"%PDF-"),
        "docx" => bytes.starts_with(b"PK\x03\x04"),
        "txt" | "md" => std::str::from_utf8(&bytes).is_ok(),
        _ => false,
    };
    if !valid {
        return Err("UNSUPPORTED_FILE".into());
    }
    Ok(Some(SourceFile { name, bytes }))
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedFile {
    path: String,
    sha256: String,
    byte_length: usize,
}
#[tauri::command]
pub async fn save_export(
    app: AppHandle,
    file_name: String,
    bytes: Vec<u8>,
) -> Result<Option<SavedFile>, String> {
    if bytes.len() > 20 * 1024 * 1024
        || safety::safe_relative(&file_name)?.components().count() != 1
    {
        return Err("INVALID_EXPORT".into());
    }
    let extension = Path::new(&file_name)
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    if !(extension == "pdf" && bytes.starts_with(b"%PDF-")
        || extension == "docx" && bytes.starts_with(b"PK\x03\x04"))
    {
        return Err("INVALID_EXPORT".into());
    }
    let Some(selected) = app
        .dialog()
        .file()
        .set_file_name(&file_name)
        .add_filter("Document", &[&extension])
        .blocking_save_file()
    else {
        return Ok(None);
    };
    let path = selected.into_path().map_err(|_| "INVALID_PATH")?;
    if path.extension().and_then(|v| v.to_str()) != Some(extension.as_str()) {
        return Err("INVALID_EXPORT_EXTENSION".into());
    }
    let mut file = private_file(&path)?;
    if file
        .write_all(&bytes)
        .and_then(|_| file.sync_all())
        .is_err()
    {
        drop(file);
        let _ = fs::remove_file(&path);
        return Err("FILE_WRITE_FAILED".into());
    }
    Ok(Some(SavedFile {
        path: path.to_string_lossy().into(),
        sha256: format!("{:x}", Sha256::digest(&bytes)),
        byte_length: bytes.len(),
    }))
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Manifest {
    project_id: String,
    blueprint_revision: u64,
    files: Vec<ManifestFile>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ManifestFile {
    path: String,
    encoding: String,
    content: String,
    sha256: String,
}
#[tauri::command]
pub async fn copy_project(
    app: AppHandle,
    state: State<'_, NativeState>,
    manifest: Manifest,
) -> Result<Option<Value>, String> {
    uuid(&manifest.project_id)?;
    if manifest.blueprint_revision < 1 || manifest.files.iter().any(|v| v.encoding != "utf8") {
        return Err("INVALID_MANIFEST".into());
    }
    let Some(selected) = app.dialog().file().blocking_pick_folder() else {
        return Ok(None);
    };
    let parent = selected.into_path().map_err(|_| "INVALID_PATH")?;
    let parent = fs::canonicalize(parent).map_err(|_| "INVALID_PATH")?;
    let root = parent.join(format!("push-project-{}", uuid::Uuid::new_v4()));
    fs::create_dir(&root).map_err(|_| "DIRECTORY_CREATE_FAILED")?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&root, fs::Permissions::from_mode(0o700))
            .map_err(|_| "DIRECTORY_CREATE_FAILED")?;
    }
    let files = manifest
        .files
        .into_iter()
        .map(|f| (f.path, f.content, f.sha256))
        .collect::<Vec<_>>();
    if let Err(error) = safety::write_manifest(&root, &files) {
        let _ = fs::remove_dir_all(&root);
        return Err(error);
    }
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    sqlx::query("CREATE TABLE IF NOT EXISTS projects(id TEXT NOT NULL,directory TEXT PRIMARY KEY)")
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    sqlx::query("INSERT INTO projects(id,directory) VALUES(?,?)")
        .bind(manifest.project_id)
        .bind(root.to_string_lossy().as_ref())
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    pool.close().await;
    let identity = crate::directory::DirectoryGuard::open(&root)?
        .identity()
        .to_string();
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    sqlx::query("CREATE TABLE IF NOT EXISTS project_directories(directory TEXT PRIMARY KEY,identity TEXT NOT NULL)").execute(&pool).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?;
    sqlx::query("INSERT INTO project_directories(directory,identity) VALUES(?,?)")
        .bind(root.to_string_lossy().as_ref())
        .bind(identity)
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    pool.close().await;
    Ok(Some(json!({"workingDirectory":root})))
}

fn client(api_base: &str) -> Result<(reqwest::Client, String), String> {
    let base = api_base.trim_end_matches('/');
    let local = cfg!(debug_assertions)
        && [
            "http://localhost:8080/api/v1",
            "http://127.0.0.1:8080/api/v1",
        ]
        .contains(&base);
    let production = option_env!("PUSH_API_BASE").is_some_and(|allowed| {
        allowed.starts_with("https://") && allowed.trim_end_matches('/') == base
    });
    if !local && !production {
        return Err("API_ORIGIN_NOT_CONFIGURED".into());
    }
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|_| "HTTP_UNAVAILABLE")?;
    Ok((client, base.into()))
}
async fn response(response: reqwest::Response) -> Result<Value, String> {
    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|_| "INVALID_API_RESPONSE")?;
    if !status.is_success() {
        return Err(body
            .pointer("/error/code")
            .and_then(Value::as_str)
            .filter(|v| v.len() < 100)
            .unwrap_or("API_REQUEST_FAILED")
            .into());
    }
    body.get("data")
        .cloned()
        .ok_or_else(|| "INVALID_API_RESPONSE".into())
}
async fn fetch_run(
    http: &reqwest::Client,
    base: &str,
    token: &str,
    project: &str,
    run: &str,
) -> Result<Value, String> {
    uuid(project)?;
    uuid(run)?;
    let mut cursor = String::new();
    let mut seen = std::collections::HashSet::new();
    loop {
        let response = http
            .get(format!("{base}/projects/{project}/runs"))
            .bearer_auth(token)
            .query(&[("limit", "100"), ("cursor", cursor.as_str())])
            .send()
            .await
            .map_err(|_| "API_UNAVAILABLE")?;
        if !response.status().is_success() {
            return Err("RUN_NOT_ACCESSIBLE".into());
        }
        let body: Value = response.json().await.map_err(|_| "INVALID_API_RESPONSE")?;
        let values = body["data"].as_array().ok_or("INVALID_API_RESPONSE")?;
        if let Some(value) = values.iter().find(|v| v["id"] == run) {
            return Ok(value.clone());
        }
        if body.pointer("/page/hasMore") != Some(&Value::Bool(true)) {
            return Err("RUN_NOT_FOUND".into());
        }
        cursor = body
            .pointer("/page/nextCursor")
            .and_then(Value::as_str)
            .ok_or("INVALID_API_RESPONSE")?
            .into();
        if !seen.insert(cursor.clone()) {
            return Err("INVALID_API_RESPONSE".into());
        }
    }
}
async fn post(
    http: &reqwest::Client,
    url: String,
    token: &str,
    body: Value,
) -> Result<Value, String> {
    response(
        http.post(url)
            .bearer_auth(token)
            .header("Idempotency-Key", uuid::Uuid::new_v4().to_string())
            .json(&body)
            .send()
            .await
            .map_err(|_| "API_RESULT_UNKNOWN")?,
    )
    .await
}
async fn report_launch(
    http: &reqwest::Client,
    base: &str,
    token: &str,
    project: &str,
    run: &Value,
    status: &str,
    process: Option<Value>,
) -> Result<Value, String> {
    let mut body = json!({"expectedRevision":run["revision"],"deviceId":run["deviceId"],"payloadHash":run["payloadHash"],"launchStatus":status});
    if let Some(process) = process {
        body["process"] = process;
    }
    post(
        http,
        format!(
            "{base}/projects/{project}/runs/{}/launch",
            run["id"].as_str().ok_or("INVALID_API_RESPONSE")?
        ),
        token,
        body,
    )
    .await
}
fn open_terminal(root: &Path, run_id: &str) -> Result<(), String> {
    let executable = std::env::current_exe().map_err(|_| "EXECUTABLE_NOT_FOUND")?;
    let journal = root.join("native.sqlite");
    #[cfg(target_os = "macos")]
    {
        let path = root.join(format!("{run_id}.command"));
        let mut file = private_file(&path)?;
        let script = format!(
            "#!/bin/sh\nexec {} --push-run {} {}\n",
            safety::shell_quote(&executable.to_string_lossy()),
            safety::shell_quote(run_id),
            safety::shell_quote(&journal.to_string_lossy())
        );
        file.write_all(script.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|_| "TERMINAL_LAUNCH_FAILED")?;
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&path, fs::Permissions::from_mode(0o700))
            .map_err(|_| "TERMINAL_LAUNCH_FAILED")?;
        let status = std::process::Command::new("/usr/bin/open")
            .args(["-a", "Terminal"])
            .arg(&path)
            .status()
            .map_err(|_| "TERMINAL_LAUNCH_FAILED")?;
        if !status.success() {
            return Err("TERMINAL_LAUNCH_FAILED".into());
        }
        Ok(())
    }
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let quote = safety::powershell_quote;
        let path = root.join(format!("{run_id}.ps1"));
        let mut file = private_file(&path)?;
        let script = format!(
            "& {} --push-run {} {}\n",
            quote(&executable.to_string_lossy()),
            quote(run_id),
            quote(&journal.to_string_lossy())
        );
        file.write_all(script.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|_| "TERMINAL_LAUNCH_FAILED")?;
        std::process::Command::new("powershell.exe")
            .args(["-NoProfile", "-NoExit", "-File"])
            .arg(path)
            .creation_flags(0x00000010)
            .spawn()
            .map_err(|_| "TERMINAL_LAUNCH_FAILED")?;
        Ok(())
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = (executable, journal);
        Err("PLATFORM_NOT_SUPPORTED".into())
    }
}
#[tauri::command]
pub async fn launch_cli(
    state: State<'_, NativeState>,
    api_base: String,
    access_token: String,
    project_id: String,
    run_id: String,
    expected_revision: u64,
    approval_id: String,
) -> Result<Value, String> {
    uuid(&approval_id)?;
    let (http, base) = client(&api_base)?;
    let run = fetch_run(&http, &base, &access_token, &project_id, &run_id).await?;
    if run["state"] != "APPROVAL_REQUIRED" || run["revision"].as_u64() != Some(expected_revision) {
        return Err("APPROVAL_STALE".into());
    }
    let payload: cli::RunPayload =
        serde_json::from_value(run.clone()).map_err(|_| "INVALID_API_RESPONSE")?;
    let provider = run["provider"].as_str().ok_or("INVALID_API_RESPONSE")?;
    let hash = run["payloadHash"].as_str().ok_or("INVALID_API_RESPONSE")?;
    cli::validate_payload(provider, &payload, hash)?;
    let path = cli::executable_path(&payload.executable).ok_or("CLI_NOT_INSTALLED")?;
    let version = cli::probe(&path).await?;
    if !cli::supported_version(provider, &version) {
        return Err("UNSUPPORTED_CLI_VERSION".into());
    }
    let canonical =
        fs::canonicalize(&payload.working_directory).map_err(|_| "PROJECT_DIRECTORY_MISSING")?;
    if canonical.to_string_lossy() != payload.working_directory {
        return Err("PROJECT_DIRECTORY_CHANGED".into());
    }
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    let known = sqlx::query("SELECT id FROM projects WHERE id=? AND directory=?")
        .bind(&project_id)
        .bind(&payload.working_directory)
        .fetch_optional(&pool)
        .await
        .map_err(|_| "PROJECT_DIRECTORY_NOT_APPROVED")?;
    if known.is_none() {
        return Err("PROJECT_DIRECTORY_NOT_APPROVED".into());
    }
    let directory = crate::directory::DirectoryGuard::open(&canonical)?;
    let expected_identity: String =
        sqlx::query_scalar("SELECT identity FROM project_directories WHERE directory=?")
            .bind(&payload.working_directory)
            .fetch_one(&pool)
            .await
            .map_err(|_| "PROJECT_DIRECTORY_RESELECT_REQUIRED")?;
    if directory.identity() != expected_identity {
        return Err("PROJECT_DIRECTORY_CHANGED".into());
    }
    let id = device(&state.root)?;
    let stored = cli::StoredRun {
        payload,
        executable_path: path.to_string_lossy().into(),
        provider: provider.into(),
        project_id: project_id.clone(),
        directory_identity: directory.identity().into(),
    };
    let start_body = json!({"expectedRevision":expected_revision,"approvalId":approval_id,"detectedVersion":version,"deviceId":id});
    let request_key = storage::prepare_request(
        &pool,
        &run_id,
        &id,
        hash,
        &serde_json::to_string(&stored).map_err(|_| "INVALID_PAYLOAD")?,
        &start_body.to_string(),
    )
    .await?;
    let started = post_start(
        &http,
        format!("{base}/projects/{project_id}/runs/{run_id}/start"),
        &access_token,
        start_body,
        &pool,
        &run_id,
        &request_key,
    )
    .await?;
    if started["state"] != "RUNNING"
        || started["deviceId"] != id
        || started["payloadHash"] != hash
        || started["launchStatus"] != "NOT_CLAIMED"
    {
        return Err("APPROVAL_STALE".into());
    }
    let claimed = report_launch(
        &http,
        &base,
        &access_token,
        &project_id,
        &started,
        "CLAIMED",
        None,
    )
    .await?;
    storage::arm_request(&pool, &run_id, &request_key).await?;
    if let Err(error) = open_terminal(&state.root, &run_id) {
        sqlx::query("UPDATE runs SET state='UNKNOWN' WHERE id=?")
            .bind(&run_id)
            .execute(&pool)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
        let _ = report_launch(
            &http,
            &base,
            &access_token,
            &project_id,
            &claimed,
            "UNKNOWN",
            None,
        )
        .await;
        return Err(error);
    }
    pool.close().await;
    Ok(claimed)
}
async fn reconcile_uncertain(
    http: &reqwest::Client,
    base: &str,
    token: &str,
    project: &str,
    mut run: Value,
    pool: &SqlitePool,
    device: &str,
) -> Result<Value, String> {
    if run["state"] != "RUNNING" {
        return Ok(run);
    }
    if run["deviceId"] != device {
        return Err("APPROVAL_STALE".into());
    }
    let id = run["id"].as_str().ok_or("INVALID_API_RESPONSE")?;
    let record: Option<(String, String, String)> =
        sqlx::query_as("SELECT state,device,hash FROM runs WHERE id=?")
            .bind(id)
            .fetch_optional(pool)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    if record.as_ref().is_some_and(|(_, bound_device, hash)| {
        bound_device != device || run["payloadHash"] != *hash
    }) {
        return Err("APPROVAL_STALE".into());
    }
    let local = record.map(|(state, _, _)| state);
    if local.is_none() {
        storage::prepare(
            pool,
            id,
            device,
            run["payloadHash"].as_str().ok_or("INVALID_API_RESPONSE")?,
            "{}",
        )
        .await?;
    }
    if local.is_none()
        || matches!(local.as_deref(), Some("PREPARED" | "UNKNOWN" | "FAILED"))
        || run["launchStatus"] == "NOT_CLAIMED"
    {
        sqlx::query("UPDATE runs SET state='UNKNOWN' WHERE id=?")
            .bind(id)
            .execute(pool)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
        if run["launchStatus"] == "NOT_CLAIMED" {
            run = report_launch(http, base, token, project, &run, "CLAIMED", None).await?;
        }
        if run["launchStatus"] == "CLAIMED" || run["launchStatus"] == "STARTED" {
            run = report_launch(http, base, token, project, &run, "UNKNOWN", None).await?;
        }
    }
    Ok(run)
}
#[tauri::command]
pub async fn poll_cli(
    state: State<'_, NativeState>,
    api_base: String,
    access_token: String,
    project_id: String,
    run_id: String,
) -> Result<Value, String> {
    let (http, base) = client(&api_base)?;
    let mut run = fetch_run(&http, &base, &access_token, &project_id, &run_id).await?;
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    run = reconcile_uncertain(
        &http,
        &base,
        &access_token,
        &project_id,
        run,
        &pool,
        &device(&state.root)?,
    )
    .await?;
    let row = sqlx::query("SELECT state,pid,started_at,exit_code,device,hash FROM runs WHERE id=?")
        .bind(&run_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?
        .ok_or("LOCAL_RUN_NOT_FOUND")?;
    if run["deviceId"] != row.get::<String, _>("device")
        || run["payloadHash"] != row.get::<String, _>("hash")
    {
        return Err("APPROVAL_STALE".into());
    }
    let local: String = row.get("state");
    let pid: Option<i64> = row.get("pid");
    let started: Option<String> = row.get("started_at");
    let process = pid
        .zip(started.clone())
        .map(|(pid, started)| json!({"pid":pid,"startedAt":started}));
    let alive = pid
        .zip(started)
        .is_some_and(|(pid, time)| cli::process_start(pid as u32) == Some(time));
    if run["launchStatus"] == "CLAIMED" && (local == "STARTED" && alive || local == "FINISHED") {
        run = report_launch(
            &http,
            &base,
            &access_token,
            &project_id,
            &run,
            "STARTED",
            process,
        )
        .await?;
    }
    if ["CLAIMED", "STARTED"].contains(&run["launchStatus"].as_str().unwrap_or(""))
        && (local == "UNKNOWN"
            || local == "FAILED"
            || local == "LAUNCHING"
            || local == "STARTED" && !alive)
    {
        run = report_launch(
            &http,
            &base,
            &access_token,
            &project_id,
            &run,
            "UNKNOWN",
            None,
        )
        .await?;
    }
    run["native"] = json!({"state":local,"exitCode":row.get::<Option<i64>,_>("exit_code"),"outputCaptured":false});
    pool.close().await;
    Ok(run)
}
#[tauri::command]
pub async fn recover_cli(
    state: State<'_, NativeState>,
    api_base: String,
    access_token: String,
    project_id: String,
    run_id: String,
    decision: String,
    failure_reason: Option<String>,
) -> Result<Value, String> {
    let (http, base) = client(&api_base)?;
    let run = fetch_run(&http, &base, &access_token, &project_id, &run_id).await?;
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    let run = reconcile_uncertain(
        &http,
        &base,
        &access_token,
        &project_id,
        run,
        &pool,
        &device(&state.root)?,
    )
    .await?;
    if run["launchStatus"] != "UNKNOWN" {
        return Err("RUN_NOT_RECOVERABLE".into());
    }
    let mut body =
        json!({"expectedRevision":run["revision"],"deviceId":run["deviceId"],"decision":decision});
    if decision == "REATTACH" {
        let row = sqlx::query("SELECT pid,started_at FROM runs WHERE id=?")
            .bind(&run_id)
            .fetch_one(&pool)
            .await
            .map_err(|_| "LOCAL_RUN_NOT_FOUND")?;
        let pid: Option<i64> = row.get("pid");
        let started: Option<String> = row.get("started_at");
        if let Some((pid, started)) = pid.zip(started) {
            if cli::process_start(pid as u32) != Some(started.clone()) {
                return Err("PROCESS_IDENTITY_UNKNOWN".into());
            }
            body["process"] = json!({"pid":pid,"startedAt":started});
        } else {
            return Err("PROCESS_IDENTITY_UNKNOWN".into());
        }
    } else if decision == "MARK_FAILED" {
        let reason = failure_reason
            .filter(|v| !v.trim().is_empty() && v.len() <= 1000)
            .ok_or("FAILURE_REASON_REQUIRED")?;
        body["failureReason"] = reason.into();
    } else {
        return Err("INVALID_DECISION".into());
    }
    let result = post(
        &http,
        format!("{base}/projects/{project_id}/runs/{run_id}/recover"),
        &access_token,
        body,
    )
    .await?;
    sqlx::query("UPDATE runs SET state=? WHERE id=?")
        .bind(if decision == "REATTACH" {
            "STARTED"
        } else {
            "FAILED"
        })
        .bind(run_id)
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    pool.close().await;
    Ok(result)
}
#[tauri::command]
pub async fn complete_cli(
    app: AppHandle,
    state: State<'_, NativeState>,
    api_base: String,
    access_token: String,
    project_id: String,
    run_id: String,
) -> Result<Option<Value>, String> {
    let (http, base) = client(&api_base)?;
    let run = fetch_run(&http, &base, &access_token, &project_id, &run_id).await?;
    let pool = storage::database(&state.root.join("native.sqlite")).await?;
    let row = sqlx::query("SELECT state,exit_code,device,hash,payload FROM runs WHERE id=?")
        .bind(&run_id)
        .fetch_one(&pool)
        .await
        .map_err(|_| "LOCAL_RUN_NOT_FOUND")?;
    if row.get::<String, _>("state") != "FINISHED"
        || run["state"] != "RUNNING"
        || run["launchStatus"] != "STARTED"
        || run["deviceId"] != row.get::<String, _>("device")
        || run["payloadHash"] != row.get::<String, _>("hash")
    {
        return Err("RUN_NOT_FINISHED".into());
    }
    let stored: cli::StoredRun =
        serde_json::from_str(row.get("payload")).map_err(|_| "INVALID_LOCAL_RUN")?;
    let exit: Option<i64> = row.get("exit_code");
    let exit = exit.ok_or("PROCESS_RESULT_UNKNOWN")?;
    let commit_sha = match cli::project_commit(&stored.payload.working_directory).await {
        Ok(sha) => Some(sha),
        Err(error) if exit == 0 => return Err(error),
        Err(_) => None,
    };
    let mut hashes = Vec::new();
    for label in [
        "실제 표준 출력 로그 선택 (stdout)",
        "실제 표준 오류 로그 선택 (stderr)",
    ] {
        let Some(selected) = app
            .dialog()
            .file()
            .set_title(label)
            .add_filter("Text log", &["txt", "log"])
            .blocking_pick_file()
        else {
            return Ok(None);
        };
        let path = selected.into_path().map_err(|_| "INVALID_PATH")?;
        let file = fs::File::open(path).map_err(|_| "FILE_READ_FAILED")?;
        let mut bytes = Vec::new();
        file.take(20 * 1024 * 1024 + 1)
            .read_to_end(&mut bytes)
            .map_err(|_| "FILE_READ_FAILED")?;
        if bytes.len() > 20 * 1024 * 1024 || std::str::from_utf8(&bytes).is_err() {
            return Err("INVALID_LOG_FILE".into());
        }
        hashes.push(format!("{:x}", Sha256::digest(&bytes)));
    }
    let result = post(
        &http,
        format!("{base}/projects/{project_id}/runs/{run_id}/result"),
        &access_token,
        result_payload(run["revision"].clone(), exit, &hashes, commit_sha),
    )
    .await?;
    pool.close().await;
    Ok(Some(result))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn local_drafts_are_atomic_account_isolated_and_survive_restart() {
        let dir = tempfile::tempdir().unwrap();
        let first = uuid::Uuid::new_v4().to_string();
        let second = uuid::Uuid::new_v4().to_string();
        write_entries(
            dir.path(),
            &first,
            vec![
                Entry {
                    key: "draft".into(),
                    value: "{\"text\":\"saved\"}".into(),
                },
                Entry {
                    key: "outbox".into(),
                    value: "[1]".into(),
                },
            ],
        )
        .await
        .unwrap();
        let first_db = account_db(dir.path(), &first).await.unwrap();
        assert_eq!(
            sqlx::query_scalar::<_, i64>("SELECT count(*) FROM records")
                .fetch_one(&first_db)
                .await
                .unwrap(),
            2
        );
        first_db.close().await;
        assert!(write_entries(
            dir.path(),
            &first,
            vec![
                Entry {
                    key: "draft".into(),
                    value: "{}".into()
                },
                Entry {
                    key: "bad".into(),
                    value: "invalid".into()
                }
            ]
        )
        .await
        .is_err());
        let first_db = account_db(dir.path(), &first).await.unwrap();
        assert_eq!(
            sqlx::query_scalar::<_, String>("SELECT value FROM records WHERE key='draft'")
                .fetch_one(&first_db)
                .await
                .unwrap(),
            "{\"text\":\"saved\"}"
        );
        let second_db = account_db(dir.path(), &second).await.unwrap();
        assert_eq!(
            sqlx::query_scalar::<_, i64>("SELECT count(*) FROM records")
                .fetch_one(&second_db)
                .await
                .unwrap(),
            0
        );
        assert!(account_db(dir.path(), "../escape").await.is_err());
    }
    #[test]
    fn arbitrary_api_origins_are_rejected_before_token_transmission() {
        for origin in [
            "http://evil.test/api/v1",
            "https://evil.test/api/v1",
            "http://localhost:8080.evil.test/api/v1",
            "file:///tmp",
        ] {
            assert!(client(origin).is_err());
        }
    }
}

fn result_payload(revision: Value, exit: i64, hashes: &[String], commit: Option<String>) -> Value {
    let mut body = json!({"expectedRevision":revision,"exitCode":exit,"stdoutHash":hashes[0],"stderrHash":hashes[1]});
    if let Some(sha) = commit {
        body["commitSha"] = sha.into();
    }
    body
}
#[cfg(test)]
mod fault_tests {
    use super::*;
    use std::io::BufRead;
    fn endpoint(mut run: Value, count: usize) -> (String, std::thread::JoinHandle<Vec<Value>>) {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let handle = std::thread::spawn(move || {
            let mut bodies = Vec::new();
            for _ in 0..count {
                let (mut stream, _) = listener.accept().unwrap();
                stream
                    .set_read_timeout(Some(std::time::Duration::from_secs(5)))
                    .unwrap();
                let mut reader = std::io::BufReader::new(stream.try_clone().unwrap());
                let mut size = 0;
                loop {
                    let mut line = String::new();
                    reader.read_line(&mut line).unwrap();
                    if line == "\r\n" {
                        break;
                    }
                    if line.to_lowercase().starts_with("content-length:") {
                        size = line.split(':').nth(1).unwrap().trim().parse().unwrap();
                    }
                }
                let mut bytes = vec![0; size];
                reader.read_exact(&mut bytes).unwrap();
                let body: Value = serde_json::from_slice(&bytes).unwrap();
                if let Some(status) = body.get("launchStatus") {
                    run["launchStatus"] = status.clone();
                }
                run["revision"] = json!(run["revision"].as_u64().unwrap() + 1);
                bodies.push(body);
                let response = json!({"data":run}).to_string();
                write!(stream,"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",response.len(),response).unwrap();
            }
            bodies
        });
        (base, handle)
    }
    #[tokio::test]
    async fn interruptions_before_local_claim_and_after_server_start_reconcile_without_spawn() {
        for (intent, status, expected) in [
            (false, "NOT_CLAIMED", vec!["CLAIMED", "UNKNOWN"]),
            (true, "NOT_CLAIMED", vec!["CLAIMED", "UNKNOWN"]),
            (true, "CLAIMED", vec!["UNKNOWN"]),
        ] {
            let dir = tempfile::tempdir().unwrap();
            let pool = storage::database(&dir.path().join("runs.db"))
                .await
                .unwrap();
            storage::recover_after_restart(&pool).await.unwrap();
            let id = uuid::Uuid::new_v4().to_string();
            let device = uuid::Uuid::new_v4().to_string();
            if intent {
                storage::prepare(&pool, &id, &device, "hash", "{}")
                    .await
                    .unwrap();
            }
            let run = json!({"id":id,"revision":3,"state":"RUNNING","deviceId":device,"payloadHash":"hash","launchStatus":status});
            let (base, server) = endpoint(run.clone(), expected.len());
            let reconciled = reconcile_uncertain(
                &reqwest::Client::new(),
                &base,
                "fixture-token",
                "project",
                run,
                &pool,
                &device,
            )
            .await
            .unwrap();
            assert_eq!(reconciled["launchStatus"], "UNKNOWN");
            assert!(storage::arm(&pool, &id).await.is_err());
            assert!(storage::begin_execution(&pool, &id).await.is_err());
            let requests = server.join().unwrap();
            assert_eq!(
                requests
                    .iter()
                    .map(|b| b["launchStatus"].as_str().unwrap())
                    .collect::<Vec<_>>(),
                expected
            );
            for (index, request) in requests.iter().enumerate() {
                assert_eq!(request["expectedRevision"], json!(3 + index));
                assert_eq!(request["deviceId"], device);
                assert_eq!(request["payloadHash"], "hash");
            }
        }
    }
    #[tokio::test]
    async fn completed_project_result_transmits_actual_git_commit() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().to_str().unwrap();
        for args in [
            vec!["init", "--quiet"],
            vec![
                "-c",
                "user.name=Fixture",
                "-c",
                "user.email=fixture@example.test",
                "commit",
                "--allow-empty",
                "--no-gpg-sign",
                "-m",
                "fixture",
                "--quiet",
            ],
        ] {
            assert!(std::process::Command::new("git")
                .arg("-C")
                .arg(path)
                .args(args)
                .status()
                .unwrap()
                .success());
        }
        let expected = std::process::Command::new("git")
            .args(["-C", path, "rev-parse", "HEAD"])
            .output()
            .unwrap();
        let expected = String::from_utf8(expected.stdout)
            .unwrap()
            .trim()
            .to_string();
        let sha = cli::project_commit(path).await.unwrap();
        let (base, server) = endpoint(json!({"revision":4}), 1);
        post(
            &reqwest::Client::new(),
            format!("{base}/result"),
            "fixture-token",
            result_payload(json!(4), 0, &["a".repeat(64), "b".repeat(64)], Some(sha)),
        )
        .await
        .unwrap();
        let requests = server.join().unwrap();
        assert_eq!(requests[0]["commitSha"], expected);
        assert_eq!(requests[0]["exitCode"], 0);
        let nested = dir.path().join("not-a-repository");
        fs::create_dir(&nested).unwrap();
        assert!(cli::project_commit(nested.to_str().unwrap()).await.is_err());
        let empty = tempfile::tempdir().unwrap();
        assert!(cli::project_commit(empty.path().to_str().unwrap())
            .await
            .is_err());
    }
}

async fn post_start(
    http: &reqwest::Client,
    url: String,
    token: &str,
    body: Value,
    pool: &SqlitePool,
    id: &str,
    key: &str,
) -> Result<Value, String> {
    let response = http
        .post(url)
        .bearer_auth(token)
        .header("Idempotency-Key", key)
        .json(&body)
        .send()
        .await
        .map_err(|_| "API_RESULT_UNKNOWN")?;
    let status = response.status();
    let value: Value = response.json().await.map_err(|_| "API_RESULT_UNKNOWN")?;
    if status.is_success() {
        return value
            .get("data")
            .cloned()
            .ok_or_else(|| "INVALID_API_RESPONSE".into());
    }
    let code = value
        .pointer("/error/code")
        .and_then(Value::as_str)
        .filter(|v| v.len() < 100)
        .ok_or("API_RESULT_UNKNOWN")?;
    if status.is_client_error()
        && status.as_u16() != 408
        && status.as_u16() != 429
        && code != "IDEMPOTENCY_CONFLICT"
    {
        storage::rejected_request(pool, id, key).await?;
    }
    Err(code.into())
}
#[cfg(test)]
mod start_request_tests {
    use super::*;
    #[tokio::test]
    async fn definitive_http_rejection_allows_new_approval_but_network_failure_keeps_key() {
        use std::io::BufRead;
        let dir = tempfile::tempdir().unwrap();
        let pool = storage::database(&dir.path().join("db")).await.unwrap();
        let body = json!({"approvalId":"expired"});
        let key = storage::prepare_request(&pool, "run", "device", "hash", "{}", &body.to_string())
            .await
            .unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        let server = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut reader = std::io::BufReader::new(stream.try_clone().unwrap());
            let mut size = 0;
            let mut received_key = String::new();
            loop {
                let mut line = String::new();
                reader.read_line(&mut line).unwrap();
                if line == "\r\n" {
                    break;
                }
                if line.to_lowercase().starts_with("content-length:") {
                    size = line.split(':').nth(1).unwrap().trim().parse().unwrap();
                }
                if line.to_lowercase().starts_with("idempotency-key:") {
                    received_key = line.split(':').nth(1).unwrap().trim().into();
                }
            }
            let mut bytes = vec![0; size];
            reader.read_exact(&mut bytes).unwrap();
            let error = json!({"error":{"code":"APPROVAL_STALE"}}).to_string();
            write!(stream,"HTTP/1.1 409 Conflict\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",error.len(),error).unwrap();
            received_key
        });
        let http = reqwest::Client::new();
        assert_eq!(
            post_start(&http, url, "fixture", body, &pool, "run", &key)
                .await
                .unwrap_err(),
            "APPROVAL_STALE"
        );
        assert_eq!(server.join().unwrap(), key);
        let fresh = json!({"approvalId":"fresh"});
        let next =
            storage::prepare_request(&pool, "run", "device", "hash", "{}", &fresh.to_string())
                .await
                .unwrap();
        assert_ne!(next, key);
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let unavailable = format!("http://{}", listener.local_addr().unwrap());
        drop(listener);
        assert_eq!(
            post_start(
                &http,
                unavailable,
                "fixture",
                fresh.clone(),
                &pool,
                "run",
                &next
            )
            .await
            .unwrap_err(),
            "API_RESULT_UNKNOWN"
        );
        assert_eq!(
            storage::prepare_request(&pool, "run", "device", "hash", "{}", &fresh.to_string())
                .await
                .unwrap(),
            next
        );
    }
}
