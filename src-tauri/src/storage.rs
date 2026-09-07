use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    SqlitePool,
};
use std::path::Path;

pub async fn database(path: &Path) -> Result<SqlitePool, String> {
    SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(
            SqliteConnectOptions::new()
                .filename(path)
                .create_if_missing(true)
                .journal_mode(SqliteJournalMode::Wal)
                .synchronous(SqliteSynchronous::Full),
        )
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE".into())
}
pub async fn claim(
    pool: &SqlitePool,
    id: &str,
    device: &str,
    hash: &str,
    payload: &str,
) -> Result<(), String> {
    initialize(pool).await?;
    sqlx::query("INSERT INTO runs(id,device,hash,payload,state) VALUES(?,?,?,?,'CLAIMED')")
        .bind(id)
        .bind(device)
        .bind(hash)
        .bind(payload)
        .execute(pool)
        .await
        .map_err(|_| "RUN_ALREADY_CLAIMED")?;
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn run_claim_survives_restart_and_rejects_replay() {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runs.db");
        let pool = database(&path).await.unwrap();
        claim(&pool, "run", "device", "hash", "{}").await.unwrap();
        pool.close().await;
        let pool = database(&path).await.unwrap();
        assert!(claim(&pool, "run", "device", "hash", "{}").await.is_err());
        assert!(claim(&pool, "run", "other", "different", "{}")
            .await
            .is_err());
    }
}
pub async fn begin_execution(pool: &SqlitePool, id: &str) -> Result<(), String> {
    let changed = sqlx::query("UPDATE runs SET state='LAUNCHING' WHERE id=? AND state='CLAIMED'")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?
        .rows_affected();
    if changed != 1 {
        return Err("RUN_ALREADY_CLAIMED".into());
    }
    Ok(())
}
#[cfg(test)]
mod launch_tests {
    use super::*;
    #[tokio::test]
    async fn only_one_terminal_runner_can_spawn() {
        let dir = tempfile::tempdir().unwrap();
        let pool = database(&dir.path().join("runs.db")).await.unwrap();
        claim(&pool, "r", "d", "h", "{}").await.unwrap();
        begin_execution(&pool, "r").await.unwrap();
        assert!(begin_execution(&pool, "r").await.is_err());
    }
}
async fn initialize(pool: &SqlitePool) -> Result<(), String> {
    sqlx::query("CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, device TEXT NOT NULL, hash TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL, pid INTEGER, started_at TEXT, exit_code INTEGER, stdout_hash TEXT, stderr_hash TEXT)").execute(pool).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?;
    Ok(())
}
pub async fn recover_after_restart(pool: &SqlitePool) -> Result<(), String> {
    initialize(pool).await?;
    sqlx::query("UPDATE runs SET state='UNKNOWN' WHERE state IN ('CLAIMED','LAUNCHING')")
        .execute(pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    Ok(())
}
#[cfg(test)]
mod recovery_tests {
    use super::*;
    #[tokio::test]
    async fn startup_does_not_relaunch_uncertain_claims() {
        let dir = tempfile::tempdir().unwrap();
        let pool = database(&dir.path().join("runs.db")).await.unwrap();
        claim(&pool, "r", "d", "h", "{}").await.unwrap();
        recover_after_restart(&pool).await.unwrap();
        let state: String = sqlx::query_scalar("SELECT state FROM runs WHERE id='r'")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(state, "UNKNOWN");
        assert!(begin_execution(&pool, "r").await.is_err());
    }
}
