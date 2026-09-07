import type { JSONContent } from "@tiptap/react";
export type EvidenceRef = { evidenceId: string; start: number; end: number };
export type Block = { id: string; text: string; evidenceRefs: EvidenceRef[] };
export const buildBlocks = (
  input: JSONContent,
  evidence: { id: string; sourceText: string }[],
): { content: JSONContent; blocks: Block[] } => {
  const content = structuredClone(input);
  const blocks: Block[] = [];
  const nodeText = (node: JSONContent): string =>
    node.text || node.content?.map(nodeText).join("") || "";
  const walk = (node: JSONContent) => {
    if (["paragraph", "heading"].includes(node.type || "")) {
      const text = nodeText(node);
      const id = node.attrs?.blockId || crypto.randomUUID();
      node.attrs = { ...node.attrs, blockId: id };
      const source = evidence.find(
        (e) => text.length > 0 && e.sourceText.includes(text),
      );
      const offset = source?.sourceText.indexOf(text) ?? -1;
      const start = source
        ? Array.from(source.sourceText.slice(0, offset)).length
        : 0;
      blocks.push({
        id,
        text,
        evidenceRefs: source
          ? [
              {
                evidenceId: source.id,
                start,
                end: start + Array.from(text).length,
              },
            ]
          : [],
      });
    } else node.content?.forEach(walk);
  };
  walk(content);
  return { content, blocks };
};
