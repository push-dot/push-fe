use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;

fn configuration(
    endpoint: Option<&str>,
    key: Option<&str>,
) -> Result<(tauri::Url, String), String> {
    let endpoint = endpoint.ok_or("UPDATER_NOT_CONFIGURED")?;
    let key = key
        .filter(|v| !v.trim().is_empty())
        .ok_or("UPDATER_NOT_CONFIGURED")?;
    let url = tauri::Url::parse(endpoint).map_err(|_| "UPDATER_INVALID_CONFIGURATION")?;
    if url.scheme() != "https"
        || !url.username().is_empty()
        || url.password().is_some()
        || url.host_str().is_none()
    {
        return Err("UPDATER_INVALID_CONFIGURATION".into());
    }
    Ok((url, key.into()))
}
pub fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if let Ok((_, key)) = configuration(
        option_env!("PUSH_UPDATER_ENDPOINT"),
        option_env!("PUSH_UPDATER_PUBLIC_KEY"),
    ) {
        app.plugin(tauri_plugin_updater::Builder::new().pubkey(key).build())?;
    }
    Ok(())
}
#[tauri::command]
pub async fn check_update(app: AppHandle) -> Result<Value, String> {
    let (url, _) = configuration(
        option_env!("PUSH_UPDATER_ENDPOINT"),
        option_env!("PUSH_UPDATER_PUBLIC_KEY"),
    )?;
    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|_| "UPDATER_INVALID_CONFIGURATION")?
        .build()
        .map_err(|_| "UPDATER_INVALID_CONFIGURATION")?
        .check()
        .await
        .map_err(|_| "UPDATE_CHECK_FAILED")?;
    Ok(match update {
        Some(update) => json!({"available":true,"version":update.version,"body":update.body}),
        None => json!({"available":false}),
    })
}
#[tauri::command]
pub async fn install_update(app: AppHandle, expected_version: String) -> Result<(), String> {
    let (url, _) = configuration(
        option_env!("PUSH_UPDATER_ENDPOINT"),
        option_env!("PUSH_UPDATER_PUBLIC_KEY"),
    )?;
    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|_| "UPDATER_INVALID_CONFIGURATION")?
        .build()
        .map_err(|_| "UPDATER_INVALID_CONFIGURATION")?
        .check()
        .await
        .map_err(|_| "UPDATE_CHECK_FAILED")?
        .ok_or("UPDATE_NOT_AVAILABLE")?;
    if update.version != expected_version {
        return Err("UPDATE_VERSION_CHANGED".into());
    }
    if update.download_url.scheme() != "https" {
        return Err("UPDATE_INSECURE_DOWNLOAD".into());
    }
    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|_| "UPDATE_SIGNATURE_OR_INSTALL_FAILED")?;
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn missing_key_and_insecure_feeds_fail_closed() {
        for (endpoint, key) in [
            (None, None),
            (Some("https://example.com/latest.json"), None),
            (Some("http://example.com/latest.json"), Some("key")),
            (
                Some("https://user:secret@example.com/latest.json"),
                Some("key"),
            ),
        ] {
            assert!(configuration(endpoint, key).is_err());
        }
    }
}
