import JSZip from "jszip";
import type { RenderBlock } from "./document-export";
const plain = (value: string) => value.replace(/\s+/g, "");
export const validateExport = async (
  bytes: Uint8Array,
  format: "PDF" | "DOCX",
  blocks: RenderBlock[],
) => {
  let extracted = "";
  const foundLinks: string[] = [];
  if (format === "PDF") {
    const pdfjs = await import("pdfjs-dist");
    if (typeof window !== "undefined")
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).href;
    const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const text = await page.getTextContent();
      extracted += text.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      const annotations = await page.getAnnotations();
      foundLinks.push(
        ...annotations
          .filter((a) => typeof a.url === "string")
          .map((a) => a.url),
      );
    }
    await doc.destroy();
  } else {
    const archive = await JSZip.loadAsync(bytes);
    const xml = await archive.file("word/document.xml")?.async("string");
    if (!xml) throw new Error("Document content missing");
    extracted = xml
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const relationships =
      (await archive.file("word/_rels/document.xml.rels")?.async("string")) ||
      "";
    foundLinks.push(
      ...Array.from(relationships.matchAll(/Target="(https?:[^" ]+)"/g), (m) =>
        m[1].replace(/&amp;/g, "&"),
      ),
    );
  }
  const atsText = blocks.every((block) =>
    plain(extracted).includes(plain(block.text)),
  );
  const koreanText = blocks
    .filter((block) => /[가-힣]/.test(block.text))
    .every((block) => plain(extracted).includes(plain(block.text)));
  const expectedLinks = blocks.flatMap((block) =>
    block.links?.length
      ? block.links.map((link) => link.href)
      : block.text.match(/https?:\/\/[^\s]+/g) || [],
  );
  const links = expectedLinks.every((url) =>
    foundLinks.some((found) => found === url || found === url + "/"),
  );
  return { atsText, koreanText, links };
};
