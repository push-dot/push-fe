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
