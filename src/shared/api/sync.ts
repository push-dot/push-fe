import { create } from "zustand";
import { localRead, localWrite } from "@/shared/storage";
import { useSession } from "@/shared/auth";
import { request } from "./client";
import { applyCachedChanges, refresh, type CacheChange } from "./resources";
export type SyncMutation = {
  mutationId: string;
  resourceId: string;
  expectedRevision: number;
} & (
  | {
      resourceType: "APPLICATION";
      action: "UPDATE_NOTES";
      payload: { notes: string };
    }
  | {
      resourceType: "CALENDAR_EVENT";
      action: "UPDATE_LOCAL";
      payload: {
        title?: string;
        startsAt?: string;
        endsAt?: string;
        timeZone?: string;
        notes?: string;
      };
    }
);
export type QueuedMutation = {
  mutation: SyncMutation;
  status: "PENDING" | "CONFLICT" | "REJECTED";
  error?: string;
};
export type SyncResult = {
  mutationId: string;
  status: "APPLIED" | "CONFLICT" | "REJECTED";
  resource: { id: string; revision: number } | null;
  error: { message: string } | null;
};
export const mergeSyncResults = (
  current: QueuedMutation[],
  sent: QueuedMutation[],
  results: SyncResult[],
): QueuedMutation[] =>
  current.flatMap((item) => {
    const exact = results.find(
      (r) => r.mutationId === item.mutation.mutationId,
    );
    if (exact)
      return exact.status === "APPLIED"
        ? []
        : [
            {
              ...item,
              status: exact.status,
              error: exact.error?.message || exact.status,
            },
          ];
    const predecessor = sent.find(
      (old) =>
        old.mutation.resourceId === item.mutation.resourceId &&
        old.mutation.resourceType === item.mutation.resourceType,
    );
    const applied = results.find(
      (r) =>
        r.mutationId === predecessor?.mutation.mutationId &&
        r.status === "APPLIED",
    );
    return [
      {
        ...item,
        mutation: {
          ...item.mutation,
          expectedRevision:
            applied?.resource?.revision ?? item.mutation.expectedRevision,
        },
      },
    ];
  });

export const useOutbox = create<{ items: QueuedMutation[]; busy: boolean }>(
  () => ({ items: [], busy: false }),
);
let edits = Promise.resolve();
const updateQueue = (
  account: string,
  update: (items: QueuedMutation[]) => QueuedMutation[],
) => {
  const operation = edits
    .catch(() => undefined)
    .then(async () => {
      const items = update(
        (await localRead<QueuedMutation[]>(account, "sync:outbox")) || [],
      );
      await localWrite(account, "sync:outbox", items);
      if (account === useSession.getState().accountId)
        useOutbox.setState({ items });
    });
  edits = operation;
  return operation;
};
export const restoreOutbox = async () => {
  const account = useSession.getState().accountId;
  if (account) {
    const items =
      (await localRead<QueuedMutation[]>(account, "sync:outbox")) || [];
    if (account === useSession.getState().accountId)
      useOutbox.setState({ items });
  }
};
export const queueMutation = (mutation: SyncMutation) => {
  const account = useSession.getState().accountId;
  if (!account) throw new Error("No offline account");
  return updateQueue(account, (items) => [
    ...items.filter(
      (item) =>
        item.mutation.resourceId !== mutation.resourceId ||
        item.mutation.resourceType !== mutation.resourceType,
    ),
    { mutation, status: "PENDING" },
  ]);
};
export const discardMutation = (id: string) =>
  updateQueue(useSession.getState().accountId, (items) =>
    items.filter((item) => item.mutation.mutationId !== id),
  );
export const rebaseMutation = (id: string, revision: number) =>
  updateQueue(useSession.getState().accountId, (items) =>
    items.map((item) =>
      item.mutation.mutationId === id
        ? {
            mutation: {
              ...item.mutation,
              expectedRevision: revision,
              mutationId: crypto.randomUUID(),
            },
            status: "PENDING",
          }
        : item,
    ),
  );
export const synchronize = async () => {
  if (useOutbox.getState().busy) return;
  const { accountId: account, generation } = useSession.getState();
  if (!account) throw new Error("Sign in before synchronizing");
  const current = () =>
    useSession.getState().accountId === account &&
    useSession.getState().generation === generation;
  useOutbox.setState({ busy: true });
  try {
    await restoreOutbox();
    let clientId = await localRead<string>(account, "sync:client-id");
    if (!clientId) {
      clientId = crypto.randomUUID();
      await localWrite(account, "sync:client-id", clientId);
    }
    const pending = useOutbox
      .getState()
      .items.filter((item) => item.status === "PENDING");
    for (let i = 0; i < pending.length; i += 50) {
      if (!current()) throw new Error("Session changed");
      const sent = pending.slice(i, i + 50);
      const result = await request<{ results: SyncResult[] }>(
        "sync/mutations",
        "POST",
        { clientId, mutations: sent.map((item) => item.mutation) },
      );
      await updateQueue(account, (items) =>
        mergeSyncResults(items, sent, result.results),
      );
    }
    let cursor = await localRead<string>(account, "sync:cursor");
    let more = true;
    while (more) {
      if (!current()) throw new Error("Session changed");
      let page: {
        changes: CacheChange[];
        nextCursor: string;
        hasMore: boolean;
      };
      try {
        page = await request(
          `sync/changes?limit=100${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`,
        );
      } catch (error) {
        if (
          cursor &&
          (error as { code?: string }).code === "SYNC_CURSOR_EXPIRED"
        ) {
          cursor = null;
          await localWrite(account, "sync:cursor", null);
          await Promise.all(
            ["applications", "documents", "career-evidence", "projects"].map(
              refresh,
            ),
          );
          continue;
        }
        throw error;
      }
      await applyCachedChanges(account, page.changes);
      cursor = page.nextCursor;
      await localWrite(account, "sync:cursor", cursor);
      more = page.hasMore;
    }
  } finally {
    if (current()) useOutbox.setState({ busy: false });
  }
};
useSession.subscribe((state, previous) => {
  if (state.accountId !== previous.accountId)
    useOutbox.setState({ items: [], busy: false });
});
