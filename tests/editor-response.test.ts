import { it, expect } from "vitest";
import {
  createEditorGuard,
  completeVersionSave,
} from "@/pages/documents/model/editor-response";
import { makeDraft } from "@/pages/documents/model/draft";
it("rejects a delayed load after typing or switching documents", async () => {
  const guard = createEditorGuard();
  guard.select("a");
  const ticket = guard.ticket();
  const delayed = Promise.resolve().then(() => guard.matches(ticket));
  guard.edit();
  expect(await delayed).toBe(false);
  guard.select("b");
  expect(guard.matches(ticket)).toBe(false);
});
it("preserves edits made while a version POST is pending and rebases them to the saved revision", () => {
  const sent = makeDraft(
    null,
    { id: "a", revision: 2 },
    { text: "sent" },
    [],
    [],
  );
  const current = makeDraft(
    sent,
    { id: "a", revision: 2 },
    { text: "new typing" },
    [],
    [],
  );
  const next = completeVersionSave(current, sent.mutation!.mutationId, 3);
  expect(next?.content).toEqual({ text: "new typing" });
  expect(next?.baseRevision).toBe(3);
  expect(completeVersionSave(sent, sent.mutation!.mutationId, 3)).toBeNull();
});
