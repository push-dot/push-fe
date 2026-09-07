import { PDFDocument, PDFName, PDFString, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  HeadingLevel,
} from "docx";
import type { JSONContent } from "@tiptap/react";
import type { Block } from "./document-content";
export type RenderBlock = Block & {
  links?: { start: number; end: number; href: string }[];
};
const linksFor = (block: RenderBlock) =>
  block.links?.length
    ? block.links
    : Array.from(block.text.matchAll(/https?:\/\/[^\s]+/g), (m) => ({
        start: m.index!,
        end: m.index! + m[0].length,
        href: m[0],
      }));
export const withLinks = (
  content: JSONContent,
  blocks: Block[],
): RenderBlock[] => {
  const links = new Map<string, NonNullable<RenderBlock["links"]>>();
  const walk = (node: JSONContent) => {
    if (["paragraph", "heading"].includes(node.type || "")) {
      let offset = 0;
      const spans: NonNullable<RenderBlock["links"]> = [];
      const text = (child: JSONContent) => {
        if (child.text) {
          for (const mark of child.marks || []) {
            if (mark.type === "link" && /^https?:\/\//.test(mark.attrs?.href))
              spans.push({
                start: offset,
                end: offset + child.text.length,
                href: mark.attrs!.href,
              });
          }
          offset += child.text.length;
        }
        child.content?.forEach(text);
      };
      text(node);
      links.set(node.attrs?.blockId, spans);
    } else node.content?.forEach(walk);
  };
  walk(content);
  return blocks.map((block) => ({
    ...block,
    links: links.get(block.id) || [],
  }));
};
export const renderPdf = async (
  title: string,
  blocks: RenderBlock[],
  template: string,
  fontBytes: Uint8Array,
) => {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: false });
  pdf.setTitle(title);
  pdf.setLanguage("ko-KR");
  const compact = template === "COMPACT";
  const margin = compact ? 42 : 58;
  const size = compact ? 10 : 11;
  const leading = compact ? 16 : 19;
  const width = 595.28,
    height = 841.89;
  let page = pdf.addPage([width, height]);
  let y = height - margin;
  let links = false;
  page.drawText(title, {
    x: margin,
    y,
    size: 22,
    font,
    color: template === "MODERN" ? rgb(0.32, 0.22, 0.65) : rgb(0.1, 0.1, 0.1),
  });
  y -= 42;
  for (const block of blocks) {
    let line = "";
    let offset = 0;
    let lineStart = 0;
    const lines: { text: string; start: number }[] = [];
    for (const char of Array.from(block.text)) {
      if (char === "\n") {
        lines.push({ text: line, start: lineStart });
        line = "";
        offset += char.length;
        lineStart = offset;
        continue;
      }
      if (font.widthOfTextAtSize(line + char, size) > width - 2 * margin) {
        lines.push({ text: line, start: lineStart });
        line = "";
        lineStart = offset;
      }
      line += char;
      offset += char.length;
    }
    lines.push({ text: line, start: lineStart });
    for (const value of lines) {
      if (y < margin + leading) {
        page = pdf.addPage([width, height]);
        y = height - margin;
      }
      page.drawText(value.text, {
        x: margin,
        y,
        size,
        font,
        color: rgb(0.12, 0.12, 0.12),
      });
      for (const link of linksFor(block)) {
        const start = Math.max(link.start - value.start, 0);
        const end = Math.min(link.end - value.start, value.text.length);
        if (start >= end) continue;
        links = true;
        const left =
          margin + font.widthOfTextAtSize(value.text.slice(0, start), size);
        const right =
          margin + font.widthOfTextAtSize(value.text.slice(0, end), size);
        const annotation = pdf.context.register(
          pdf.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [left, y - 2, right, y + size],
            Border: [0, 0, 0],
            A: { Type: "Action", S: "URI", URI: PDFString.of(link.href) },
          }),
        );
        let annots = page.node.Annots();
        if (!annots) {
          page.node.set(PDFName.of("Annots"), pdf.context.obj([]));
          annots = page.node.Annots();
        }
        annots?.push(annotation);
      }
      y -= leading;
    }
    y -= compact ? 7 : 12;
  }
  return { bytes: await pdf.save(), pageCount: pdf.getPageCount(), links };
};
export const renderDocx = async (
  title: string,
  blocks: RenderBlock[],
  template: string,
) => {
  const size = template === "COMPACT" ? 20 : 22;
  const paragraphs = blocks.map((block) => {
    const children: (TextRun | ExternalHyperlink)[] = [];
    let offset = 0;
    for (const link of linksFor(block).sort((a, b) => a.start - b.start)) {
      if (link.start > offset)
        children.push(
          new TextRun({
            text: block.text.slice(offset, link.start),
            font: "NanumGothic",
            size,
          }),
        );
      children.push(
        new ExternalHyperlink({
          link: link.href,
          children: [
            new TextRun({
              text: block.text.slice(link.start, link.end),
              style: "Hyperlink",
              font: "NanumGothic",
              size,
            }),
          ],
        }),
      );
      offset = link.end;
    }
    if (offset < block.text.length)
      children.push(
        new TextRun({
          text: block.text.slice(offset),
          font: "NanumGothic",
          size,
        }),
      );
    return new Paragraph({
      spacing: { after: template === "COMPACT" ? 100 : 200 },
      children,
    });
  });
  return new Uint8Array(
    await Packer.toArrayBuffer(
      new Document({
        creator: "Push",
        title,
        styles: {
          default: { document: { run: { font: "NanumGothic", size } } },
        },
        sections: [
          {
            properties: {
              page: {
                margin: { top: 850, bottom: 850, left: 850, right: 850 },
              },
            },
            children: [
              new Paragraph({
                heading: HeadingLevel.TITLE,
                children: [
                  new TextRun({
                    text: title,
                    font: "NanumGothic",
                    color: template === "MODERN" ? "5839A6" : "222222",
                  }),
                ],
              }),
              ...paragraphs,
            ],
          },
        ],
      }),
    ),
  );
};
