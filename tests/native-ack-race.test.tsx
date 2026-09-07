import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocumentsPage } from "@/pages/documents";
const state = vi.hoisted(() => ({
  request: vi.fn(),
  list: vi.fn(),
  records: new Map<string, unknown>(),
  writes: vi.fn(async (...args: unknown[]) => {
    state.records.set(String(args[1]), args[2]);
  }),
}));
vi.mock("@/shared/api", () => ({
  request: state.request,
  listAll: state.list,
  runOperation: vi.fn(),
  useResources: (path: string) => ({
    data:
      path === "documents"
        ? [
            { id: "a", title: "Document A", revision: 2, template: "CLASSIC" },
            { id: "b", title: "Document B", revision: 2, template: "CLASSIC" },
          ]
        : [],
    reload: vi.fn(async () => {}),
    error: "",
  }),
}));
vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: vi.fn(async (command: string, args: any) => {
    if (command === "device_id") return "device";
    if (command === "local_read") {
      const snapshot = state.records.get(args.key);
      if (args.key === "draft:a" && native.delayRead) {
        native.delayRead = false;
        return new Promise((resolve) => {
          native.releaseRead = () =>
            resolve(snapshot == null ? null : JSON.stringify(snapshot));
        });
      }
      return snapshot == null ? null : JSON.stringify(snapshot);
    }
    if (command === "local_write") {
      if (args.key === "draft:a" && native.delayWrite) {
        native.delayWrite = false;
        await new Promise<void>((resolve) => {
          native.releaseWrite = resolve;
        });
      }
      state.records.set(args.key, JSON.parse(args.value));
    }
  }),
}));
const native = vi.hoisted(() => ({
  delayRead: false,
  delayWrite: false,
  releaseRead: undefined as undefined | (() => void),
  releaseWrite: undefined as undefined | (() => void),
}));
vi.mock("@/features/approval", () => ({ Approval: () => null }));
vi.mock("@/features/pin", () => ({ PinButton: () => null }));
vi.mock("@/shared/auth", () => {
  const hook = Object.assign(
    (select: (state: { accountId: string }) => unknown) =>
      select({ accountId: "account" }),
    { getState: () => ({ accountId: "account" }) },
  );
  return { useSession: hook };
});
const content = (text: string) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: { blockId: crypto.randomUUID() },
      content: [{ type: "text", text }],
    },
  ],
});
afterEach(() => vi.clearAllMocks());
beforeEach(() => {
  state.records.clear();
  native.delayRead = false;
  native.delayWrite = false;
  native.releaseRead = undefined;
  native.releaseWrite = undefined;
});
it.each(["sync", "version"])(
  "keeps typing during a native %s ACK read/write await",
  async (mode) => {
    let release!: (value: unknown) => void;
    state.list.mockImplementation(async (path: string) => [
      {
        id: path.includes("/a/") ? "va" : "vb",
        content: content(path.includes("/a/") ? "A text" : "B text"),
        blocks: [],
        number: 1,
      },
    ]);
    state.request.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const ui = render(<DocumentsPage initialDocumentId="a" />);
    const paragraph = await screen.findByText("A text");
    await act(async () => {
      paragraph.textContent = "A edit one";
    });
    await waitFor(() =>
      expect(JSON.stringify(state.records.get("draft:a"))).toContain(
        "A edit one",
      ),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: mode === "sync" ? "초안 동기화" : "새 버전 저장",
      }),
    );
    await waitFor(() => expect(state.request).toHaveBeenCalled());
    const sent =
      mode === "sync" ? state.request.mock.calls[0][2].mutations[0] : null;
    native.delayRead = true;
    await act(async () =>
      release(
        mode === "version"
          ? {
              document: { id: "a", revision: 3 },
              version: {
                id: "v2",
                content: content("A edit one"),
                blocks: [],
                number: 2,
              },
            }
          : {
              results: [
                {
                  mutationId: sent.mutationId,
                  status: "APPLIED",
                  resource: { revision: 1 },
                  error: null,
                },
              ],
            },
      ),
    );
    await waitFor(() => expect(native.releaseRead).toBeTypeOf("function"));
    native.delayWrite = true;
    await act(async () => {
      screen.getByText("A edit one").textContent = "A edit two";
    });
    expect(native.releaseWrite).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: /Document B/ }));
    await screen.findByText("B text");
    await act(async () => native.releaseRead!());
    await waitFor(() => expect(native.releaseWrite).toBeTypeOf("function"));
    await act(async () => native.releaseWrite!());
    await waitFor(() =>
      expect(JSON.stringify(state.records.get("draft:a"))).toContain(
        "A edit two",
      ),
    );
    const stored = state.records.get("draft:a") as {
      revision: number;
      baseRevision: number;
      mutation: { action: string; expectedRevision: number };
    };
    if (mode === "sync") {
      expect(stored.revision).toBe(1);
      expect(stored.mutation.action).toBe("UPDATE");
      expect(stored.mutation.expectedRevision).toBe(1);
    } else {
      expect(stored.baseRevision).toBe(3);
    }
    ui.unmount();
  },
);
