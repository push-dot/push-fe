import { useResources, type Resource } from "@/shared/api";
import { Field, Notice } from "@/shared/ui";
import { Approval } from "@/features/approval";
import { useT } from "@/shared/config";
import type { ChatContext } from "../model/chat";
const VersionPicker = ({
  documentId,
  value,
  onChange,
}: {
  documentId: string;
  value?: string;
  onChange: (id: string) => void;
}) => {
  const t = useT();
  const versions = useResources(`documents/${documentId}/versions`);
  return (
    <Field label={t("문서 버전", "Document version")}>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{t("버전 선택", "Choose a version")}</option>
        {versions.data.map((version) => (
          <option key={version.id} value={version.id}>
            v{version.number} · {version.changeNote}
          </option>
        ))}
      </select>
      <Notice error={versions.error} />
    </Field>
  );
};
export const ContextPicker = ({
  applicationId,
  documents,
  evidence,
  context,
  onChange,
}: {
  applicationId: string;
  documents: Resource[];
  evidence: Resource[];
  context: ChatContext;
  onChange: (context: ChatContext) => void;
}) => {
  const t = useT();
  const scoped = documents.filter(
    (document) => document.applicationId === applicationId,
  );
  return (
    <div className="chat-context panel">
      <h3>
        {t(
          "대화에 사용할 문서와 근거",
          "Documents and evidence for this conversation",
        )}
      </h3>
      <Field label={t("참고 문서", "Reference document")}>
        <select
          value={context.documentId || ""}
          onChange={(event) =>
            onChange({
              ...context,
              documentId: event.target.value || undefined,
              versionId: undefined,
            })
          }
        >
          <option value="">{t("문서 없이 대화", "No document")}</option>
          {scoped.map((document) => (
            <option key={document.id} value={document.id}>
              {document.title}
            </option>
          ))}
        </select>
      </Field>
      {context.documentId &&
        scoped.some((document) => document.id === context.documentId) && (
          <VersionPicker
            key={context.documentId}
            documentId={context.documentId}
            value={context.versionId}
            onChange={(versionId) =>
              onChange({ ...context, versionId: versionId || undefined })
            }
          />
        )}
      <p className="muted">
        {t(
          "선택한 근거는 이 지원에 대한 사용 승인이 필요합니다.",
          "Selected evidence requires approval for this application.",
        )}
      </p>
      {evidence.map((item) => (
        <div key={item.id}>
          <label className="check">
            <input
              type="checkbox"
              checked={context.evidenceIds.includes(item.id)}
              onChange={(event) =>
                onChange({
                  ...context,
                  evidenceIds: event.target.checked
                    ? [...context.evidenceIds, item.id]
                    : context.evidenceIds.filter((id) => id !== item.id),
                })
              }
            />
            {item.title}
          </label>
          {context.evidenceIds.includes(item.id) && (
            <Approval
              kind="EVIDENCE_USE"
              applicationId={applicationId}
              targetId={item.id}
              summary={item.title}
              reviewContent={<p className="source-text">{item.sourceText}</p>}
            />
          )}
        </div>
      ))}
      {!evidence.length && (
        <p>
          {t(
            "Career Vault에 원본 경험을 추가하세요.",
            "Add source experience in Career Vault.",
          )}
        </p>
      )}
    </div>
  );
};
