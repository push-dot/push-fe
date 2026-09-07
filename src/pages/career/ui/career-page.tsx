import { extractSource } from "../model/source-import";
import { useState } from "react";
import { request, useResources, runOperation } from "@/shared/api";
import { Field, Form, Empty, Notice, text, lines } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
export const CareerPage = () => {
  const t = useT();
  const label = useLabel();
  const { data, error, reload } = useResources("career-evidence");
  const [importMeta, setImportMeta] = useState<{
    format: string;
    contentHash?: string;
  }>({ format: "TEXT" });
  const [importError, setImportError] = useState("");
  const [importText, setImportText] = useState("");
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t("내 경험의 원본", "Your original evidence")}</h1>
          <p className="muted">
            {t(
              "작성한 내용과 출처를 보존하고, 지원별로 사용을 승인합니다.",
              "Keep original evidence and approve its use per application.",
            )}
          </p>
        </div>
      </div>
      <details className="panel" open={!data.length}>
        <summary>{t("경험 추가", "Add evidence")}</summary>
        <Form
          onSubmit={async (f) => {
            await request("career-evidence", "POST", {
              kind: text(f, "kind"),
              title: text(f, "title"),
              sourceText: text(f, "sourceText"),
              skills: lines(text(f, "skills")),
              ...(text(f, "sourceUrl")
                ? { sourceUrl: text(f, "sourceUrl") }
                : {}),
            });
            await reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("종류", "Kind")}>
              <select name="kind">
                <option value="CAREER">{label("CAREER")}</option>
                <option value="RESUME">{label("RESUME")}</option>
                <option value="GITHUB">{label("GITHUB")}</option>
                <option value="EDUCATION">{label("EDUCATION")}</option>
                <option value="SKILL">{label("SKILL")}</option>
                <option value="PROJECT">{label("PROJECT")}</option>
              </select>
            </Field>
            <Field label={t("제목", "Title")}>
              <input name="title" required maxLength={200} />
            </Field>
          </div>
          <Field label={t("원문", "Original text")}>
            <textarea name="sourceText" required rows={6} maxLength={100000} />
          </Field>
          <div className="form-grid">
            <Field label={t("기술 (쉼표로 구분)", "Skills (comma separated)")}>
              <input name="skills" />
            </Field>
            <Field label={t("출처 URL", "Source URL")}>
              <input name="sourceUrl" type="url" />
            </Field>
          </div>
        </Form>
      </details>
      <details className="panel">
        <summary>{t("파일·텍스트 가져오기", "Import file or text")}</summary>
        <Form
          submitLabel={t("가져오기", "Import")}
          onSubmit={async () => {
            await runOperation("career-evidence/import", {
              ...importMeta,
              text: importText,
            });
            await reload();
          }}
        >
          <Field
            label={t(
              "TXT / Markdown / PDF / DOCX",
              "TXT / Markdown / PDF / DOCX",
            )}
          >
            <input
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImportError("");
                try {
                  const result = await extractSource(file);
                  setImportText(result.text);
                  setImportMeta({
                    format: result.format,
                    contentHash: result.contentHash,
                  });
                } catch (error) {
                  setImportError((error as Error).message);
                }
              }}
            />
          </Field>
          <Notice error={importError} />
          <Field label={t("추출 원문 확인", "Review extracted text")}>
            <textarea
              required
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </Field>
        </Form>
      </details>
      <Notice error={error} />
      {data.map((item) => (
        <article className="panel" key={item.id}>
          <div className="row">
            <h3>{item.title}</h3>
            <span className="badge">{label(item.verificationStatus)}</span>
          </div>
          <p className="source-text">{item.sourceText}</p>
          <div className="tags">
            {item.skills?.map((skill: string) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              {t("출처 열기", "Open source")} ↗
            </a>
          )}
        </article>
      ))}
      {!data.length && (
        <Empty title={t("아직 등록한 근거가 없습니다", "No evidence yet")}>
          {t(
            "실제 경험을 추가하면 문서와 면접에서 연결할 수 있습니다.",
            "Add real experience to use in documents and interviews.",
          )}
        </Empty>
      )}
    </div>
  );
};
