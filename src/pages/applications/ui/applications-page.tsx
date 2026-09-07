import { invoke, isTauri } from "@tauri-apps/api/core";
import { useState, useRef } from "react";
import {
  request,
  useResources,
  runOperation,
  type Resource,
} from "@/shared/api";
import { Field, Form, Empty, Notice, Action, text, lines } from "@/shared/ui";
import { Approval } from "@/features/approval";
import { useT, useLabel } from "@/shared/config";
const stages = [
  "DISCOVERED",
  "PREPARING",
  "READY",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
];
export const ApplicationsPage = ({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) => {
  const t = useT();
  const sourceUrlRef = useRef<HTMLInputElement>(null);
  const sourceTextRef = useRef<HTMLTextAreaElement>(null);
  const sourceKindRef = useRef<HTMLSelectElement>(null);
  const label = useLabel();
  const apps = useResources("applications");
  const jobs = useResources("jobs");
  const evidence = useResources("career-evidence");
  const documents = useResources("documents");
  const [selected, setSelected] = useState<string>("");
  const [analysis, setAnalysis] = useState<Resource | null>(null);
  const [draft, setDraft] = useState<Resource | null>(null);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const app = apps.data.find((a) => a.id === selected);
  const job = jobs.data.find((j) => j.id === app?.jobId);
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t("지원 현황", "Applications")}</h1>
        </div>
      </div>
      <details className="panel" open={!apps.data.length}>
        <summary>{t("새 공고 등록", "Add a job")}</summary>
        <Form
          submitLabel={t("공고와 지원 만들기", "Create job and application")}
          onSubmit={async (f) => {
            const created = await request<Resource>("jobs", "POST", {
              company: text(f, "company"),
              title: text(f, "title"),
              sourceKind: text(f, "sourceKind"),
              sourceText: text(f, "sourceText"),
              requirements: lines(text(f, "requirements")),
              preferred: lines(text(f, "preferred")),
              ...(text(f, "sourceUrl")
                ? { sourceUrl: text(f, "sourceUrl") }
                : {}),
            });
            const application = await request<Resource>(
              "applications",
              "POST",
              { jobId: created.id },
            );
            await Promise.all([apps.reload(), jobs.reload()]);
            setSelected(application.id);
          }}
        >
          <div className="form-grid">
            <Field label={t("회사", "Company")}>
              <input name="company" required />
            </Field>
            <Field label={t("직무", "Role")}>
              <input name="title" required />
            </Field>
          </div>
          <div className="form-grid">
            <Field label={t("수집 방식", "Source")}>
              <select name="sourceKind" ref={sourceKindRef}>
                <option value="TEXT">{label("TEXT")}</option>
                <option value="URL">{label("URL")}</option>
                <option value="DOM">{label("DOM")}</option>
              </select>
            </Field>
            <Field label={t("공고 URL", "Job URL")}>
              <input name="sourceUrl" type="url" ref={sourceUrlRef} />
            </Field>
          </div>
          <div className="actions">
            <Action
              run={async () => {
                if (!isTauri())
                  throw new Error(
                    t(
                      "데스크톱 앱에서 공고 브라우저를 사용할 수 있습니다.",
                      "Use the desktop app for the job browser.",
                    ),
                  );
                await invoke("open_job_browser", {
                  url: sourceUrlRef.current?.value || "",
                });
              }}
            >
              {t("공고 브라우저 열기", "Open job browser")}
            </Action>
            <Action
              run={async () => {
                if (!isTauri())
                  throw new Error(
                    t(
                      "데스크톱 앱에서 본문을 가져올 수 있습니다.",
                      "Use the desktop app to collect page text.",
                    ),
                  );
                const page = await invoke<{
                  sourceUrl: string;
                  sourceText: string;
                  title: string;
                }>("collect_job_page");
                if (sourceUrlRef.current)
                  sourceUrlRef.current.value = page.sourceUrl;
                if (sourceTextRef.current)
                  sourceTextRef.current.value = page.sourceText;
                if (sourceKindRef.current) sourceKindRef.current.value = "DOM";
              }}
            >
              {t("열린 공고 본문 가져오기", "Collect opened job text")}
            </Action>
          </div>
          <Field
            label={t(
              "공고 원문 (URL/DOM도 본문 필요)",
              "Job text (required for URL/DOM too)",
            )}
          >
            <textarea name="sourceText" rows={5} required ref={sourceTextRef} />
          </Field>
          <div className="form-grid">
            <Field label={t("필수 기술", "Requirements")}>
              <input name="requirements" placeholder="React, TypeScript" />
            </Field>
            <Field label={t("우대 사항", "Preferred")}>
              <input name="preferred" />
            </Field>
          </div>
        </Form>
      </details>
      <Notice error={apps.error || jobs.error} />
      <div className="application-list">
        {apps.data.map((item) => (
          <button
            key={item.id}
            className={`application-row ${selected === item.id ? "selected" : ""}`}
            onClick={() => {
              setSelected(item.id);
              setAnalysis(null);
              setDraft(null);
              setEvidenceIds([]);
            }}
          >
            <span className="company-avatar">
              {item.company?.slice(0, 1) || "P"}
            </span>
            <span className="grow">
              <strong>
                {item.company ||
                  jobs.data.find((j) => j.id === item.jobId)?.company}
              </strong>
              <small>{item.title}</small>
            </span>
            <span className="badge">{label(item.stage)}</span>
          </button>
        ))}
      </div>
      {!apps.data.length && (
        <Empty
          title={t("첫 지원을 시작하세요", "Start your first application")}
        >
          {t(
            "공고 원문을 등록하면 회사별 작업공간이 만들어집니다.",
            "Add a job posting to create a company workspace.",
          )}
        </Empty>
      )}
      {app && (
        <>
          <div className="panel">
            <div className="row">
              <h2>
                {job?.company} · {job?.title}
              </h2>
              <button onClick={() => onOpen(app.id)}>
                {t("채팅 열기", "Open chat")} ↗
              </button>
            </div>
            <div className="stages">
              {stages.map((s) => (
                <span className={s === app.stage ? "active" : ""} key={s}>
                  {label(s)}
                </span>
              ))}
            </div>
            <div className="actions">
              {!["READY", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(
                app.stage,
              ) && (
                <Action
                  run={async () => {
                    await request(`applications/${app.id}`, "PATCH", {
                      expectedRevision: app.revision,
                      stage: stages[stages.indexOf(app.stage) + 1],
                    });
                    await apps.reload();
                  }}
                >
                  {t("다음 단계", "Next stage")}
                </Action>
              )}
              {!["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(app.stage) && (
                <Action
                  run={async () => {
                    await request(`applications/${app.id}`, "PATCH", {
                      expectedRevision: app.revision,
                      stage: "WITHDRAWN",
                    });
                    await apps.reload();
                  }}
                >
                  {t("지원 철회 기록", "Record withdrawal")}
                </Action>
              )}
            </div>
            <Form
              resetOnSuccess={false}
              key={app.id}
              onSubmit={async (f) => {
                await request(`applications/${app.id}`, "PATCH", {
                  expectedRevision: app.revision,
                  notes: text(f, "notes"),
                });
                await apps.reload();
              }}
            >
              <Field label={t("메모", "Notes")}>
                <textarea name="notes" defaultValue={app.notes} />
              </Field>
            </Form>
          </div>
          <div className="panel">
            <h3>{t("공고 분석에 사용할 근거", "Evidence for job analysis")}</h3>
            {evidence.data.map((e) => (
              <div key={e.id}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={evidenceIds.includes(e.id)}
                    onChange={(event) =>
                      setEvidenceIds(
                        event.target.checked
                          ? [...evidenceIds, e.id]
                          : evidenceIds.filter((id) => id !== e.id),
                      )
                    }
                  />
                  {e.title}
                </label>
                {evidenceIds.includes(e.id) && (
                  <Approval
                    kind="EVIDENCE_USE"
                    applicationId={app.id}
                    targetId={e.id}
                    summary={`${t("근거 사용", "Use evidence")}: ${e.title}`}
                    reviewContent={
                      <>
                        <p>
                          {app.company || job?.company} ·{" "}
                          {app.title || job?.title}
                        </p>
                        <p className="source-text">{e.sourceText}</p>
                        {e.sourceUrl && (
                          <a
                            href={e.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {e.sourceUrl}
                          </a>
                        )}
                      </>
                    }
                  />
                )}
              </div>
            ))}
            <Action
              run={async () =>
                setAnalysis(
                  await runOperation<Resource>(`jobs/${app.jobId}/analyze`, {
                    applicationId: app.id,
                    expectedRevision: job?.revision,
                    evidenceIds,
                    ai: null,
                  }),
                )
              }
            >
              {t("요구 기술 분석", "Analyze requirements")}
            </Action>
            {analysis && (
              <div className="analysis">
                <p>
                  {label(analysis.method)} ·{" "}
                  {analysis.fitScore === null
                    ? t("평가 불가", "Not scored")
                    : `${analysis.fitScore}%`}
                </p>
                <p>
                  {t("일치", "Matched")}:{" "}
                  {analysis.matched
                    ?.map((m: { requirement: string }) => m.requirement)
                    .join(", ") || "—"}
                </p>
                <p>
                  {t("보완할 기술", "Gaps")}:{" "}
                  {analysis.missing?.join(", ") || "—"}
                </p>
              </div>
            )}
          </div>
          {app.stage === "READY" && (
            <div className="panel">
              <h3>{t("수동 제출 기록", "Record a manual submission")}</h3>
              <Form
                submitLabel={t("제출 내용 검토", "Review submission")}
                onSubmit={async (f) =>
                  setDraft(
                    await request<Resource>(
                      `applications/${app.id}/submission-drafts`,
                      "POST",
                      {
                        expectedRevision: app.revision,
                        mode: "MANUAL_RECORD",
                        documentVersionIds: f.getAll("versions"),
                        confirmedSubmitted: true,
                      },
                    ),
                  )
                }
              >
                <p className="muted">
                  {t(
                    "채용 사이트에서 직접 제출한 뒤 확인하세요. 이 버튼은 외부 전송을 하지 않습니다.",
                    "Confirm after submitting on the job site. This does not send externally.",
                  )}
                </p>
                {documents.data
                  .filter(
                    (d) => d.applicationId === app.id && d.finalizedVersionId,
                  )
                  .map((d) => (
                    <label className="check" key={d.id}>
                      <input
                        type="checkbox"
                        name="versions"
                        value={d.finalizedVersionId}
                      />
                      {d.title}
                    </label>
                  ))}
                <label className="check">
                  <input required type="checkbox" />
                  {t(
                    "외부 사이트에 실제 제출했습니다",
                    "I submitted on the external site",
                  )}
                </label>
              </Form>
              {draft && (
                <Approval
                  kind="APPLICATION_SUBMIT"
                  applicationId={app.id}
                  targetId={draft.id}
                  summary={t(
                    "이 제출 기록 승인",
                    "Approve this submission record",
                  )}
                  onApproved={async (approval) => {
                    await request(
                      `applications/${app.id}/submissions`,
                      "POST",
                      {
                        expectedRevision: app.revision,
                        draftId: draft.id,
                        approvalId: approval.id,
                      },
                    );
                    setDraft(null);
                    await apps.reload();
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
