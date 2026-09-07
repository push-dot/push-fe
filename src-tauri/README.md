# Push native shell

Run `npm run tauri -- dev` with Rust and platform prerequisites installed. The native bridge is permitted only in the bundled `main` window. `job-source` loads user-opened HTTP(S) pages without IPC permissions; collection uses a fixed native DOM query after the user's action.

`cargo test --manifest-path src-tauri/Cargo.toml` exercises project boundaries, durable run claims, real fixture subprocess exits and argument preservation, account isolation, and fail-closed configuration. Fixtures run only in temporary folders. Installed coding agents are never invoked by these tests.

CLI execution requires the server's exact approved payload and a project directory created by the native folder picker. The journal commits a unique claim before opening Terminal. A second journal transition prevents multiple Terminal launchers from spawning the same run. The tracked PID/start time identifies the native runner supervising the CLI. Unknown executions are never restarted. The interactive Terminal owns stdout/stderr; completion requires the user to attach real stdout/stderr logs, which are hashed locally. Exit codes are recorded by the runner. Logs and successful exit codes do not independently verify project claims.

Release builds use `PUSH_API_BASE` for the exact HTTPS API allowlist. Configure the same URL in the frontend and the origin in Tauri `app.security.csp` via build configuration. Unconfigured release builds do not fall back to arbitrary servers.

Updates require both `PUSH_UPDATER_ENDPOINT` (HTTPS) and `PUSH_UPDATER_PUBLIC_KEY` at compile time. No development signing key or fake update feed is included. The official updater verifies the artifact signature before installation; the install command also checks the version reviewed by the user. Missing configuration fails closed. Set `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` only in CI secrets when producing updater artifacts. Keep that private key out of source control.

The native workflow builds macOS Universal and Windows NSIS artifacts. Apple certificate, notarization, and updater secrets are optional inputs; without them artifacts remain explicitly unsigned. Actual Apple notarization, production feed installation, Windows runtime behavior, and live CLI provider sessions need their corresponding environment and are separate from local fixture tests.
