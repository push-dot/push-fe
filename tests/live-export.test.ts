import { it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { request, listAll, type Resource } from "@/shared/api";
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
    const environment = readFileSync("../.env.local-test", "utf8");
    const token = environment.match(/^DEV_AUTH_TOKEN=(.+)$/m)?.[1];
    if (!token) throw new Error("Missing development credential");
    useSession.setState({
      apiUrl: "http://127.0.0.1:8080/api/v1",
      accessToken: token,
      refreshToken: "",
      accountId: "",
    });
    const documents = await listAll<Resource>("documents");
    const document = documents.find((d) => d.finalizedVersionId);
    if (!document) throw new Error("No finalized local test document");
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
