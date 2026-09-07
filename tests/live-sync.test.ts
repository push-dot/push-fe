import { it, expect } from "vitest";
import { request, listAll, type Resource } from "@/shared/api";
import { useSession } from "@/shared/auth";
it.skipIf(!process.env.PUSH_LIVE_EXPORT)(
  "persists notes and calendar mutations, deduplicates replay, reports conflict, receives changes, and manages pins",
  async () => {
    const token = process.env.DEV_AUTH_TOKEN;
    if (!token) throw new Error("Set DEV_AUTH_TOKEN");
    useSession.setState({
      apiUrl: process.env.PUSH_API_URL || "http://127.0.0.1:8080/api/v1",
      accessToken: token,
      refreshToken: "",
      accountId: "",
    });
    const job = await request<Resource>("jobs", "POST", {
      company: `Sync fixture ${crypto.randomUUID()}`,
      title: "Synthetic role",
      sourceKind: "TEXT",
      sourceText: "React",
      requirements: ["React"],
      preferred: [],
    });
    const application = await request<Resource>("applications", "POST", {
      jobId: job.id,
    });
    const clientId = crypto.randomUUID();
    const mutation = {
      mutationId: crypto.randomUUID(),
      resourceType: "APPLICATION",
      resourceId: application.id,
      expectedRevision: application.revision,
      action: "UPDATE_NOTES",
      payload: { notes: "오프라인 메모" },
    };
    const sync = () =>
      request<{ results: Resource[] }>("sync/mutations", "POST", {
        clientId,
        mutations: [mutation],
      });
    const first = await sync();
    expect(first.results[0].status).toBe("APPLIED");
    expect((await sync()).results[0].resource.revision).toBe(
      first.results[0].resource.revision,
    );
    const conflict = await request<{ results: Resource[] }>(
      "sync/mutations",
      "POST",
      {
        clientId,
        mutations: [
          {
            ...mutation,
            mutationId: crypto.randomUUID(),
            payload: { notes: "stale" },
          },
        ],
      },
    );
    expect(conflict.results[0].status).toBe("CONFLICT");
    const event = await request<Resource>("calendar/events", "POST", {
      title: "Synthetic calendar",
      type: "CUSTOM",
      startsAt: "2026-09-15T00:00:00Z",
      endsAt: "2026-09-15T01:00:00Z",
      timeZone: "Asia/Seoul",
    });
    const calendar = await request<{ results: Resource[] }>(
      "sync/mutations",
      "POST",
      {
        clientId,
        mutations: [
          {
            mutationId: crypto.randomUUID(),
            resourceType: "CALENDAR_EVENT",
            resourceId: event.id,
            expectedRevision: event.revision,
            action: "UPDATE_LOCAL",
            payload: { notes: "Offline calendar note" },
          },
        ],
      },
    );
    expect(calendar.results[0].status).toBe("APPLIED");
    const changes: Resource[] = [];
    let cursor = "";
    let more = true;
    while (more) {
      const page = await request<{
        changes: Resource[];
        hasMore: boolean;
        nextCursor: string;
      }>(
        `sync/changes?limit=100${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`,
      );
      changes.push(...page.changes);
      cursor = page.nextCursor;
      more = page.hasMore;
    }
    expect(
      changes.some(
        (change) =>
          change.resourceId === application.id &&
          change.data.notes === "오프라인 메모",
      ),
    ).toBe(true);
    expect(
      changes.some(
        (change) =>
          change.resourceId === event.id &&
          change.data.notes === "Offline calendar note",
      ),
    ).toBe(true);
    const pin = await request<Resource>("pins", "POST", {
      resourceType: "JOB",
      resourceId: job.id,
    });
    expect((await listAll<Resource>("pins")).some((p) => p.id === pin.id)).toBe(
      true,
    );
    await request(`pins/${pin.id}`, "DELETE");
    expect((await listAll<Resource>("pins")).some((p) => p.id === pin.id)).toBe(
      false,
    );
  },
  30000,
);
