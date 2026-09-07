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
it("renders visible Korean and Latin glyphs instead of an extraction-only PDF", async () => {
  const glyphs = [
    "한",
    "글",
    "경",
    "력",
    "서",
    "문",
    "가",
    "나",
    "다",
    "A",
    "B",
    "C",
    "1",
    "2",
    "3",
  ];
  const pdf = await renderPdf(
    "글꼴",
    glyphs.map((text, i) => ({ id: String(i), text, evidenceRefs: [] })),
    "CLASSIC",
    readFileSync("public/fonts/nanum-gothic.ttf"),
  );
  writeFileSync("artifacts/glyphs.pdf", pdf.bytes);
  execFileSync("pdftoppm", [
    "-r",
    "72",
    "-gray",
    "-singlefile",
    "artifacts/glyphs.pdf",
    "artifacts/glyphs",
  ]);
  const raster = readFileSync("artifacts/glyphs.pgm");
  const header = raster
    .toString("ascii", 0, 50)
    .match(/^P5\n(\d+) (\d+)\n255\n/);
  if (!header) throw new Error("Invalid raster");
  const width = Number(header[1]);
  const pixels = raster.subarray(header[0].length);
  for (let row = 0; row < glyphs.length; row++) {
    let ink = 0;
    for (let y = 88 + row * 31; y < 104 + row * 31; y++)
      for (let x = 57; x < 80; x++) if (pixels[y * width + x] < 180) ink++;
    expect(ink, `Visible glyph ${glyphs[row]}`).toBeGreaterThan(5);
  }
});
