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
