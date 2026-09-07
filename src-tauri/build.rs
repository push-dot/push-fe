fn main() {
    for key in [
        "PUSH_API_BASE",
        "PUSH_UPDATER_ENDPOINT",
        "PUSH_UPDATER_PUBLIC_KEY",
    ] {
        println!("cargo:rerun-if-env-changed={key}");
    }
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "device_id",
            "local_read",
            "local_write",
            "local_write_batch",
            "detect_clis",
            "import_source",
            "save_export",
            "copy_project",
            "launch_cli",
            "poll_cli",
            "recover_cli",
            "complete_cli",
            "open_job_browser",
            "collect_job_page",
            "check_update",
            "install_update",
        ]),
    ))
    .expect("build configuration invalid");
}
