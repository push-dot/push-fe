import { it, expect } from "vitest";
import { buildBlocks } from "@/pages/documents/model/document-content";
it("covers heading and list text and preserves Unicode codepoint evidence offsets", () => {
  const content = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "한글" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "성과" }] },
            ],
          },
        ],
      },
    ],
  };
  const result = buildBlocks(content, [
    { id: "e", sourceText: "😀 한글 성과" },
  ]);
  expect(result.blocks.map((b) => b.evidenceRefs)).toEqual([
    [{ evidenceId: "e", start: 2, end: 4 }],
    [{ evidenceId: "e", start: 5, end: 7 }],
  ]);
  expect(result.blocks.map((b) => b.text)).toEqual(["한글", "성과"]);
  expect(new Set(result.blocks.map((b) => b.id)).size).toBe(2);
});
