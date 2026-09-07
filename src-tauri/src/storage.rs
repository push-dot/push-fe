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
pub async fn prepare(
    pool: &SqlitePool,
    id: &str,
    device: &str,
    hash: &str,
    payload: &str,
) -> Result<(), String> {
    initialize(pool).await?;
    sqlx::query("INSERT INTO runs(id,device,hash,payload,state) VALUES(?,?,?,?,'PREPARED')")
        .bind(id)
        .bind(device)
        .bind(hash)
        .bind(payload)
        .execute(pool)
        .await
        .map_err(|_| "RUN_ALREADY_CLAIMED")?;
    Ok(())
}
pub async fn arm(pool: &SqlitePool, id: &str) -> Result<(), String> {
    let changed = sqlx::query("UPDATE runs SET state='CLAIMED' WHERE id=? AND state='PREPARED'")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?
        .rows_affected();
    if changed != 1 {
        return Err("RUN_NOT_PREPARED".into());
    }
    Ok(())
}
pub async fn prepare_request(
    pool: &SqlitePool,
    id: &str,
    device: &str,
    hash: &str,
    payload: &str,
    body: &str,
) -> Result<String, String> {
    initialize(pool).await?;
    sqlx::query("CREATE TABLE IF NOT EXISTS start_requests(run_id TEXT PRIMARY KEY, request_key TEXT NOT NULL, body TEXT NOT NULL, rejected INTEGER NOT NULL DEFAULT 0)").execute(pool).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?;
    let mut tx = pool
        .begin()
        .await
        .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    let record: Option<(String, String, String, String)> =
        sqlx::query_as("SELECT state,device,hash,payload FROM runs WHERE id=?")
            .bind(id)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    let key = if let Some((state, bound_device, bound_hash, bound_payload)) = record {
        if state != "PREPARED"
            || bound_device != device
            || bound_hash != hash
            || bound_payload != payload
        {
            return Err("RUN_ALREADY_CLAIMED".into());
        }
        let (key, previous, rejected): (String, String, i64) =
            sqlx::query_as("SELECT request_key,body,rejected FROM start_requests WHERE run_id=?")
                .bind(id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|_| "START_REQUEST_UNCERTAIN")?;
        if rejected == 0 {
            if previous != body {
                return Err("START_REQUEST_UNCERTAIN".into());
            }
            key
        } else {
            let key = uuid::Uuid::new_v4().to_string();
            sqlx::query("UPDATE start_requests SET request_key=?,body=?,rejected=0 WHERE run_id=?")
                .bind(&key)
                .bind(body)
                .bind(id)
                .execute(&mut *tx)
                .await
                .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
            key
        }
    } else {
        sqlx::query("INSERT INTO runs(id,device,hash,payload,state) VALUES(?,?,?,?,'PREPARED')")
            .bind(id)
            .bind(device)
            .bind(hash)
            .bind(payload)
            .execute(&mut *tx)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
        let key = uuid::Uuid::new_v4().to_string();
        sqlx::query("INSERT INTO start_requests(run_id,request_key,body) VALUES(?,?,?)")
            .bind(id)
            .bind(&key)
            .bind(body)
            .execute(&mut *tx)
            .await
            .map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
        key
    };
    tx.commit().await.map_err(|_| "LOCAL_STORAGE_UNAVAILABLE")?;
    Ok(key)
}
pub async fn rejected_request(pool: &SqlitePool, id: &str, key: &str) -> Result<(), String> {
    sqlx::query("UPDATE start_requests SET rejected=1 WHERE run_id=? AND request_key=? AND EXISTS (SELECT 1 FROM runs WHERE id=? AND state='PREPARED')").bind(id).bind(key).bind(id).execute(pool).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?;
    Ok(())
}
pub async fn arm_request(pool: &SqlitePool, id: &str, key: &str) -> Result<(), String> {
    let changed=sqlx::query("UPDATE runs SET state='CLAIMED' WHERE id=? AND state='PREPARED' AND EXISTS (SELECT 1 FROM start_requests WHERE run_id=? AND request_key=? AND rejected=0)").bind(id).bind(id).bind(key).execute(pool).await.map_err(|_|"LOCAL_STORAGE_UNAVAILABLE")?.rows_affected();
    if changed != 1 {
        return Err("RUN_NOT_PREPARED".into());
    }
    Ok(())
}
#[cfg(test)]
mod retry_tests {
    use super::*;
    #[tokio::test]
    async fn unreceived_start_reuses_key_and_cannot_change_payload() {
        let dir = tempfile::tempdir().unwrap();
        let pool = database(&dir.path().join("db")).await.unwrap();
        let key = prepare_request(&pool, "run", "device", "hash", "{}", "body")
            .await
            .unwrap();
        recover_after_restart(&pool).await.unwrap();
        let retry = prepare_request(&pool, "run", "device", "hash", "{}", "body")
            .await
            .unwrap();
        assert_eq!(key, retry);
        assert!(
            prepare_request(&pool, "run", "device", "hash", "{}", "different")
                .await
                .is_err()
        );
        arm(&pool, "run").await.unwrap();
        assert!(
            prepare_request(&pool, "run", "device", "hash", "{}", "body")
                .await
                .is_err()
        );
    }
    #[tokio::test]
    async fn definitive_rejection_allows_new_approval_without_reviving_claimed_run() {
        let dir = tempfile::tempdir().unwrap();
        let pool = database(&dir.path().join("db")).await.unwrap();
        let key = prepare_request(&pool, "run", "device", "hash", "{}", "expired-approval")
            .await
            .unwrap();
        rejected_request(&pool, "run", &key).await.unwrap();
        let fresh = prepare_request(&pool, "run", "device", "hash", "{}", "new-approval")
            .await
            .unwrap();
        assert_ne!(key, fresh);
        rejected_request(&pool, "run", &key).await.unwrap();
        assert!(
            prepare_request(&pool, "run", "device", "hash", "{}", "third-approval")
                .await
                .is_err()
        );
    }
}
#[cfg(test)]
mod attempt_tests {
    use super::*;
    #[tokio::test]
    async fn stale_and_simultaneous_responses_cannot_arm_twice() {
        let dir = tempfile::tempdir().unwrap();
        let pool = database(&dir.path().join("db")).await.unwrap();
        let old = prepare_request(&pool, "run", "device", "hash", "{}", "expired")
            .await
            .unwrap();
        rejected_request(&pool, "run", &old).await.unwrap();
        let new = prepare_request(&pool, "run", "device", "hash", "{}", "fresh")
            .await
            .unwrap();
        assert!(arm_request(&pool, "run", &old).await.is_err());
        let (first, second) = tokio::join!(
            arm_request(&pool, "run", &new),
            arm_request(&pool, "run", &new)
        );
        assert_eq!(usize::from(first.is_ok()) + usize::from(second.is_ok()), 1);
        rejected_request(&pool, "run", &new).await.unwrap();
        assert!(
            prepare_request(&pool, "run", "device", "hash", "{}", "fresh")
                .await
                .is_err()
        );
    }
}
