import { it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { request, runOperation, type Resource } from "@/shared/api";
import { useSession } from "@/shared/auth";
import {
  renderPdf,
  renderDocx,
  withLinks,
} from "@/pages/documents/model/document-export";
import { validateExport } from "@/pages/documents/model/export-validation";
it.skipIf(!process.env.PUSH_LIVE_EXPORT)(
  "registers validated PDF and DOCX against a real finalized API document",
  async () => {
    const token = process.env.DEV_AUTH_TOKEN;
    if (!token) throw new Error("Missing development credential");
    useSession.setState({
      apiUrl: process.env.PUSH_API_URL || "http://127.0.0.1:8080/api/v1",
      accessToken: token,
      refreshToken: "",
      accountId: "",
    });
    const fixture = `Export integration ${crypto.randomUUID()}`;
    const evidence = await request<Resource>("career-evidence", "POST", {
      kind: "CAREER",
      title: fixture,
      sourceText: "한글 경력: React 프로젝트를 구현했습니다.",
      skills: ["React"],
    });
    const job = await request<Resource>("jobs", "POST", {
      company: fixture,
      title: "Synthetic role",
      sourceKind: "TEXT",
      sourceText: "React 개발",
      requirements: ["React"],
      preferred: [],
    });
    const application = await request<Resource>("applications", "POST", {
      jobId: job.id,
    });
    const approve = async (kind: string, targetId: string) => {
      const approval = await request<Resource>("approvals", "POST", {
        kind,
        applicationId: application.id,
        targetId,
      });
      return request<Resource>(`approvals/${approval.id}/decision`, "POST", {
        expectedRevision: approval.revision,
        decision: "APPROVED",
      });
    };
    await approve("EVIDENCE_USE", evidence.id);
    const created = await request<Resource>("documents", "POST", {
      applicationId: application.id,
      title: fixture,
      kind: "RESUME",
      template: "CLASSIC",
    });
    const generated = await runOperation<{
      document: Resource;
      version: Resource;
    }>(`documents/${created.id}/generate`, {
      expectedRevision: created.revision,
      evidenceIds: [evidence.id],
      ai: null,
    });
    const approval = await approve("DOCUMENT_FINALIZE", generated.version.id);
    const document = await request<Resource>(
      `documents/${created.id}/finalize`,
      "POST",
      {
        expectedRevision: generated.document.revision,
        versionId: generated.version.id,
        approvalId: approval.id,
      },
    );
    for (const format of ["PDF", "DOCX"] as const) {
      const output = await request<Resource>(
        `documents/${document.id}/exports`,
        "POST",
        {
          versionId: document.finalizedVersionId,
          format,
          rendererVersion: "push-0.1.0",
        },
      );
      const blocks = withLinks(output.content, output.blocks);
      let bytes: Uint8Array;
      let pageCount: number | undefined;
      if (format === "PDF") {
        const rendered = await renderPdf(
          document.title,
          blocks,
          output.template,
          readFileSync("public/fonts/nanum-gothic.ttf"),
        );
        bytes = rendered.bytes;
        pageCount = rendered.pageCount;
      } else bytes = await renderDocx(document.title, blocks, output.template);
      const validation = await validateExport(bytes, format, blocks);
      expect(validation).toEqual({
        atsText: true,
        koreanText: true,
        links: true,
      });
      const result = await request<Resource>(
        `documents/${document.id}/exports/${output.id}/result`,
        "POST",
        {
          sha256: createHash("sha256").update(bytes).digest("hex"),
          byteLength: bytes.length,
          ...(pageCount ? { pageCount } : {}),
          validation,
          status: "SUCCEEDED",
        },
      );
      expect(result.status).toBe("SUCCEEDED");
      mkdirSync("artifacts", { recursive: true });
      writeFileSync(`artifacts/live-export.${format.toLowerCase()}`, bytes);
    }
  },
  30000,
);
