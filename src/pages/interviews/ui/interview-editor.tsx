import { useRef, useState } from "react";
import type { Resource } from "@/shared/api";
import { Field, Form, Notice } from "@/shared/ui";
import { useT } from "@/shared/config";
import {
  CompanySourceFields,
  type CompanySource,
} from "./company-source-fields";
type InterviewDraft = {
  expectedRevision: number;
  notes: string;
  reflection: string;
  companySources: CompanySource[];
};
const snapshot = (interview: Resource): InterviewDraft => ({
  expectedRevision: interview.revision,
  notes: interview.notes || "",
  reflection: interview.reflection || "",
  companySources: interview.companySources || [],
});
export const InterviewEditor = ({
  interview,
  onSave,
}: {
  interview: Resource;
  onSave: (draft: InterviewDraft) => Promise<Resource>;
}) => {
  const t = useT();
  const [draft, setDraft] = useState<InterviewDraft | null>(null);
  const draftRef = useRef(draft);
  const values = draft || snapshot(interview);
  const edit = (change: Partial<InterviewDraft>) => {
    const next = { ...values, ...change };
    draftRef.current = next;
    setDraft(next);
  };
  const conflict = Boolean(
    draft && draft.expectedRevision !== interview.revision,
  );
  return (
    <Form
      resetOnSuccess={false}
      onSubmit={async () => {
        const sent = draftRef.current;
        const updated = await onSave(values);
        const next =
          draftRef.current === sent || draftRef.current === null
            ? null
            : { ...draftRef.current!, expectedRevision: updated.revision };
        draftRef.current = next;
        setDraft(next);
      }}
    >
      {conflict && (
        <div>
          <Notice
            error={t(
              "서버 자료가 변경되었습니다. 현재 입력과 편집 시작 리비전을 보존했습니다.",
              "Server data changed. Your input and original revision are preserved.",
            )}
          />
          <details>
            <summary>{t("서버 내용 비교", "Compare server content")}</summary>
            <p className="source-text">{interview.notes}</p>
            <p className="source-text">{interview.reflection}</p>
            {(interview.companySources || []).map(
              (source: CompanySource, index: number) => (
                <p className="source-text" key={index}>
                  {source.sourceUrl}
                  {"\n"}
                  {source.sourceText}
                </p>
              ),
            )}
          </details>
          <button
            type="button"
            onClick={() => {
              draftRef.current = null;
              setDraft(null);
            }}
          >
            {t(
              "입력을 버리고 서버 자료 불러오기",
              "Discard edits and load server data",
            )}
          </button>
        </div>
      )}
      <CompanySourceFields
        sources={values.companySources}
        onChange={(companySources) => edit({ companySources })}
      />
      <Field label={t("준비 메모", "Preparation notes")}>
        <textarea
          name="notes"
          value={values.notes}
          onChange={(event) => edit({ notes: event.target.value })}
        />
      </Field>
      <Field label={t("면접 회고", "Reflection")}>
        <textarea
          name="reflection"
          value={values.reflection}
          onChange={(event) => edit({ reflection: event.target.value })}
        />
      </Field>
    </Form>
  );
};
