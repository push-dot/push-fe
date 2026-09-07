#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    let args: Vec<_> = std::env::args().collect();
    if args.get(1).is_some_and(|v| v == "--push-run") {
        if args.len() != 4 {
            std::process::exit(2);
        }
        #[cfg(windows)]
        unsafe {
            windows_sys::Win32::System::Console::AttachConsole(u32::MAX);
        }
        let runtime = tokio::runtime::Runtime::new().expect("runtime unavailable");
        if let Err(error) = runtime.block_on(push_desktop::cli::run_in_terminal(
            &args[2],
            std::path::Path::new(&args[3]),
        )) {
            eprintln!("{error}");
            std::process::exit(1);
        }
        return;
    }
    push_desktop::run();
}
