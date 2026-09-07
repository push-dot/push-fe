import { useEffect, useState } from "react";
import {
  request,
  useOperations,
  recordOperation,
  restoreOperations,
  dismissOperation,
  refresh,
  type Operation,
} from "@/shared/api";
import { useSession } from "@/shared/auth";
import { Action, Form, Field } from "@/shared/ui";
import { useT } from "@/shared/config";
export const OperationsPanel = () => {
  const t = useT();
  const items = useOperations((s) => s.items);
  const account = useSession((s) => s.accountId);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    void restoreOperations();
  }, [account]);
  const check = async (id: string) => {
    const result = await request<Operation>(`operations/${id}`);
    await recordOperation(result);
    if (result.status === "SUCCEEDED")
      await Promise.all(
        [
          "career-evidence",
          "documents",
          "projects",
          "interviews",
          "conversations",
        ].map(refresh),
      );
  };
  useEffect(() => {
    const pending = Object.values(items).filter((operation) =>
      ["QUEUED", "RUNNING"].includes(operation.status),
    );
    if (!pending.length) return;
    const timer = window.setTimeout(() => {
      void Promise.allSettled(pending.map((operation) => check(operation.id)));
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [items, account]);
  if (!Object.keys(items).length) return null;
  return (
    <div className="operations-panel">
      <button onClick={() => setOpened(!opened)}>
        {t("작업 상태", "Operations")} ·{" "}
        {
          Object.values(items).filter(
            (o) => !["SUCCEEDED", "CANCELLED"].includes(o.status),
          ).length
        }
      </button>
      {opened && (
        <div className="panel">
          {Object.values(items).map((operation) => (
            <div className="operation-row" key={operation.id}>
              <div className="row">
                <strong>{operation.type || t("작업", "Operation")}</strong>
                <span>{operation.status}</span>
                <Action run={() => check(operation.id)}>
                  {t("새로고침", "Refresh")}
                </Action>
                {!["SUCCEEDED", "FAILED", "CANCELLED"].includes(
                  operation.status,
                ) ? (
                  <Action
                    run={async () => {
                      await request(
                        `operations/${operation.id}/cancel`,
                        "POST",
                        {},
                      );
                      await check(operation.id);
                    }}
                  >
                    {t("취소", "Cancel")}
                  </Action>
                ) : (
                  <Action run={() => dismissOperation(operation.id)}>
                    {t("닫기", "Dismiss")}
                  </Action>
                )}
              </div>
              {operation.error && <p>{operation.error.message}</p>}
              {operation.status === "NEEDS_INPUT" && (
                <Form
                  submitLabel={t("입력 후 계속", "Continue with input")}
                  onSubmit={async (form) => {
                    const fields: Record<string, string> = {};
                    let sourceId: string | undefined;
                    for (const field of operation.inputRequest?.fields || []) {
                      const value = String(form.get(field.name) || "");
                      if (field.type === "FILE") {
                        const file = form.get(field.name);
                        if (!(file instanceof File) || !file.size)
                          throw new Error(
                            t("파일을 선택하세요.", "Choose a file."),
                          );
                        const upload = new FormData();
                        upload.append("file", file);
                        upload.append("kind", "RESUME");
                        sourceId = (
                          await request<{ id: string }>(
                            "sources",
                            "POST",
                            upload,
                          )
                        ).id;
                      } else fields[field.name] = value;
                    }
                    await recordOperation(
                      await request<Operation>(
                        `operations/${operation.id}/input`,
                        "POST",
                        { fields, ...(sourceId ? { sourceId } : {}) },
                      ),
                    );
                    await check(operation.id);
                  }}
                >
                  <p>{operation.inputRequest?.message}</p>
                  {operation.inputRequest?.fields.map((field) => (
                    <Field key={field.name} label={field.label}>
                      <input
                        name={field.name}
                        type={field.type === "FILE" ? "file" : "text"}
                        accept={
                          field.type === "FILE"
                            ? ".pdf,.docx,.txt,.md"
                            : undefined
                        }
                        required
                      />
                    </Field>
                  ))}
                </Form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
