use serde::{Deserialize, Serialize};
use std::path::Path;
#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunPayload {
    pub executable: String,
    pub arguments: Vec<String>,
    pub working_directory: String,
    pub prompt: String,
}
pub fn validate_payload(provider: &str, payload: &RunPayload, hash: &str) -> Result<(), String> {
    let expected = match provider {
        "CODEX" => "codex",
        "CLAUDE_CODE" => "claude",
        "GROK_BUILD" => "grok",
        _ => return Err("UNSUPPORTED_CLI".into()),
    };
    if payload.executable != expected
        || payload.arguments != [payload.prompt.clone()]
        || payload.prompt.trim().is_empty()
        || payload.prompt.starts_with('-')
        || payload.prompt.contains('\0')
        || payload.prompt.len() > 100000
        || !Path::new(&payload.working_directory).is_absolute()
        || crate::safety::payload_hash(
            &payload.executable,
            &payload.arguments,
            &payload.working_directory,
            &payload.prompt,
        ) != hash
    {
        return Err("APPROVAL_STALE".into());
    }
    Ok(())
}
pub async fn probe(path: &Path) -> Result<String, String> {
    let output = tokio::time::timeout(
        std::time::Duration::from_secs(4),
        tokio::process::Command::new(path)
            .arg("--version")
            .kill_on_drop(true)
            .output(),
    )
    .await
    .map_err(|_| "CLI_TIMEOUT")?
    .map_err(|_| "CLI_NOT_INSTALLED")?;
    if !output.status.success() || output.stdout.len() > 1024 {
        return Err("CLI_VERSION_FAILED".into());
    }
    let version = String::from_utf8(output.stdout)
        .map_err(|_| "CLI_VERSION_FAILED")?
        .trim()
        .to_string();
    if version.is_empty() || version.len() > 100 || version.chars().any(char::is_control) {
        return Err("CLI_VERSION_FAILED".into());
    }
    Ok(version)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn missing_cli_is_not_installed() {
        assert!(probe(Path::new("/nonexistent/push-test-cli"))
            .await
            .is_err());
    }
    #[test]
    fn modified_or_option_payload_is_rejected() {
        let p = RunPayload {
            executable: "sh".into(),
            arguments: vec!["-c".into()],
            working_directory: "/tmp".into(),
            prompt: "hello".into(),
        };
        assert!(validate_payload("CODEX", &p, "forged").is_err());
    }
    #[cfg(unix)]
    #[tokio::test]
    async fn denied_and_failed_executables_are_not_installed() {
        use std::os::unix::fs::PermissionsExt;
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("fixture");
        std::fs::write(&p, "#!/bin/sh\nexit 7\n").unwrap();
        assert!(probe(&p).await.is_err());
        std::fs::set_permissions(&p, std::fs::Permissions::from_mode(0o700)).unwrap();
        assert!(probe(&p).await.is_err());
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Detection {
    pub provider: String,
    pub installed: bool,
    pub path: Option<String>,
    pub version: Option<String>,
    pub supported: bool,
}
pub fn executable_path(name: &str) -> Option<std::path::PathBuf> {
    let mut paths: Vec<_> = std::env::split_paths(&std::env::var_os("PATH").unwrap_or_default())
        .filter(|p| p.is_absolute())
        .collect();
    paths.extend(["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"].map(std::path::PathBuf::from));
    if let Some(home) = std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE")) {
        for suffix in [".local/bin", ".cargo/bin", "AppData/Roaming/npm"] {
            paths.push(Path::new(&home).join(suffix));
        }
    }
    for dir in paths {
        let path = dir.join(if cfg!(windows) {
            format!("{name}.exe")
        } else {
            name.into()
        });
        if path.is_file() {
            return std::fs::canonicalize(path).ok();
        }
    }
    None
}
pub fn supported_version(provider: &str, version: &str) -> bool {
    let major = version
        .split_whitespace()
        .find(|v| v.as_bytes().first().is_some_and(u8::is_ascii_digit))
        .and_then(|v| v.split('.').next())
        .and_then(|v| v.parse::<u32>().ok());
    matches!(
        (provider, major),
        ("CODEX", Some(0 | 1)) | ("CLAUDE_CODE", Some(2)) | ("GROK_BUILD", Some(0))
    )
}
pub async fn detections() -> Vec<Detection> {
    let mut result = Vec::new();
    for (provider, name) in [
        ("CODEX", "codex"),
        ("CLAUDE_CODE", "claude"),
        ("GROK_BUILD", "grok"),
    ] {
        let path = executable_path(name);
        let version = match &path {
            Some(p) => probe(p).await.ok(),
            None => None,
        };
        let supported = version
            .as_ref()
            .is_some_and(|v| supported_version(provider, v));
        result.push(Detection {
            provider: provider.into(),
            installed: version.is_some(),
            path: path.map(|p| p.to_string_lossy().into()),
            version,
            supported,
        });
    }
    result
}
pub fn process_start(pid: u32) -> Option<String> {
    let mut system = sysinfo::System::new();
    let pid = sysinfo::Pid::from_u32(pid);
    system.refresh_processes(sysinfo::ProcessesToUpdate::Some(&[pid]), true);
    let seconds = system.process(pid)?.start_time();
    chrono::DateTime::from_timestamp(seconds as i64, 0)
        .map(|v| v.to_rfc3339_opts(chrono::SecondsFormat::Secs, true))
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredRun {
    pub payload: RunPayload,
    pub executable_path: String,
    pub provider: String,
    pub project_id: String,
    #[serde(default)]
    pub directory_identity: String,
}
pub async fn run_in_terminal(id: &str, journal: &Path) -> Result<(), String> {
    use sqlx::Row;
    uuid::Uuid::parse_str(id).map_err(|_| "INVALID_RUN")?;
    let pool = crate::storage::database(journal).await?;
    let row = sqlx::query("SELECT payload,hash FROM runs WHERE id=?")
        .bind(id)
        .fetch_one(&pool)
        .await
        .map_err(|_| "RUN_NOT_CLAIMED")?;
    let stored: StoredRun = serde_json::from_str(row.get("payload")).map_err(|_| "INVALID_RUN")?;
    validate_payload(&stored.provider, &stored.payload, row.get("hash"))?;
    let directory =
        crate::directory::DirectoryGuard::open(Path::new(&stored.payload.working_directory));
    let directory = match directory {
        Ok(directory) if directory.identity() == stored.directory_identity => directory,
        _ => {
            sqlx::query("UPDATE runs SET state='UNKNOWN' WHERE id=? AND state='CLAIMED'")
                .bind(id)
                .execute(&pool)
                .await
                .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
            return Err("PROJECT_DIRECTORY_CHANGED".into());
        }
    };
    crate::storage::begin_execution(&pool, id).await?;
    let mut command = tokio::process::Command::new(&stored.executable_path);
    command.args(&stored.payload.arguments);
    directory.configure(&mut command, Path::new(&stored.payload.working_directory));
    let result = command.spawn();
    let mut child = match result {
        Ok(child) => child,
        Err(_) => {
            sqlx::query("UPDATE runs SET state='FAILED',exit_code=-1 WHERE id=?")
                .bind(id)
                .execute(&pool)
                .await
                .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
            return Err("CLI_SPAWN_FAILED".into());
        }
    };
    let pid = std::process::id();
    let started = process_start(pid).ok_or("PROCESS_IDENTITY_UNKNOWN")?;
    sqlx::query("UPDATE runs SET state='STARTED',pid=?,started_at=? WHERE id=?")
        .bind(pid as i64)
        .bind(started)
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    let status = child.wait().await.map_err(|_| "CLI_WAIT_FAILED")?;
    sqlx::query("UPDATE runs SET state='FINISHED',exit_code=? WHERE id=?")
        .bind(status.code().unwrap_or(-1))
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    pool.close().await;
    Ok(())
}
#[cfg(test)]
mod runner_tests {
    use super::*;
    #[cfg(unix)]
    #[tokio::test]
    async fn controlled_runner_preserves_arguments_exit_code_and_prevents_replay() {
        use std::os::unix::fs::PermissionsExt;
        let dir = tempfile::tempdir().unwrap();
        let root = std::fs::canonicalize(dir.path()).unwrap();
        let fixture = root.join("codex-fixture");
        std::fs::write(
            &fixture,
            "#!/bin/sh\nprintf '%s' \"$1\" > actual.txt\nexit 7\n",
        )
        .unwrap();
        std::fs::set_permissions(&fixture, std::fs::Permissions::from_mode(0o700)).unwrap();
        let prompt = "literal ' ; $(false) & < > ".to_string();
        let payload = RunPayload {
            executable: "codex".into(),
            arguments: vec![prompt.clone()],
            working_directory: root.to_string_lossy().into(),
            prompt: prompt.clone(),
        };
        let hash = crate::safety::payload_hash(
            &payload.executable,
            &payload.arguments,
            &payload.working_directory,
            &payload.prompt,
        );
        let stored = StoredRun {
            payload,
            executable_path: fixture.to_string_lossy().into(),
            provider: "CODEX".into(),
            project_id: uuid::Uuid::new_v4().to_string(),
            directory_identity: crate::directory::DirectoryGuard::open(&root)
                .unwrap()
                .identity()
                .into(),
        };
        let id = uuid::Uuid::new_v4().to_string();
        let journal = root.join("native.sqlite");
        let pool = crate::storage::database(&journal).await.unwrap();
        crate::storage::claim(
            &pool,
            &id,
            "device",
            &hash,
            &serde_json::to_string(&stored).unwrap(),
        )
        .await
        .unwrap();
        run_in_terminal(&id, &journal).await.unwrap();
        assert_eq!(
            std::fs::read_to_string(root.join("actual.txt")).unwrap(),
            prompt
        );
        let result: (String, i64) = sqlx::query_as("SELECT state,exit_code FROM runs WHERE id=?")
            .bind(&id)
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(result, ("FINISHED".into(), 7));
        assert!(run_in_terminal(&id, &journal).await.is_err());
    }
}
pub async fn project_commit(directory: &str) -> Result<String, String> {
    let root = tokio::process::Command::new("git")
        .env_remove("GIT_DIR")
        .env_remove("GIT_WORK_TREE")
        .args(["-C", directory, "rev-parse", "--show-toplevel"])
        .output()
        .await
        .map_err(|_| "PROJECT_COMMIT_REQUIRED")?;
    let root = String::from_utf8(root.stdout).map_err(|_| "PROJECT_COMMIT_REQUIRED")?;
    if !root.trim().is_empty()
        && std::fs::canonicalize(root.trim()).ok() != std::fs::canonicalize(directory).ok()
    {
        return Err("PROJECT_COMMIT_REQUIRED".into());
    }
    let output = tokio::process::Command::new("git")
        .env_remove("GIT_DIR")
        .env_remove("GIT_WORK_TREE")
        .args(["-C", directory, "rev-parse", "--verify", "HEAD^{commit}"])
        .output()
        .await
        .map_err(|_| "PROJECT_COMMIT_REQUIRED")?;
    let sha = String::from_utf8(output.stdout)
        .map_err(|_| "PROJECT_COMMIT_REQUIRED")?
        .trim()
        .to_string();
    if !output.status.success() || sha.len() != 40 || !sha.bytes().all(|c| c.is_ascii_hexdigit()) {
        return Err("PROJECT_COMMIT_REQUIRED".into());
    }
    Ok(sha)
}
#[cfg(all(test, unix))]
mod replacement_tests {
    use super::*;
    #[tokio::test]
    async fn replacing_approved_directory_never_executes() {
        use std::os::unix::fs::PermissionsExt;
        for symlink in [false, true] {
            let temp = tempfile::tempdir().unwrap();
            let root = std::fs::canonicalize(temp.path()).unwrap();
            let approved = root.join("approved");
            let outside = root.join("outside");
            std::fs::create_dir(&approved).unwrap();
            std::fs::create_dir(&outside).unwrap();
            let executable = root.join("fixture");
            std::fs::write(&executable, "#!/bin/sh\ntouch unauthorized-marker\n").unwrap();
            std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
            let payload = RunPayload {
                executable: "codex".into(),
                arguments: vec!["fixture".into()],
                working_directory: approved.to_string_lossy().into(),
                prompt: "fixture".into(),
            };
            let hash = crate::safety::payload_hash(
                "codex",
                &payload.arguments,
                &payload.working_directory,
                &payload.prompt,
            );
            let stored = StoredRun {
                payload,
                executable_path: executable.to_string_lossy().into(),
                provider: "CODEX".into(),
                project_id: "fixture".into(),
                directory_identity: crate::directory::DirectoryGuard::open(&approved)
                    .unwrap()
                    .identity()
                    .into(),
            };
            let journal = root.join("db");
            let pool = crate::storage::database(&journal).await.unwrap();
            let id = uuid::Uuid::new_v4().to_string();
            crate::storage::claim(
                &pool,
                &id,
                "device",
                &hash,
                &serde_json::to_string(&stored).unwrap(),
            )
            .await
            .unwrap();
            std::fs::rename(&approved, root.join("original")).unwrap();
            if symlink {
                std::os::unix::fs::symlink(&outside, &approved).unwrap();
            } else {
                std::fs::rename(&outside, &approved).unwrap();
            }
            assert!(run_in_terminal(&id, &journal).await.is_err());
            assert!(!approved.join("unauthorized-marker").exists());
            assert_eq!(
                sqlx::query_scalar::<_, String>("SELECT state FROM runs WHERE id=?")
                    .bind(&id)
                    .fetch_one(&pool)
                    .await
                    .unwrap(),
                "UNKNOWN"
            );
        }
    }
}
