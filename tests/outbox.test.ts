import { it, expect } from "vitest";
import { mergeSyncResults, type QueuedMutation } from "@/shared/api/sync";
const item: QueuedMutation = {
  mutation: {
    mutationId: "first",
    resourceType: "APPLICATION",
    resourceId: "app",
    expectedRevision: 2,
    action: "UPDATE_NOTES",
    payload: { notes: "first" },
  },
  status: "PENDING",
};
it("retains rejected and conflicted edits and removes only acknowledged mutation IDs", () => {
  const result = mergeSyncResults(
    [item],
    [item],
    [
      {
        mutationId: "first",
        status: "CONFLICT",
        error: { message: "conflict" },
        resource: null,
      },
    ],
  );
  expect(result[0].mutation.payload).toEqual({ notes: "first" });
  expect(result[0].status).toBe("CONFLICT");
});
it("rebases a newer pending edit when an older sync completes", () => {
  const newer = {
    ...item,
    mutation: {
      ...item.mutation,
      mutationId: "newer",
      payload: { notes: "newer" },
    },
  } as QueuedMutation;
  const result = mergeSyncResults(
    [newer],
    [item],
    [
      {
        mutationId: "first",
        status: "APPLIED",
        resource: { id: "app", revision: 3 },
        error: null,
      },
    ],
  );
  expect(result[0].mutation.expectedRevision).toBe(3);
  expect(result[0].mutation.payload).toEqual({ notes: "newer" });
});
it("applies tombstones and ignores an older revision without overwriting cached newer data", async () => {
  const { mergeCacheChanges } = await import("@/shared/api/resources");
  const data = [
    { id: "a", revision: 4, createdAt: "", updatedAt: "", notes: "new" },
  ];
  expect(
    mergeCacheChanges("applications", data, [
      {
        resourceType: "APPLICATION",
        resourceId: "a",
        revision: 3,
        deleted: false,
        data: { ...data[0], notes: "old", revision: 3 },
        sequence: 1,
      },
    ]),
  ).toEqual(data);
  expect(
    mergeCacheChanges("applications", data, [
      {
        resourceType: "APPLICATION",
        resourceId: "a",
        revision: 5,
        deleted: true,
        data: null,
        sequence: 2,
      },
    ]),
  ).toEqual([]);
});
