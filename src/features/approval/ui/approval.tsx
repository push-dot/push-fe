import { useState, useEffect, type ReactNode } from "react";
import { request, type Resource } from "@/shared/api";
import { Action } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
import { ShieldCheck } from "lucide-react";
export const Approval = ({
  kind,
  applicationId,
  targetId,
  targetRevision,
  summary,
  reviewContent,
  onApproved,
}: {
  kind: string;
  applicationId: string;
  targetId: string;
  targetRevision?: number;
  summary: string;
  reviewContent?: ReactNode;
  onApproved?: (approval: Resource) => Promise<void> | void;
}) => {
  const t = useT();
  const label = useLabel();
  const [approval, setApproval] = useState<Resource | null>(null);
  useEffect(() => setApproval(null), [targetId, applicationId]);
  return (
    <div className="approval">
      <ShieldCheck size={23} />
      <div className="grow">
        <strong>{summary}</strong>
        <small>
          {approval
            ? label(approval.status)
            : t(
                "이 지원과 대상에만 적용됩니다.",
                "Applies only to this application and target.",
              )}
        </small>
        {approval && (
          <div className="approval-review">
            {reviewContent || (
              <p>
                {approval.targetSummary?.sourceText ||
                  approval.targetSummary?.text ||
                  approval.targetSummary?.title ||
                  summary}
              </p>
            )}
            <small>
              {t("지원", "Application")}:{" "}
              {approval.targetSummary?.company || applicationId}
            </small>
          </div>
        )}
      </div>
      {!approval ? (
        <Action
          run={async () => {
            const created = await request<Resource>("approvals", "POST", {
              kind,
              applicationId,
              targetId,
              ...(targetRevision ? { targetRevision } : {}),
            });
            setApproval(await request<Resource>(`approvals/${created.id}`));
          }}
        >
          {t("검토", "Review")}
        </Action>
      ) : approval.status === "PENDING" ? (
        <>
          <Action
            run={async () =>
              setApproval(
                await request<Resource>(
                  `approvals/${approval.id}/decision`,
                  "POST",
                  { expectedRevision: approval.revision, decision: "DENIED" },
                ),
              )
            }
          >
            {t("거부", "Deny")}
          </Action>
          <Action
            className="primary"
            run={async () => {
              const value = await request<Resource>(
                `approvals/${approval.id}/decision`,
                "POST",
                { expectedRevision: approval.revision, decision: "APPROVED" },
              );
              setApproval(value);
              await onApproved?.(value);
              if (onApproved) setApproval({ ...value, status: "CONSUMED" });
            }}
          >
            {t("승인", "Approve")}
          </Action>
        </>
      ) : approval.status === "APPROVED" && onApproved ? (
        <Action
          run={async () => {
            await onApproved(approval);
            setApproval({ ...approval, status: "CONSUMED" });
          }}
        >
          {t("승인한 작업 실행", "Run approved action")}
        </Action>
      ) : null}
    </div>
  );
};
