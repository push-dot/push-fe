mod browser;
pub mod cli;
mod commands;
pub mod directory;
pub mod safety;
pub mod storage;
mod updater;

use tauri::Manager;
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            updater::setup(app.handle())?;
            let root = app.path().app_data_dir()?;
            std::fs::create_dir_all(&root)?;
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                std::fs::set_permissions(&root, std::fs::Permissions::from_mode(0o700))?;
            }
            tauri::async_runtime::block_on(async {
                let pool = storage::database(&root.join("native.sqlite")).await?;
                storage::recover_after_restart(&pool).await?;
                pool.close().await;
                Ok::<(), String>(())
            })
            .map_err(std::io::Error::other)?;
            app.manage(commands::NativeState { root });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::device_id,
            commands::local_read,
            commands::local_write,
            commands::local_write_batch,
            commands::detect_clis,
            commands::import_source,
            commands::save_export,
            commands::copy_project,
            commands::launch_cli,
            commands::poll_cli,
            commands::recover_cli,
            commands::complete_cli,
            browser::open_job_browser,
            browser::collect_job_page,
            updater::check_update,
            updater::install_update
        ])
        .run(tauri::generate_context!())
        .expect("Push desktop failed to start");
}
