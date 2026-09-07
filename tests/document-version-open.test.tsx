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
  reads: vi.fn(),
  writes: vi.fn(async (..._args: unknown[]) => {}),
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
  localRead: state.reads,
  localWrite: state.writes,
  localUpdate: async (
    account: string,
    key: string,
    transform: (value: unknown) => unknown,
  ) => {
    const next = transform(
      state.writes.mock.calls.filter((call) => call[1] === key).at(-1)?.[2] ??
        null,
    );
    await state.writes(account, key, next);
    return next;
  },
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
it("opens the referenced old version while preserving the current unsaved draft", async () => {
  const draft = {
    documentId: "a",
    baseRevision: 2,
    content: content("Unsaved current draft"),
    evidenceIds: [],
    text: "",
    updatedAt: "",
    mutation: { mutationId: "pending" },
  };
  state.reads.mockImplementation(async (_account: string, key: string) =>
    key === "draft:a" ? draft : null,
  );
  state.list.mockResolvedValue([
    { id: "v2", content: content("Latest version two"), blocks: [], number: 2 },
    {
      id: "v1",
      content: content("Referenced version one"),
      blocks: [],
      number: 1,
    },
  ]);
  const ui = render(
    <DocumentsPage initialDocumentId="a" initialVersionId="v1" />,
  );
  await screen.findByText("Referenced version one");
  expect(screen.queryByText("Latest version two")).toBeNull();
  expect(screen.queryByText("Unsaved current draft")).toBeNull();
  expect(ui.container.querySelector('[contenteditable="true"]')).toBeNull();
  expect(state.writes.mock.calls.some((call) => call[1] === "draft:a")).toBe(
    false,
  );
  fireEvent.click(screen.getByRole("button", { name: "현재 초안 열기" }));
  await screen.findByText("Unsaved current draft");
  expect(ui.container.querySelector('[contenteditable="true"]')).not.toBeNull();
  expect(state.writes.mock.calls.some((call) => call[1] === "draft:a")).toBe(
    false,
  );
  ui.unmount();
});
