import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
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
vi.mock("@/shared/storage", () => ({
  localRead: vi.fn(
    async (_account: string, key: string) => state.records.get(key) ?? null,
  ),
  localWrite: state.writes,
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
it("persists a delayed draft acknowledgment after switching documents", async () => {
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
  let paragraph = await screen.findByText("A text");
  await act(async () => {
    paragraph.textContent = "A edit one";
  });
  await waitFor(() => expect(state.records.has("draft:a")).toBe(true));
  fireEvent.click(screen.getByRole("button", { name: "초안 동기화" }));
  await waitFor(() => expect(state.request).toHaveBeenCalled());
  const sent = state.request.mock.calls[0][2].mutations[0];
  paragraph = screen.getByText("A edit one");
  await act(async () => {
    paragraph.textContent = "A edit two";
  });
  await waitFor(() =>
    expect(JSON.stringify(state.records.get("draft:a"))).toContain(
      "A edit two",
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: /Document B/ }));
  await screen.findByText("B text");
  await act(async () =>
    release({
      results: [
        {
          mutationId: sent.mutationId,
          status: "APPLIED",
          resource: { revision: 1 },
          error: null,
        },
      ],
    }),
  );
  const latest = state.records.get("draft:a") as {
    revision?: number;
    mutation: { action: string };
  };
  expect(latest.revision).toBe(1);
  expect(latest.mutation.action).toBe("UPDATE");
  expect(JSON.stringify(latest)).toContain("A edit two");
  expect(screen.getByText("B text")).toBeTruthy();
  expect(state.records.has("draft:b")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: /Document A/ }));
  await screen.findByText("A edit two");
  fireEvent.click(screen.getByRole("button", { name: "초안 동기화" }));
  await waitFor(() => expect(state.request).toHaveBeenCalledTimes(2));
  const retry = state.request.mock.calls[1][2].mutations[0];
  expect(retry.action).toBe("UPDATE");
  expect(retry.expectedRevision).toBe(1);
  expect(retry.mutationId).not.toBe(sent.mutationId);
  expect(JSON.stringify(retry.payload)).toContain("A edit two");
  ui.unmount();
});
