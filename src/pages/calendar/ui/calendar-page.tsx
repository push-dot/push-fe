import { monthPeriod, dateKey, localDateTime } from "../model/calendar-period";
import { useState } from "react";
import {
  request,
  useResources,
  queueMutation,
  useOutbox,
  synchronize,
  type Resource,
} from "@/shared/api";
import { Field, Form, Empty, Notice, Action, text } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
export const CalendarPage = () => {
  const t = useT();
  const label = useLabel();
  const [month, setMonth] = useState(dateKey(new Date()).slice(0, 7));
  const { from, to, days } = monthPeriod(month);
  const events = useResources(
    `calendar/events?from=${from.toISOString()}&to=${to.toISOString()}`,
  );
  const outbox = useOutbox((s) => s.items);
  const displayed: Resource[] = events.data.map((event) => ({
    ...event,
    ...outbox.find(
      (item) =>
        item.mutation.resourceType === "CALENDAR_EVENT" &&
        item.mutation.resourceId === event.id,
    )?.mutation.payload,
  }));
  const apps = useResources("applications");
  const routines = useResources("routines");
  return (
    <div className="page wide">
      <div className="page-heading">
        <div>
          <h1>{t("캘린더", "Calendar")}</h1>
        </div>
        <input
          aria-label={t("월 선택", "Month")}
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
        />
      </div>
      <div className="calendar-grid">
        {Array.from({ length: from.getDay() }, (_, i) => (
          <div className="calendar-day" aria-hidden="true" key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
          return (
            <div className="calendar-day" key={date}>
              <span>{i + 1}</span>
              {displayed
                .filter((e) => dateKey(new Date(e.startsAt)) === date)
                .map((e) => (
                  <details key={e.id}>
                    <summary>{e.title}</summary>
                    <small>
                      {new Date(e.startsAt).toLocaleString()} ·{" "}
                      {label(e.source)}
                    </small>
                    <p>{e.notes}</p>
                    {e.source === "LOCAL" && (
                      <Form
                        resetOnSuccess={false}
                        submitLabel={t("기기에 저장", "Save on device")}
                        onSubmit={async (form) => {
                          await queueMutation({
                            mutationId: crypto.randomUUID(),
                            resourceType: "CALENDAR_EVENT",
                            resourceId: e.id,
                            expectedRevision:
                              outbox.find(
                                (item) => item.mutation.resourceId === e.id,
                              )?.mutation.expectedRevision ?? e.revision,
                            action: "UPDATE_LOCAL",
                            payload: {
                              title: text(form, "title"),
                              notes: text(form, "notes"),
                              startsAt: new Date(
                                text(form, "startsAt"),
                              ).toISOString(),
                              endsAt: new Date(
                                text(form, "endsAt"),
                              ).toISOString(),
                              timeZone: e.timeZone,
                            },
                          });
                          if (navigator.onLine)
                            void synchronize().catch(() => undefined);
                        }}
                      >
                        <Field label={t("제목", "Title")}>
                          <input name="title" defaultValue={e.title} required />
                        </Field>
                        <Field label={t("메모", "Notes")}>
                          <textarea name="notes" defaultValue={e.notes} />
                        </Field>
                        <Field label={t("시작", "Start")}>
                          <input
                            name="startsAt"
                            type="datetime-local"
                            required
                            defaultValue={localDateTime(e.startsAt)}
                          />
                        </Field>
                        <Field label={t("종료", "End")}>
                          <input
                            name="endsAt"
                            type="datetime-local"
                            required
                            defaultValue={localDateTime(e.endsAt)}
                          />
                        </Field>
                      </Form>
                    )}
                  </details>
                ))}
            </div>
          );
        })}
      </div>
      <Notice error={events.error} />
      <details className="panel">
        <summary>{t("일정 추가", "Add event")}</summary>
        <Form
          onSubmit={async (f) => {
            await request("calendar/events", "POST", {
              title: text(f, "title"),
              type: text(f, "type"),
              startsAt: new Date(text(f, "startsAt")).toISOString(),
              endsAt: new Date(text(f, "endsAt")).toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              ...(text(f, "applicationId")
                ? { applicationId: text(f, "applicationId") }
                : {}),
            });
            await events.reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("제목", "Title")}>
              <input name="title" required />
            </Field>
            <Field label={t("지원", "Application")}>
              <select name="applicationId">
                <option value="">{t("개인 일정", "Personal")}</option>
                {apps.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} · {a.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("시작", "Start")}>
              <input type="datetime-local" name="startsAt" required />
            </Field>
            <Field label={t("종료", "End")}>
              <input type="datetime-local" name="endsAt" required />
            </Field>
            <Field label={t("유형", "Type")}>
              <select name="type">
                <option value="CUSTOM">{label("CUSTOM")}</option>
                <option value="DEADLINE">{label("DEADLINE")}</option>
                <option value="FOLLOW_UP">{label("FOLLOW_UP")}</option>
              </select>
            </Field>
          </div>
        </Form>
      </details>
      <div className="row">
        <h2>{t("루틴", "Routines")}</h2>
        <Action
          run={async () => {
            await request("routines/suggest", "POST", {});
            await routines.reload();
          }}
        >
          {t("필요한 작업 제안", "Suggest next actions")}
        </Action>
      </div>
      {routines.data.map((r) => (
        <div className="panel row" key={r.id}>
          <div className="grow">
            <h3>{r.title}</h3>
            <p className="muted">
              {r.reason} · {new Date(r.dueAt).toLocaleString()}
            </p>
          </div>
          <span className="badge">{label(r.status)}</span>
          {["SUGGESTED", "CONFIRMED"].includes(r.status) && (
            <Action
              run={async () => {
                await request(`routines/${r.id}`, "PATCH", {
                  expectedRevision: r.revision,
                  status: r.status === "SUGGESTED" ? "CONFIRMED" : "DONE",
                });
                await routines.reload();
              }}
            >
              {r.status === "SUGGESTED"
                ? t("확인", "Confirm")
                : t("완료", "Done")}
            </Action>
          )}
        </div>
      ))}
      {!routines.data.length && (
        <Empty title={t("예정된 루틴이 없습니다", "No upcoming routines")} />
      )}
    </div>
  );
};
