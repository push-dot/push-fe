import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { request, refresh, type Resource } from "@/shared/api";
import { Approval } from "@/features/approval";
import { Notice } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
export type Attachment =
  | { type: "DOCUMENT_VERSION"; id: string; documentId: string; title: string }
  | { type: "EVIDENCE"; id: string; title: string }
  | { type: "APPROVAL"; id: string };
export const AttachmentCard = ({
  attachment,
  applicationId,
  onOpenDocument,
}: {
  attachment: Attachment;
  applicationId: string;
  onOpenDocument: (id: string, versionId?: string) => void;
}) => {
  const t = useT();
  const label = useLabel();
  const [record, setRecord] = useState<Resource | null>(null);
  const [document, setDocument] = useState<Resource | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    setRecord(null);
    setDocument(null);
    setError("");
    const load = async () => {
      if (attachment.type === "DOCUMENT_VERSION") {
        const doc = await request<Resource>(
          `documents/${attachment.documentId}`,
        );
        if (doc.applicationId !== applicationId)
          throw new Error(
            t(
              "이 지원의 문서가 아닙니다.",
              "This document belongs to another application.",
            ),
          );
        const version = await request<Resource>(
          `documents/${doc.id}/versions/${attachment.id}`,
        );
        if (current) {
          setDocument(doc);
          setRecord(version);
        }
      } else {
        const value = await request<Resource>(
          `${attachment.type === "APPROVAL" ? "approvals" : "career-evidence"}/${attachment.id}`,
        );
        if (
          attachment.type === "APPROVAL" &&
          value.applicationId !== applicationId
        )
          throw new Error(
            t(
              "이 지원의 승인이 아닙니다.",
              "This approval belongs to another application.",
            ),
          );
        if (current) setRecord(value);
      }
    };
    void load().catch((error) => {
      if (current) setError(error.message);
    });
    return () => {
      current = false;
    };
  }, [attachment.id, attachment.type, applicationId]);
  if (error) return <Notice error={error} />;
  if (!record)
    return (
      <div className="attachment-card muted" role="status">
        {t("첨부 자료를 불러오는 중입니다.", "Loading attachment.")}
      </div>
    );
  if (attachment.type === "APPROVAL")
    return (
      <Approval
        key={record.id}
        existingApproval={record}
        kind={record.kind}
        applicationId={applicationId}
        targetId={record.targetId}
        summary={
          record.targetSummary?.title ||
          record.targetSummary?.applicationTitle ||
          t("작업 승인 검토", "Review approval")
        }
        reviewContent={
          <div className="source-text">
            <p>
              {record.targetSummary?.sourceText || record.targetSummary?.text}
            </p>
            {record.targetSummary?.blocks?.map(
              (block: { id: string; text: string }) => (
                <p key={block.id}>{block.text}</p>
              ),
            )}
            {record.targetSummary?.workingDirectory && (
              <p>
                {t("작업 폴더", "Working directory")}:{" "}
                {record.targetSummary.workingDirectory}
              </p>
            )}
            {record.targetSummary?.executable && (
              <pre>
                {[
                  record.targetSummary.executable,
                  ...(record.targetSummary.arguments || []),
                ].join(" ")}
              </pre>
            )}
            {record.targetSummary?.prompt && (
              <p>{record.targetSummary.prompt}</p>
            )}
            {record.targetSummary?.documentVersionIds && (
              <p>
                {t("제출할 문서 버전", "Document versions for submission")}:{" "}
                {record.targetSummary.documentVersionIds.join(", ")}
              </p>
            )}
            {record.targetSummary?.confirmedSubmitted !== undefined && (
              <p>
                {t("사용자가 제출 사실을 확인함", "User confirmed submission")}:{" "}
                {record.targetSummary.confirmedSubmitted
                  ? t("예", "Yes")
                  : t("아니요", "No")}
              </p>
            )}
            {record.targetSummary?.documentId && (
              <button
                onClick={() => onOpenDocument(record.targetSummary.documentId)}
              >
                {t("대상 문서 열기", "Open target document")}
              </button>
            )}
          </div>
        }
      />
    );
  if (attachment.type === "EVIDENCE")
    return (
      <div className="attachment-card">
        <h3>{record.title}</h3>
        <p className="source-text">{record.sourceText}</p>
        <Approval
          kind="EVIDENCE_USE"
          applicationId={applicationId}
          targetId={record.id}
          summary={t(
            "이 지원에 근거 사용 승인",
            "Approve evidence for this application",
          )}
          reviewContent={<p className="source-text">{record.sourceText}</p>}
        />
      </div>
    );
  if (!document) return null;
  return (
    <div className="document-attachment-group">
      <div className="attachment-card">
        <div className="row">
          <FileText size={22} />
          <h3>{document.title}</h3>
          <span className="badge">v{record.number}</span>
          <span className="grow" />
          <button onClick={() => onOpenDocument(document.id, record.id)}>
            {t("문서 열기", "Open document")} <ExternalLink size={14} />
          </button>
        </div>
        <div className="document-excerpt">
          {record.blocks
            ?.slice(0, 4)
            .map((block: { id: string; text: string }) => (
              <p key={block.id}>{block.text}</p>
            ))}
        </div>
        <div className="quality">
          {Object.entries(record.quality || {})
            .filter(([key]) =>
              ["jobFit", "evidenceFidelity", "readability", "ats"].includes(
                key,
              ),
            )
            .map(([key, value]) => (
              <div key={key}>
                <small>{label(key)}</small>
                <strong>{value === null ? "—" : String(value)}</strong>
              </div>
            ))}
        </div>
      </div>
      <Approval
        kind="DOCUMENT_FINALIZE"
        applicationId={applicationId}
        targetId={record.id}
        summary={t(
          `버전 ${record.number} 확정 검토`,
          `Review version ${record.number} for finalization`,
        )}
        reviewContent={
          <div>
            {record.blocks?.map((block: { id: string; text: string }) => (
              <p key={block.id} className="source-text">
                {block.text}
              </p>
            ))}
          </div>
        }
        onApproved={async (approval) => {
          const updated = await request<Resource>(
            `documents/${document.id}/finalize`,
            "POST",
            {
              expectedRevision: document.revision,
              versionId: record.id,
              approvalId: approval.id,
            },
          );
          setDocument(updated);
          await refresh("documents");
        }}
      />
    </div>
  );
};
