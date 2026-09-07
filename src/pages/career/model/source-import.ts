export const extractSource = async (file: File) => {
  if (file.size > 20 * 1024 * 1024) throw new Error("File exceeds 20 MiB");
  const bytes = await file.arrayBuffer();
  const contentHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  let text = "";
  let format = "TEXT";
  if (/\.pdf$/i.test(file.name)) {
    format = "PDF";
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).href;
    const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
    if (pdf.numPages > 500) throw new Error("PDF exceeds 500 pages");
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items.map((item) => ("str" in item ? item.str : "")).join(" ") +
        "\n\n";
      const annotations = await page.getAnnotations();
      text += annotations
        .filter((a) => typeof a.url === "string" && /^https?:\/\//.test(a.url))
        .map((a) => a.url)
        .join("\n");
      if (text.length > 100000)
        throw new Error("Extracted text exceeds 100,000 characters");
    }
    await pdf.destroy();
  } else if (/\.docx$/i.test(file.name)) {
    format = "DOCX";
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(bytes);
    const xml = await zip.file("word/document.xml")?.async("string");
    if (!xml) throw new Error("Invalid DOCX");
    text = Array.from(
      xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g),
      (m) => m[1],
    )
      .join("\n")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    const rels =
      (await zip.file("word/_rels/document.xml.rels")?.async("string")) || "";
    text +=
      "\n" +
      Array.from(rels.matchAll(/Target="(https?:[^" ]+)"/g), (m) =>
        m[1].replace(/&amp;/g, "&"),
      ).join("\n");
  } else {
    format = /\.md$/i.test(file.name) ? "MARKDOWN" : "TEXT";
    text = new TextDecoder().decode(bytes);
  }
  if (!text.trim())
    throw new Error(
      "No readable text. Paste the source text for a scanned document.",
    );
  if (text.length > 100000)
    throw new Error("Extracted text exceeds 100,000 characters");
  return { text, format, contentHash };
};
