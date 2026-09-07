import { it, expect } from "vitest";
import { makeDraft } from "@/pages/documents/model/draft";
it("keeps original base revision and stable draft identity while preserving edit plus outbox together", () => {
  const initial = makeDraft(
    null,
    { id: "document", revision: 2 },
    { type: "doc", content: [] },
    [],
    [],
  );
  const edited = makeDraft(
    initial,
    { id: "document", revision: 9 },
    { type: "doc", content: [] },
    [],
    [],
  );
  expect(edited.baseRevision).toBe(2);
  expect(edited.id).toBe(initial.id);
  expect(edited.mutation?.payload.baseDocumentRevision).toBe(2);
  expect(edited.mutation?.action).toBe("CREATE");
});
it("preserves edits typed while a previous draft sync is in flight", async () => {
  const { applyDraftSync } = await import("@/pages/documents/model/draft");
  const first = makeDraft(
    null,
    { id: "document", revision: 2 },
    { type: "doc", text: "first" },
    [],
    [],
  );
  const newer = makeDraft(
    first,
    { id: "document", revision: 2 },
    { type: "doc", text: "new edit" },
    [],
    [],
  );
  const merged = applyDraftSync(newer, first.mutation!.mutationId, 1);
  expect(merged.content).toEqual({ type: "doc", text: "new edit" });
  expect(merged.mutation?.action).toBe("UPDATE");
  expect(merged.mutation?.expectedRevision).toBe(1);
});
