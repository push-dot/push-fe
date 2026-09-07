import { expect, it } from "vitest";
import { request, runOperation, type Resource } from "@/shared/api";
import { useSession } from "@/shared/auth";
it.skipIf(!process.env.PUSH_LIVE_EXPORT)(
  "persists source-backed interview research and records explicit rejection against the live API",
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
      company: `Interview fixture ${crypto.randomUUID()}`,
      title: "Synthetic developer",
      sourceKind: "TEXT",
      sourceText: "React experience",
      requirements: ["React"],
      preferred: [],
    });
    const app = await request<Resource>("applications", "POST", {
      jobId: job.id,
    });
    const interview = await request<Resource>("interviews", "POST", {
      applicationId: app.id,
      title: "Source review fixture",
      scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      evidenceIds: [],
    });
    const companySources = [
      {
        sourceUrl: "https://example.com/company",
        sourceText: "사용자가 확인한 테스트 회사 원문입니다.",
        accessedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    const updated = await request<Resource>(
      `interviews/${interview.id}`,
      "PATCH",
      { expectedRevision: interview.revision, companySources },
    );
    expect(
      (await request<Resource>(`interviews/${interview.id}`)).companySources,
    ).toEqual(companySources);
    const prepared = await runOperation<Resource>(
      `interviews/${interview.id}/prepare`,
      { expectedRevision: updated.revision, ai: null },
    );
    expect(prepared.research).toEqual([
      {
        claim: companySources[0].sourceText,
        sourceUrl: companySources[0].sourceUrl,
        accessedAt: companySources[0].accessedAt,
        verificationStatus: "USER_PROVIDED",
      },
    ]);
    const rejected = await request<Resource>(
      `applications/${app.id}`,
      "PATCH",
      { expectedRevision: app.revision, stage: "REJECTED" },
    );
    expect(rejected.stage).toBe("REJECTED");
  },
  30000,
);
