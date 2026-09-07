import { useEffect, useState } from "react";
import {
  useOutbox,
  restoreOutbox,
  synchronize,
  discardMutation,
  rebaseMutation,
  request,
  type Resource,
} from "@/shared/api";
import { useSession } from "@/shared/auth";
import { Action } from "@/shared/ui";
import { useT } from "@/shared/config";
export const SyncPanel = () => {
  const t = useT();
  const { items, busy } = useOutbox();
  const account = useSession((s) => s.accountId);
  const token = useSession((s) => s.accessToken);
  const [open, setOpen] = useState(false);
  const [server, setServer] = useState<Record<string, Resource>>({});
  useEffect(() => {
    void restoreOutbox();
    const sync = () => {
      if (useSession.getState().accessToken)
        void synchronize().catch(() => undefined);
    };
    if (token) sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [account, token]);
  if (!account) return null;
  return (
    <div className="sync-panel">
      <button onClick={() => setOpen(!open)}>
        {busy ? t("동기화 중", "Syncing") : t("동기화", "Sync")}{" "}
        {items.length > 0 && `· ${items.length}`}
      </button>
      {open && (
        <div className="panel">
          <Action run={synchronize}>{t("지금 동기화", "Sync now")}</Action>
          {!items.length && (
            <p>
              {t("대기 중인 로컬 수정이 없습니다.", "No pending local edits.")}
            </p>
          )}
          {items.map((item) => (
            <div className="operation-row" key={item.mutation.mutationId}>
              <strong>
                {item.mutation.resourceType === "APPLICATION"
                  ? t("지원 메모", "Application notes")
                  : t("내부 일정", "Local event")}
              </strong>
              <p className="source-text">
                {Object.values(item.mutation.payload).join("\n")}
              </p>
              <p>
                {item.status === "PENDING"
                  ? t("전송 대기", "Pending sync")
                  : item.error}
              </p>
              {item.status !== "PENDING" && (
                <>
                  <Action
                    run={async () => {
                      const path =
                        item.mutation.resourceType === "APPLICATION"
                          ? "applications"
                          : "calendar/events";
                      setServer({
                        ...server,
                        [item.mutation.mutationId]: await request<Resource>(
                          `${path}/${item.mutation.resourceId}`,
                        ),
                      });
                    }}
                  >
                    {t("서버 내용 비교", "Compare server content")}
                  </Action>
                  {server[item.mutation.mutationId] && (
                    <>
                      <pre>
                        {JSON.stringify(
                          server[item.mutation.mutationId],
                          null,
                          2,
                        )}
                      </pre>
                      <Action
                        run={() =>
                          rebaseMutation(
                            item.mutation.mutationId,
                            server[item.mutation.mutationId].revision,
                          )
                        }
                      >
                        {t(
                          "내 수정본을 병합본으로 사용",
                          "Use my changes as merged version",
                        )}
                      </Action>
                    </>
                  )}
                  <Action run={() => discardMutation(item.mutation.mutationId)}>
                    {t("로컬 수정 버리기", "Discard local changes")}
                  </Action>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
