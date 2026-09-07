import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  records: new Map<string, string>(),
  list: vi.fn(),
}));
vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: async (cmd: string, args: any) => {
    if (cmd === "local_read") return state.records.get(args.key) ?? null;
    if (cmd === "local_write") state.records.set(args.key, args.value);
  },
}));
vi.mock("@/shared/auth", () => ({
  useSession: {
    getState: () => ({
      accountId: "account",
      generation: 1,
      accessToken: "token",
    }),
    subscribe: vi.fn(),
  },
}));
vi.mock("@/shared/api/client", () => ({
  listAll: state.list,
  request: vi.fn(),
}));
import {
  refresh,
  applyCachedChanges,
  resetCache,
} from "@/shared/api/resources";
import { localRead, localWrite } from "@/shared/storage";
beforeEach(() => {
  state.records.clear();
  state.list.mockReset();
  resetCache();
});
it.each([false, true])(
  "preserves sync changes including deletion=%s when an earlier list snapshot completes afterwards",
  async (deleted) => {
    const old = {
      id: "app",
      revision: 1,
      createdAt: "",
      updatedAt: "",
      notes: "old",
    };
    const newer = { ...old, revision: 2, notes: "new" };
    await localWrite("account", "cache:applications", [old]);
    let release!: (v: unknown) => void;
    state.list.mockImplementation(
      () =>
        new Promise((r) => {
          release = r;
        }),
    );
    const fetch = refresh("applications");
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    await applyCachedChanges("account", [
      {
        resourceType: "APPLICATION",
        resourceId: "app",
        revision: 2,
        sequence: 2,
        deleted,
        data: deleted ? null : newer,
      },
    ]);
    expect(await localRead("account", "cache:applications")).toEqual(
      deleted ? [] : [newer],
    );
    release([old]);
    await fetch;
    expect(await localRead("account", "cache:applications")).toEqual(
      deleted ? [] : [newer],
    );
  },
);

it("ignores an older overlapping refresh after the newer response adds a resource", async () => {
  const old = { id: "app", revision: 1 };
  const newer = { id: "app", revision: 2 };
  const added = { id: "added", revision: 1 };
  await localWrite("account", "cache:applications", [old]);
  const releases: ((rows: unknown[]) => void)[] = [];
  state.list.mockImplementation(
    () => new Promise((resolve) => releases.push(resolve)),
  );
  const first = refresh("applications");
  await vi.waitFor(() => expect(releases).toHaveLength(1));
  const second = refresh("applications");
  await vi.waitFor(() => expect(releases).toHaveLength(2));
  releases[1]([newer, added]);
  await second;
  releases[0]([old]);
  await first;
  expect(await localRead("account", "cache:applications")).toEqual([
    newer,
    added,
  ]);
});
