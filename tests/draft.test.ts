import { describe, it, expect } from "vitest";
import { reconcileDraft, type Draft } from "@/pages/documents/model/draft";
const draft: Draft = {
  documentId: "a",
  baseRevision: 2,
  text: "수정한 근거",
  evidenceIds: ["e"],
  updatedAt: "2026-09-07",
};
describe("offline document recovery", () => {
  it("keeps local edits when the server revision changes", () => {
    expect(reconcileDraft(draft, { id: "a", revision: 3 })).toEqual({
      status: "conflict",
      draft,
    });
  });
  it("never restores another application document into the current editor", () => {
    expect(reconcileDraft(draft, { id: "b", revision: 2 })).toEqual({
      status: "clean",
    });
  });
  it("makes unchanged-revision drafts safe to sync", () => {
    expect(reconcileDraft(draft, { id: "a", revision: 2 })).toEqual({
      status: "pending",
      draft,
    });
  });
});
