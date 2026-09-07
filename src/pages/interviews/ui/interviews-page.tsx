import { useSession } from "@/shared/auth";
import { InterviewEditor } from "./interview-editor";
import { Approval } from "@/features/approval";
import { useState, useRef, useEffect } from "react";
import {
  request,
  useResources,
  runOperation,
  type Resource,
} from "@/shared/api";
import { Field, Form, Empty, Notice, Action, text, lines } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
export const InterviewsPage = () => {
  const t = useT();
  const [applicationId, setApplicationId] = useState("");
  const evidence = useResources("career-evidence");
  const label = useLabel();
  const interviews = useResources("interviews");
  const accountId = useSession((state) => state.accountId);
  const [acknowledged, setAcknowledged] = useState<Record<string, Resource>>(
    {},
  );
  useEffect(() => setAcknowledged({}), [accountId]);
  const currentInterviews = interviews.data.map((record) =>
    acknowledged[record.id]?.revision > record.revision
      ? acknowledged[record.id]
      : record,
  );
  const apps = useResources("applications");
  const offers = useResources("offers");
  const savedRevisions = useRef<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [prep, setPrep] = useState<Record<string, Resource>>({});
  const [comparison, setComparison] = useState<Resource | null>(null);
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t("면접 준비", "Interview preparation")}</h1>
        </div>
      </div>
      <details className="panel" open={!interviews.data.length}>
        <summary>{t("면접 추가", "Add interview")}</summary>
        <Form
          onSubmit={async (f) => {
            await request("interviews", "POST", {
              applicationId: text(f, "applicationId"),
              title: text(f, "title"),
              scheduledAt: new Date(text(f, "scheduledAt")).toISOString(),
              durationMinutes: 60,
              evidenceIds: f.getAll("evidenceIds"),
            });
            await interviews.reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("지원", "Application")}>
              <select
                required
                name="applicationId"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
              >
                <option value="">{t("선택", "Select")}</option>
                {apps.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} · {a.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("면접 제목", "Interview title")}>
              <input name="title" required />
            </Field>
            <Field label={t("일시", "Date")}>
              <input type="datetime-local" name="scheduledAt" required />
            </Field>
          </div>
          {applicationId && (
            <details>
              <summary>
                {t("면접 답변에 사용할 근거", "Evidence for interview answers")}
              </summary>
              {evidence.data.map((e) => (
                <div key={e.id}>
                  <label className="check">
                    <input type="checkbox" name="evidenceIds" value={e.id} />
                    {e.title}
                  </label>
                  <Approval
                    kind="EVIDENCE_USE"
                    applicationId={applicationId}
                    targetId={e.id}
                    summary={`${t("근거 사용", "Use evidence")}: ${e.title}`}
                    reviewContent={
                      <p className="source-text">{e.sourceText}</p>
                    }
                  />
                </div>
              ))}
            </details>
          )}
        </Form>
      </details>
      <Notice error={interviews.error} />
      {currentInterviews.map((i) => (
        <div className="panel" key={i.id}>
          <div className="row">
            <div className="grow">
              <h2>{i.title}</h2>
              <p className="muted">
                {new Date(i.scheduledAt).toLocaleString()}
              </p>
            </div>
            <Action
              disabled={saving[i.id]}
              run={async () => {
                const result = await runOperation<Resource>(
                  `interviews/${i.id}/prepare`,
                  { expectedRevision: i.revision, ai: null },
                );
                if (
                  Math.max(savedRevisions.current[i.id] || 0, i.revision) ===
                  i.revision
                )
                  setPrep((current) => ({ ...current, [i.id]: result }));
              }}
            >
              {t("질문 준비", "Prepare questions")}
            </Action>
          </div>
          {prep[i.id] && (
            <div>
              <h3>{t("예상 질문", "Practice questions")}</h3>
              {prep[i.id].questions?.map(
                (q: { question: string }, n: number) => (
                  <p key={n}>{q.question}</p>
                ),
              )}
              {prep[i.id].starAnswers?.map(
                (
                  a: {
                    situation: string;
                    task: string;
                    action: string;
                    result: string;
                  },
                  n: number,
                ) => (
                  <blockquote key={n}>
                    {a.situation}
                    <br />
                    {a.task}
                    <br />
                    {a.action}
                    <br />
                    {a.result}
                  </blockquote>
                ),
              )}
            </div>
          )}
          <div className="company-research">
            <h3>{t("회사 자료 검토", "Company source review")}</h3>
            {prep[i.id]?.research?.length ? (
              prep[i.id].research.map(
                (
                  item: {
                    claim: string;
                    sourceUrl: string;
                    accessedAt: string;
                    verificationStatus: string;
                  },
                  index: number,
                ) => (
                  <blockquote key={index}>
                    <p className="source-text">{item.claim}</p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.sourceUrl}
                    </a>
                    <p className="muted">
                      {t(
                        "사용자 제공 원문 · 확인 일시",
                        "User provided source · Accessed at",
                      )}
                      : {new Date(item.accessedAt).toLocaleString()}
                    </p>
                  </blockquote>
                ),
              )
            ) : (
              <p className="muted">
                {i.companySources?.length
                  ? t(
                      "저장한 회사 자료를 질문 준비에 반영하세요.",
                      "Prepare questions to review saved company sources.",
                    )
                  : t(
                      "회사 자료의 출처와 원문을 아래에 추가하세요.",
                      "Add company source URLs and text below.",
                    )}
              </p>
            )}
          </div>
          <InterviewEditor
            interview={i}
            onSave={async (patch) => {
              setSaving((current) => ({ ...current, [i.id]: true }));
              try {
                const updated = await request<Resource>(
                  `interviews/${i.id}`,
                  "PATCH",
                  patch,
                );
                setAcknowledged((current) => ({
                  ...current,
                  [i.id]:
                    current[i.id]?.revision > updated.revision
                      ? current[i.id]
                      : updated,
                }));
                savedRevisions.current[i.id] = updated.revision;
                setPrep((current) => {
                  const next = { ...current };
                  delete next[i.id];
                  return next;
                });
                await interviews.reload();
                return updated;
              } catch (error) {
                if ((error as { status?: number }).status === 409)
                  await interviews.reload();
                throw error;
              } finally {
                setSaving((current) => ({ ...current, [i.id]: false }));
              }
            }}
          />
        </div>
      ))}
      {!interviews.data.length && (
        <Empty title={t("등록된 면접이 없습니다", "No interviews yet")} />
      )}
      <h2>{t("오퍼 기록·비교", "Offers and comparison")}</h2>
      <details className="panel">
        <summary>{t("오퍼 추가", "Add offer")}</summary>
        <Form
          onSubmit={async (f) => {
            await request("offers", "POST", {
              applicationId: text(f, "applicationId"),
              company: text(f, "company"),
              annualSalaryMinor: Number(text(f, "annualSalaryMinor")),
              currency: text(f, "currency"),
              benefits: lines(text(f, "benefits")),
              notes: text(f, "notes"),
            });
            await offers.reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("지원", "Application")}>
              <select required name="applicationId">
                {apps.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("회사", "Company")}>
              <input name="company" required />
            </Field>
            <Field
              label={t("연봉 (통화 최소 단위)", "Annual salary (minor units)")}
            >
              <input
                name="annualSalaryMinor"
                type="number"
                min={0}
                step={1}
                required
              />
            </Field>
            <Field label={t("통화", "Currency")}>
              <select name="currency">
                <option value="KRW">{label("KRW")}</option>
                <option value="USD">{label("USD")}</option>
                <option value="EUR">{label("EUR")}</option>
              </select>
            </Field>
          </div>
          <Field label={t("복리후생", "Benefits")}>
            <input name="benefits" />
          </Field>
          <Field label={t("메모", "Notes")}>
            <textarea name="notes" />
          </Field>
        </Form>
      </details>
      {offers.data.map((o) => (
        <div className="panel row" key={o.id}>
          <h3 className="grow">{o.company}</h3>
          <strong>
            {o.annualSalaryMinor.toLocaleString()} {o.currency}
          </strong>
          <p>{o.benefits?.join(", ")}</p>
        </div>
      ))}
      {offers.data.length >= 2 && (
        <Action
          run={async () =>
            setComparison(
              await request<Resource>(
                `offers/compare?ids=${offers.data
                  .slice(0, 10)
                  .map((o) => o.id)
                  .join(",")}`,
              ),
            )
          }
        >
          {t("오퍼 비교", "Compare offers")}
        </Action>
      )}
      {comparison && (
        <div className="panel">
          <p>
            {comparison.comparison.sameCurrency
              ? t("같은 통화의 오퍼입니다.", "Offers use the same currency.")
              : t(
                  "통화가 달라 환산·순위를 제공하지 않습니다.",
                  "Different currencies; no conversion or ranking.",
                )}
          </p>
          <table>
            <tbody>
              {comparison.comparison.fields.map(
                (field: {
                  key: string;
                  values: { offerId: string; value: string }[];
                }) => (
                  <tr key={field.key}>
                    <th>{field.key}</th>
                    {field.values.map((v) => (
                      <td key={v.offerId}>{v.value || "—"}</td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
