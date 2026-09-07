use std::path::{Path, PathBuf};
pub fn safe_relative(value: &str) -> Result<PathBuf, String> {
    if value.is_empty()
        || value.len() > 512
        || value.contains(['\\', ':', '\0'])
        || value.chars().any(char::is_control)
    {
        return Err("INVALID_PATH".into());
    }
    for part in value.split('/') {
        let stem = part.split('.').next().unwrap_or("").to_uppercase();
        if part.is_empty()
            || part == "."
            || part == ".."
            || part.ends_with(['.', ' '])
            || [
                "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7",
                "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8",
                "LPT9",
            ]
            .contains(&stem.as_str())
        {
            return Err("INVALID_PATH".into());
        }
    }
    Ok(Path::new(value).to_path_buf())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_path_escape_and_windows_aliases() {
        for value in [
            "../secret",
            "/tmp/secret",
            "a/../b",
            "C:\\secret",
            "a\\b",
            "a//b",
            "a/./b",
            "CON",
            "a:stream",
            "a.",
        ] {
            assert!(safe_relative(value).is_err(), "{value}");
        }
    }
}

pub fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\"'\"'"))
}
pub fn payload_hash(
    executable: &str,
    arguments: &[String],
    directory: &str,
    prompt: &str,
) -> String {
    use sha2::{Digest, Sha256};
    let json=serde_json::json!({"executable":executable,"arguments":arguments,"workingDirectory":directory,"prompt":prompt}).to_string().replace('&',"\\u0026").replace('<',"\\u003c").replace('>',"\\u003e").replace('\u{2028}',"\\u2028").replace('\u{2029}',"\\u2029");
    format!("{:x}", Sha256::digest(json.as_bytes()))
}
pub fn write_manifest(root: &Path, files: &[(String, String, String)]) -> Result<(), String> {
    use sha2::{Digest, Sha256};
    use std::{
        collections::HashSet,
        fs::{self, OpenOptions},
        io::Write,
    };
    if files.is_empty()
        || files.len() > 100
        || files.iter().map(|v| v.1.len()).sum::<usize>() > 5 * 1024 * 1024
    {
        return Err("MANIFEST_LIMIT".into());
    }
    let mut paths = HashSet::new();
    for (name, text, hash) in files {
        let relative = safe_relative(name)?;
        if !paths.insert(name.to_lowercase())
            || format!("{:x}", Sha256::digest(text.as_bytes())) != *hash
        {
            return Err("INVALID_MANIFEST".into());
        }
        let mut current = root.to_path_buf();
        for component in relative.components() {
            current.push(component);
            if let Ok(meta) = fs::symlink_metadata(&current) {
                if meta.file_type().is_symlink() || !meta.is_dir() {
                    return Err("PATH_EXISTS".into());
                }
            }
        }
        if current.exists() {
            return Err("PATH_EXISTS".into());
        }
    }
    for path in &paths {
        let mut prefix = String::new();
        let parts: Vec<_> = path.split('/').collect();
        for part in &parts[..parts.len() - 1] {
            if !prefix.is_empty() {
                prefix.push('/');
            }
            prefix.push_str(part);
            if paths.contains(&prefix) {
                return Err("INVALID_MANIFEST".into());
            }
        }
    }
    for (name, text, _) in files {
        let path = root.join(name);
        fs::create_dir_all(path.parent().ok_or("INVALID_PATH")?)
            .map_err(|_| "FILE_WRITE_FAILED")?;
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&path)
            .map_err(|_| "FILE_WRITE_FAILED")?;
        file.write_all(text.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|_| "FILE_WRITE_FAILED")?;
    }
    Ok(())
}
#[cfg(test)]
mod boundaries {
    use super::*;
    use sha2::{Digest, Sha256};
    #[cfg(unix)]
    #[test]
    fn terminal_arguments_remain_literal() {
        let value = "space ' quote; $(touch /tmp/push-test-should-never-exist)\n";
        let result = std::process::Command::new("/bin/sh")
            .arg("-c")
            .arg(format!("printf %s {}", shell_quote(value)))
            .output()
            .unwrap();
        assert_eq!(String::from_utf8(result.stdout).unwrap(), value);
    }
    #[test]
    fn invalid_manifest_never_writes_partial_files() {
        let root = tempfile::tempdir().unwrap();
        let text = "safe".to_string();
        let hash = format!("{:x}", Sha256::digest(text.as_bytes()));
        assert!(write_manifest(
            root.path(),
            &[
                ("a.txt".into(), text.clone(), hash.clone()),
                ("../bad".into(), text, hash)
            ]
        )
        .is_err());
        assert!(!root.path().join("a.txt").exists());
    }
    #[test]
    fn existing_files_are_never_overwritten() {
        let root = tempfile::tempdir().unwrap();
        std::fs::write(root.path().join("a.txt"), "original").unwrap();
        assert!(write_manifest(
            root.path(),
            &[(
                "a.txt".into(),
                "replace".into(),
                format!("{:x}", Sha256::digest(b"replace"))
            )]
        )
        .is_err());
        assert_eq!(
            std::fs::read_to_string(root.path().join("a.txt")).unwrap(),
            "original"
        );
    }
}
#[cfg(test)]
mod nested_tests {
    use super::*;
    #[test]
    fn file_directory_collisions_are_rejected_before_writes() {
        use sha2::{Digest, Sha256};
        let root = tempfile::tempdir().unwrap();
        let hash = format!("{:x}", Sha256::digest(b"x"));
        assert!(write_manifest(
            root.path(),
            &[
                ("a".into(), "x".into(), hash.clone()),
                ("a/b".into(), "x".into(), hash)
            ]
        )
        .is_err());
        assert!(!root.path().join("a").exists());
    }
    #[cfg(unix)]
    #[test]
    fn symlink_parent_cannot_escape_project() {
        use sha2::{Digest, Sha256};
        let root = tempfile::tempdir().unwrap();
        let outside = tempfile::tempdir().unwrap();
        std::os::unix::fs::symlink(outside.path(), root.path().join("escape")).unwrap();
        assert!(write_manifest(
            root.path(),
            &[(
                "escape/file".into(),
                "x".into(),
                format!("{:x}", Sha256::digest(b"x"))
            )]
        )
        .is_err());
        assert!(!outside.path().join("file").exists());
    }
}

#[cfg(windows)]
pub fn powershell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}
#[cfg(all(test, windows))]
mod windows_tests {
    #[test]
    fn powershell_arguments_remain_literal() {
        let value = "space ' quote; $(throw 'unexpected') & literal";
        let output = std::process::Command::new("powershell.exe")
            .args([
                "-NoProfile",
                "-Command",
                &format!("[Console]::Write({})", super::powershell_quote(value)),
            ])
            .output()
            .unwrap();
        assert!(output.status.success());
        assert_eq!(String::from_utf8(output.stdout).unwrap(), value);
    }
}
