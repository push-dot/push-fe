import { it, expect } from "vitest";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { renderPdf, renderDocx } from "@/pages/documents/model/document-export";
it("exports Korean, links, and long content into extractable multipage PDF and DOCX", async () => {
  const blocks = Array.from({ length: 90 }, (_, i) => ({
    id: String(i),
    text: `한글 경력 ${i}: React 프로젝트 https://example.com`,
    evidenceRefs: [],
  }));
  const font = readFileSync("public/fonts/nanum-gothic.ttf");
  const pdf = await renderPdf("이력서", blocks, "MODERN", font);
  mkdirSync("artifacts", { recursive: true });
  writeFileSync("artifacts/korean.pdf", pdf.bytes);
  const extracted = execFileSync("pdftotext", [
    "artifacts/korean.pdf",
    "-",
  ]).toString();
  expect(extracted).toContain("한글 경력 89");
  expect(pdf.pageCount).toBeGreaterThan(1);
  expect(pdf.links).toBe(true);
  const docx = await renderDocx("자기소개서", blocks, "CLASSIC");
  writeFileSync("artifacts/korean.docx", docx);
  const xml = execFileSync("unzip", [
    "-p",
    "artifacts/korean.docx",
    "word/document.xml",
  ]).toString();
  expect(xml).toContain("한글 경력 89");
  expect(xml).toContain("w:hyperlink");
});
it("retains a named hyperlink from TipTap content in a DOCX export", async () => {
  const { withLinks } = await import("@/pages/documents/model/document-export");
  const blocks = [{ id: "b", text: "포트폴리오", evidenceRefs: [] }];
  const enriched = withLinks(
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { blockId: "b" },
          content: [
            {
              type: "text",
              text: "포트폴리오",
              marks: [
                { type: "link", attrs: { href: "https://example.com/work" } },
              ],
            },
          ],
        },
      ],
    },
    blocks,
  );
  const bytes = await renderDocx("이력서", enriched, "MODERN");
  writeFileSync("artifacts/linked.docx", bytes);
  const relationships = execFileSync("unzip", [
    "-p",
    "artifacts/linked.docx",
    "word/_rels/document.xml.rels",
  ]).toString();
  expect(relationships).toContain("https://example.com/work");
});
