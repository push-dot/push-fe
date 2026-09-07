import { useState } from "react";
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
  const label = useLabel();
  const interviews = useResources("interviews");
  const apps = useResources("applications");
  const offers = useResources("offers");
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
              evidenceIds: [],
            });
            await interviews.reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("지원", "Application")}>
              <select required name="applicationId">
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
        </Form>
      </details>
      <Notice error={interviews.error} />
      {interviews.data.map((i) => (
        <div className="panel" key={i.id}>
          <div className="row">
            <div className="grow">
              <h2>{i.title}</h2>
              <p className="muted">
                {new Date(i.scheduledAt).toLocaleString()}
              </p>
            </div>
            <Action
              run={async () =>
                setPrep({
                  ...prep,
                  [i.id]: await runOperation<Resource>(
                    `interviews/${i.id}/prepare`,
                    { expectedRevision: i.revision, ai: null },
                  ),
                })
              }
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
          <Form
            resetOnSuccess={false}
            onSubmit={async (f) => {
              await request(`interviews/${i.id}`, "PATCH", {
                expectedRevision: i.revision,
                notes: text(f, "notes"),
                reflection: text(f, "reflection"),
              });
              await interviews.reload();
            }}
          >
            <Field label={t("준비 메모", "Preparation notes")}>
              <textarea name="notes" defaultValue={i.notes} />
            </Field>
            <Field label={t("면접 회고", "Reflection")}>
              <textarea name="reflection" defaultValue={i.reflection} />
            </Field>
          </Form>
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
