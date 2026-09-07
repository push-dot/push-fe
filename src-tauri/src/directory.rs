use std::{fs::File, path::Path};

pub struct DirectoryGuard {
    files: Vec<File>,
    identity: String,
}
impl DirectoryGuard {
    pub fn open(path: &Path) -> Result<Self, String> {
        if !path.is_absolute() {
            return Err("PROJECT_DIRECTORY_CHANGED".into());
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::{MetadataExt, OpenOptionsExt};
            let file = std::fs::OpenOptions::new()
                .read(true)
                .custom_flags(libc::O_DIRECTORY | libc::O_NOFOLLOW)
                .open(path)
                .map_err(|_| "PROJECT_DIRECTORY_CHANGED")?;
            let metadata = file.metadata().map_err(|_| "PROJECT_DIRECTORY_CHANGED")?;
            Ok(Self {
                identity: format!("{}:{}", metadata.dev(), metadata.ino()),
                files: vec![file],
            })
        }
        #[cfg(windows)]
        {
            use std::os::windows::{fs::OpenOptionsExt, io::AsRawHandle};
            use windows_sys::Win32::Storage::FileSystem::*;
            let mut files = Vec::new();
            let mut identity = String::new();
            for ancestor in path.ancestors().filter(|p| !p.as_os_str().is_empty()) {
                let file = std::fs::OpenOptions::new()
                    .read(true)
                    .share_mode(FILE_SHARE_READ | FILE_SHARE_WRITE)
                    .custom_flags(FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT)
                    .open(ancestor)
                    .map_err(|_| "PROJECT_DIRECTORY_CHANGED")?;
                let mut info: BY_HANDLE_FILE_INFORMATION = unsafe { std::mem::zeroed() };
                if unsafe { GetFileInformationByHandle(file.as_raw_handle(), &mut info) } == 0
                    || info.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT != 0
                    || info.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY == 0
                {
                    return Err("PROJECT_DIRECTORY_CHANGED".into());
                }
                if files.is_empty() {
                    identity = format!(
                        "{}:{}:{}",
                        info.dwVolumeSerialNumber, info.nFileIndexHigh, info.nFileIndexLow
                    );
                }
                files.push(file);
            }
            Ok(Self { files, identity })
        }
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub fn configure(&self, command: &mut tokio::process::Command, path: &Path) {
        #[cfg(unix)]
        {
            use std::os::{fd::AsRawFd, unix::process::CommandExt};
            let fd = self.files[0].as_raw_fd();
            let _ = path;
            unsafe {
                command.as_std_mut().pre_exec(move || {
                    if libc::fchdir(fd) != 0 {
                        return Err(std::io::Error::last_os_error());
                    }
                    Ok(())
                });
            }
        }
        #[cfg(windows)]
        {
            let _ = &self.files;
            command.current_dir(path);
        }
    }
}
#[cfg(all(test, unix))]
mod tests {
    use super::*;
    #[tokio::test]
    async fn retained_handle_prevents_swap_between_validation_and_spawn() {
        let temp = tempfile::tempdir().unwrap();
        let root = std::fs::canonicalize(temp.path()).unwrap();
        let approved = root.join("approved");
        let original = root.join("original");
        let outside = root.join("outside");
        std::fs::create_dir(&approved).unwrap();
        std::fs::create_dir(&outside).unwrap();
        let handle = DirectoryGuard::open(&approved).unwrap();
        std::fs::rename(&approved, &original).unwrap();
        std::os::unix::fs::symlink(&outside, &approved).unwrap();
        let mut command = tokio::process::Command::new("/bin/sh");
        command.args(["-c", "touch marker"]);
        handle.configure(&mut command, &approved);
        assert!(command.status().await.unwrap().success());
        assert!(original.join("marker").exists());
        assert!(!outside.join("marker").exists());
    }
}
