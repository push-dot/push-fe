use serde_json::{json, Value};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
fn page_url(value: &str) -> Result<tauri::Url, String> {
    let url = tauri::Url::parse(value).map_err(|_| "INVALID_PAGE_URL")?;
    if !["http", "https"].contains(&url.scheme())
        || !url.username().is_empty()
        || url.password().is_some()
        || url.host_str().is_none()
    {
        return Err("INVALID_PAGE_URL".into());
    }
    Ok(url)
}
#[tauri::command]
pub async fn open_job_browser(app: AppHandle, url: String) -> Result<(), String> {
    let url = page_url(&url)?;
    if let Some(window) = app.get_webview_window("job-source") {
        window
            .navigate(url)
            .map_err(|_| "BROWSER_NAVIGATION_FAILED")?;
        window.set_focus().map_err(|_| "BROWSER_UNAVAILABLE")?;
        return Ok(());
    }
    WebviewWindowBuilder::new(&app, "job-source", WebviewUrl::External(url))
        .title("Push · 공고 원문")
        .inner_size(1000., 760.)
        .on_navigation(|url| page_url(url.as_str()).is_ok())
        .build()
        .map_err(|_| "BROWSER_UNAVAILABLE")?;
    Ok(())
}
#[tauri::command]
pub async fn collect_job_page(app: AppHandle) -> Result<Value, String> {
    let window = app
        .get_webview_window("job-source")
        .ok_or("JOB_BROWSER_NOT_OPEN")?;
    let (sender, receiver) = tokio::sync::oneshot::channel();
    let sender = std::sync::Mutex::new(Some(sender));
    window.eval_with_callback("(()=>({sourceUrl:location.href,title:document.title.slice(0,200),sourceText:(document.querySelector('main')||document.body).innerText.slice(0,100001)}))()",move |value|{if let Ok(mut sender)=sender.lock(){if let Some(sender)=sender.take(){let _=sender.send(value);}}}).map_err(|_|"DOM_COLLECTION_FAILED")?;
    let value = tokio::time::timeout(std::time::Duration::from_secs(10), receiver)
        .await
        .map_err(|_| "DOM_COLLECTION_TIMEOUT")?
        .map_err(|_| "DOM_COLLECTION_FAILED")?;
    let value: Value = serde_json::from_str(&value).map_err(|_| "DOM_COLLECTION_FAILED")?;
    let source_url = value["sourceUrl"].as_str().ok_or("DOM_COLLECTION_FAILED")?;
    page_url(source_url)?;
    let text = value["sourceText"]
        .as_str()
        .ok_or("DOM_COLLECTION_FAILED")?
        .trim();
    if text.is_empty() || text.chars().count() > 100000 {
        return Err("DOM_TEXT_EMPTY_OR_TOO_LARGE".into());
    }
    Ok(
        json!({"sourceUrl":source_url,"sourceText":text,"title":value["title"].as_str().unwrap_or("")}),
    )
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn remote_browser_has_no_local_file_or_credential_urls() {
        for url in [
            "file:///etc/passwd",
            "javascript:alert(1)",
            "https://user:secret@example.com",
            "push://auth/callback",
        ] {
            assert!(page_url(url).is_err());
        }
        assert!(page_url("https://example.com/jobs/1").is_ok());
    }
}
