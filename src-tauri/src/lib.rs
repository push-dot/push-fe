#[tauri::command]
fn read_dropped_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_download(app: tauri::AppHandle, bytes: Vec<u8>, name: String) -> Result<String, String> {
    use tauri::Manager;
    let file_name = std::path::Path::new(&name)
        .file_name()
        .ok_or_else(|| "invalid file name".to_string())?;
    let dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let path = dir.join(file_name);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init());

    #[cfg(debug_assertions)]
    let builder = builder.plugin(tauri_plugin_wdio_webdriver::init());

    builder
        .invoke_handler(tauri::generate_handler![read_dropped_file, save_download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
