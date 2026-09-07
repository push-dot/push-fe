import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  records: new Map<string, unknown>(),
  list: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/shared/storage", () => ({
  localRead: async (_account: string, key: string) =>
    state.records.get(key) ?? null,
  localUpdate: async (
    _account: string,
    key: string,
    update: (value: unknown) => unknown,
  ) => {
    const value = update(state.records.get(key) ?? null);
    state.records.set(key, value);
    return value;
  },
}));
vi.mock("@/shared/api/client", () => ({
  listAll: state.list,
  request: state.request,
  runOperation: vi.fn(),
}));
vi.mock("@/shared/api", async () => ({
  ...(await import("@/shared/api/resources")),
  request: state.request,
  runOperation: vi.fn(),
}));
vi.mock("@/features/approval", () => ({ Approval: () => null }));
import { useSession } from "@/shared/auth";
import { resetCache } from "@/shared/api/resources";
import { InterviewsPage } from "@/pages/interviews";
const old = {
  id: "interview",
  revision: 1,
  title: "Interview",
  scheduledAt: "2026-09-20T00:00:00Z",
  notes: "cached notes",
  reflection: "cached reflection",
  companySources: [],
};
beforeEach(() => {
  state.records.clear();
  state.list.mockReset();
  state.request.mockReset();
  resetCache();
  useSession.getState().set({ accountId: "account", accessToken: "token" });
  state.records.set("cache:interviews", [old]);
});
afterEach(cleanup);
it("real resources cached mount adopts fresh list response", async () => {
  let release!: (rows: unknown[]) => void;
  state.list.mockImplementation((path: string) =>
    path === "interviews"
      ? new Promise((resolve) => {
          release = resolve;
        })
      : Promise.resolve([]),
  );
  state.request.mockResolvedValue({ ...old, revision: 3 });
  render(<InterviewsPage />);
  await screen.findByDisplayValue("cached notes");
  const source = {
    sourceUrl: "https://example.com/new",
    sourceText: "fresh source",
    accessedAt: "2026-01-01T00:00:00.000Z",
  };
  await act(async () =>
    release([
      {
        ...old,
        revision: 2,
        notes: "fresh notes",
        reflection: "fresh reflection",
        companySources: [source],
      },
    ]),
  );
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("fresh notes");
  expect(
    (screen.getByLabelText("회사 자료 1 원문") as HTMLTextAreaElement).value,
  ).toBe("fresh source");
});
it("real resource reload failure after ACK retains saved form and next revision", async () => {
  state.list.mockImplementation((path: string) =>
    Promise.resolve(path === "interviews" ? [old] : []),
  );
  state.request.mockResolvedValue({
    ...old,
    revision: 2,
    notes: "saved notes",
  });
  render(<InterviewsPage />);
  await screen.findByDisplayValue("cached notes");
  await waitFor(() => expect(state.list).toHaveBeenCalledWith("interviews"));
  state.list.mockRejectedValue(new Error("HTTP refresh failed"));
  fireEvent.change(screen.getByLabelText("준비 메모"), {
    target: { value: "saved notes" },
  });
  const form = screen
    .getByRole("button", { name: "회사 자료 추가" })
    .closest("form")!;
  fireEvent.submit(form);
  await screen.findByText("저장됨");
  await screen.findByText("HTTP refresh failed");
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("saved notes");
  fireEvent.submit(form);
  await waitFor(() => expect(state.request).toHaveBeenCalledTimes(2));
  expect(state.request.mock.calls[1][2].expectedRevision).toBe(2);
});
