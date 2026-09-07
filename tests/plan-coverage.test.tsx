import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ApplicationsPage } from "@/pages/applications";
import { InterviewsPage } from "@/pages/interviews";
const state = vi.hoisted(() => ({
  request: vi.fn(),
  prepare: vi.fn(),
  reload: vi.fn(async () => {}),
  app: {
    id: "app",
    jobId: "job",
    company: "Example",
    title: "Developer",
    stage: "SCREENING",
    revision: 1,
  },
  interview: {
    id: "interview",
    applicationId: "app",
    title: "Company interview",
    scheduledAt: "2026-09-20T00:00:00Z",
    revision: 1,
    companySources: [] as unknown[],
    notes: "",
    reflection: "",
  },
}));
vi.mock("@/shared/api", () => ({
  request: state.request,
  runOperation: state.prepare,
  queueMutation: vi.fn(),
  synchronize: vi.fn(),
  useOutbox: (select: (state: { items: unknown[] }) => unknown) =>
    select({ items: [] }),
  useResources: (path: string) => ({
    data:
      path === "applications"
        ? [state.app]
        : path === "interviews"
          ? [state.interview]
          : path === "jobs"
            ? [{ id: "job", company: "Example", title: "Developer" }]
            : [],
    error: "",
    reload: state.reload,
  }),
}));
vi.mock("@/features/pin", () => ({ PinButton: () => null }));
vi.mock("@/features/approval", () => ({ Approval: () => null }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("records rejection explicitly without advancing a nonterminal application", async () => {
  state.request.mockImplementation(
    async (_path: string, _method: string, body: { stage: string }) => {
      state.app = { ...state.app, ...body, revision: 2 };
      return state.app;
    },
  );
  const ui = render(<ApplicationsPage onOpen={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /ExampleDeveloper/ }));
  fireEvent.click(screen.getByRole("button", { name: "불합격 기록" }));
  await waitFor(() =>
    expect(state.request).toHaveBeenCalledWith("applications/app", "PATCH", {
      expectedRevision: 1,
      stage: "REJECTED",
    }),
  );
  ui.rerender(<ApplicationsPage onOpen={vi.fn()} />);
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "다음 단계" })).toBeNull(),
  );
  expect(screen.queryByRole("button", { name: "불합격 기록" })).toBeNull();
});
it("saves company source text then prepares using refreshed revision and renders its source and date", async () => {
  let release!: () => void;
  state.reload.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  state.request.mockImplementation(
    async (
      _path: string,
      _method: string,
      body: { companySources: unknown[] },
    ) => {
      state.interview = { ...state.interview, ...body, revision: 2 };
      return state.interview;
    },
  );
  state.prepare.mockResolvedValue({
    questions: [],
    starAnswers: [],
    research: [
      {
        claim: "직접 확인한 회사 원문",
        sourceUrl: "https://example.com/company",
        accessedAt: "2026-09-01T00:00:00Z",
        verificationStatus: "USER_PROVIDED",
      },
    ],
  });
  render(<InterviewsPage />);
  const add = screen.getByRole("button", { name: "회사 자료 추가" });
  fireEvent.click(add);
  fireEvent.change(screen.getByLabelText("회사 자료 1 출처 URL"), {
    target: { value: "https://example.com/company" },
  });
  fireEvent.change(screen.getByLabelText("회사 자료 1 원문"), {
    target: { value: "직접 확인한 회사 원문" },
  });
  fireEvent.change(screen.getByLabelText("회사 자료 1 확인 일시"), {
    target: { value: "2026-09-01T09:00" },
  });
  fireEvent.submit(add.closest("form")!);
  await waitFor(() => expect(state.request).toHaveBeenCalled());
  expect(state.request.mock.calls[0][2].companySources[0]).toEqual({
    sourceUrl: "https://example.com/company",
    sourceText: "직접 확인한 회사 원문",
    accessedAt: new Date("2026-09-01T09:00").toISOString(),
  });
  expect(
    (screen.getByRole("button", { name: "질문 준비" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  await act(async () => release());
  fireEvent.click(screen.getByRole("button", { name: "질문 준비" }));
  await waitFor(() =>
    expect(state.prepare).toHaveBeenCalledWith("interviews/interview/prepare", {
      expectedRevision: 2,
      ai: null,
    }),
  );
  await screen.findByRole("link", { name: "https://example.com/company" });
  expect(
    screen.getByText("사용자 제공 원문 · 확인 일시", { exact: false })
      .textContent,
  ).toContain("2026");
  expect(screen.getAllByText("직접 확인한 회사 원문").length).toBeGreaterThan(
    0,
  );
});

it("refreshed server sources must remain in the form submitted at the refreshed revision", async () => {
  state.interview = { ...state.interview, revision: 1, companySources: [] };
  state.reload.mockResolvedValue(undefined);
  state.request.mockResolvedValue({ ...state.interview, revision: 3 });
  const ui = render(<InterviewsPage />);
  const source = {
    sourceUrl: "https://example.com/new",
    sourceText: "Fetched source",
    accessedAt: "2026-01-01T00:00:00Z",
  };
  state.interview = {
    ...state.interview,
    revision: 2,
    companySources: [source],
    notes: "Fetched notes",
    reflection: "Fetched reflection",
  };
  ui.rerender(<InterviewsPage />);
  fireEvent.submit(
    screen.getByRole("button", { name: "회사 자료 추가" }).closest("form")!,
  );
  await waitFor(() => expect(state.request).toHaveBeenCalled());
  expect(state.request.mock.calls[0][2].expectedRevision).toBe(2);
  expect(state.request.mock.calls[0][2].companySources).toEqual([source]);
  expect(state.request.mock.calls[0][2].notes).toBe("Fetched notes");
  expect(state.request.mock.calls[0][2].reflection).toBe("Fetched reflection");
});

it("preserves dirty interview fields and their original revision when refreshed data conflicts", async () => {
  const source = {
    sourceUrl: "https://example.com/old",
    sourceText: "Original source",
    accessedAt: "2026-01-01T00:00:00Z",
  };
  state.interview = {
    ...state.interview,
    revision: 1,
    notes: "Original notes",
    reflection: "Original reflection",
    companySources: [source],
  };
  state.reload.mockResolvedValue(undefined);
  state.request.mockRejectedValue(
    Object.assign(new Error("Revision conflict"), { status: 409 }),
  );
  const ui = render(<InterviewsPage />);
  fireEvent.change(screen.getByLabelText("준비 메모"), {
    target: { value: "Local notes in progress" },
  });
  state.interview = {
    ...state.interview,
    revision: 2,
    notes: "Server changed notes",
    reflection: "Server changed reflection",
    companySources: [],
  };
  ui.rerender(<InterviewsPage />);
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("Local notes in progress");
  expect(
    (screen.getByLabelText("면접 회고") as HTMLTextAreaElement).value,
  ).toBe("Original reflection");
  expect(
    (screen.getByLabelText("회사 자료 1 원문") as HTMLTextAreaElement).value,
  ).toBe("Original source");
  fireEvent.submit(
    screen.getByRole("button", { name: "회사 자료 추가" }).closest("form")!,
  );
  await screen.findByText("Revision conflict");
  expect(state.request.mock.calls[0][2]).toEqual({
    expectedRevision: 1,
    notes: "Local notes in progress",
    reflection: "Original reflection",
    companySources: [source],
  });
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("Local notes in progress");
});

it("critic retains edits made during saving ACK and next Save has acknowledged baseline", async () => {
  state.interview = {
    ...state.interview,
    revision: 1,
    companySources: [],
    notes: "old",
    reflection: "old reflection",
  };
  let ack!: (value: unknown) => void;
  state.reload.mockResolvedValue(undefined);
  state.request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        ack = resolve;
      }),
  );
  const ui = render(<InterviewsPage />);
  fireEvent.change(screen.getByLabelText("준비 메모"), {
    target: { value: "sent" },
  });
  const form = screen
    .getByRole("button", { name: "회사 자료 추가" })
    .closest("form")!;
  fireEvent.submit(form);
  fireEvent.change(screen.getByLabelText("준비 메모"), {
    target: { value: "typed during ACK" },
  });
  await act(async () => {
    state.interview = { ...state.interview, revision: 2, notes: "sent" };
    ack(state.interview);
  });
  ui.rerender(<InterviewsPage />);
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("typed during ACK");
  state.request.mockResolvedValue({ ...state.interview, revision: 3 });
  fireEvent.submit(form);
  await waitFor(() => expect(state.request).toHaveBeenCalledTimes(2));
  expect(state.request.mock.calls[1][2]).toMatchObject({
    expectedRevision: 2,
    notes: "typed during ACK",
  });
});

it("critic acknowledged save survives unavailable reload and next save is valid", async () => {
  state.interview = {
    ...state.interview,
    revision: 1,
    companySources: [],
    notes: "cached old",
    reflection: "old reflection",
  };
  state.reload.mockResolvedValue(undefined);
  state.request.mockImplementation(async (_path, _method, body) => ({
    ...state.interview,
    ...body,
    revision: 2,
  }));
  render(<InterviewsPage />);
  fireEvent.change(screen.getByLabelText("준비 메모"), {
    target: { value: "acknowledged notes" },
  });
  const form = screen
    .getByRole("button", { name: "회사 자료 추가" })
    .closest("form")!;
  fireEvent.submit(form);
  await screen.findByText("저장됨");
  expect(
    (screen.getByLabelText("준비 메모") as HTMLTextAreaElement).value,
  ).toBe("acknowledged notes");
  fireEvent.submit(form);
  await waitFor(() => expect(state.request).toHaveBeenCalledTimes(2));
  expect(state.request.mock.calls[1][2]).toMatchObject({
    expectedRevision: 2,
    notes: "acknowledged notes",
  });
});
