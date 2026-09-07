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
  localRead: vi.fn(async () => null),
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
it("never saves A content into B while B versions are still loading", async () => {
  let release!: (value: unknown[]) => void;
  const delayed = new Promise<unknown[]>((resolve) => {
    release = resolve;
  });
  state.list.mockImplementation((path: string) =>
    path.includes("/a/")
      ? Promise.resolve([
          {
            id: "va",
            content: content("A private text"),
            blocks: [],
            number: 1,
          },
        ])
      : delayed,
  );
  state.request.mockResolvedValue({
    document: { id: "b", revision: 3 },
    version: {
      id: "vb2",
      content: content("B own text"),
      blocks: [],
      number: 2,
    },
  });
  const ui = render(<DocumentsPage initialDocumentId="a" />);
  const paragraph = await screen.findByText("A private text");
  await act(async () => {
    paragraph.textContent = "A unsaved private draft";
  });
  await waitFor(() =>
    expect(state.writes.mock.calls.some((call) => call[1] === "draft:a")).toBe(
      true,
    ),
  );
  const aDraft = state.writes.mock.calls
    .filter((call) => call[1] === "draft:a")
    .at(-1)![2];
  expect(JSON.stringify(aDraft)).toContain("A unsaved private draft");
  fireEvent.click(screen.getByRole("button", { name: /Document B/ }));
  const save = screen.getByRole("button", {
    name: "새 버전 저장",
  }) as HTMLButtonElement;
  fireEvent.click(save);
  expect(state.request).not.toHaveBeenCalled();
  expect(save.disabled).toBe(true);
  expect(
    (
      screen.getByRole("button", {
        name: "원문 발췌로 작성",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(state.writes.mock.calls.some((call) => call[1] === "draft:b")).toBe(
    false,
  );
  expect(
    state.writes.mock.calls.filter((call) => call[1] === "draft:a").at(-1)?.[2],
  ).toEqual(aDraft);
  expect(ui.container.querySelector('[contenteditable="true"]')).toBeNull();
  await act(async () =>
    release([
      { id: "vb", content: content("B own text"), blocks: [], number: 1 },
    ]),
  );
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "새 버전 저장",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  expect(ui.container.querySelector('[contenteditable="true"]')).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Document B/ }));
  expect(
    (screen.getByRole("button", { name: "새 버전 저장" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "새 버전 저장" }));
  await waitFor(() => expect(state.request).toHaveBeenCalled());
  expect(state.request.mock.calls[0][0]).toBe("documents/b/versions");
  expect(JSON.stringify(state.request.mock.calls[0][2])).toContain(
    "B own text",
  );
  expect(JSON.stringify(state.request.mock.calls[0][2])).not.toContain(
    "A private text",
  );
  ui.unmount();
});
