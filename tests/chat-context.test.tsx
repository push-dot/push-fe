import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ChatPage } from "@/pages/chat";
import { useChat } from "@/pages/chat/model/chat";
const api = vi.hoisted(() => ({
  request: vi.fn(),
  run: vi.fn(async () => ({})),
  refresh: vi.fn(async () => {}),
}));
vi.mock("@/shared/api", () => ({
  request: api.request,
  runOperation: api.run,
  refresh: api.refresh,
  useResources: (path: string) => ({
    data:
      path === "documents"
        ? [
            { id: "doc-a", applicationId: "app-a", title: "Current resume" },
            {
              id: "doc-b",
              applicationId: "app-b",
              title: "Other application resume",
            },
          ]
        : path === "career-evidence"
          ? [
              {
                id: "evidence",
                title: "Verified experience",
                sourceText: "Actual experience",
              },
            ]
          : path === "documents/doc-a/versions"
            ? [{ id: "version-a", number: 1, changeNote: "Source excerpt" }]
            : path === "ai/models"
              ? [
                  {
                    model: "test-model",
                    provider: "OPENAI",
                    available: true,
                    label: "Test model",
                  },
                ]
              : path === "conversations/conversation/messages"
                ? [
                    {
                      id: "message",
                      role: "ASSISTANT",
                      text: "Review this actual version",
                      attachments: [
                        {
                          type: "DOCUMENT_VERSION",
                          id: "version-a",
                          documentId: "doc-a",
                          title: "Current resume",
                        },
                      ],
                    },
                  ]
                : [],
    error: "",
    reload: api.refresh,
  }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useChat.setState({ inputs: {}, contexts: {} });
});
it("sends explicitly selected scoped version and evidence and opens the exact returned document", async () => {
  useChat.setState({
    inputs: { "app-a": "Review my resume" },
    ai: {
      provider: "OPENAI",
      model: "test-model",
      credentialMode: "BYOK",
      effort: "MEDIUM",
    },
  });
  api.request.mockImplementation(async (path: string) =>
    path === "documents/doc-a"
      ? {
          id: "doc-a",
          applicationId: "app-a",
          title: "Current resume",
          revision: 2,
        }
      : {
          id: "version-a",
          number: 1,
          blocks: [
            { id: "block", text: "Actual version excerpt", evidenceRefs: [] },
          ],
          quality: { jobFit: null, ats: 85 },
        },
  );
  const navigate = vi.fn();
  render(
    <ChatPage
      applicationId="app-a"
      conversationId="conversation"
      onConversation={vi.fn()}
      onNavigate={navigate}
    />,
  );
  const excerpt = await screen.findByText("Actual version excerpt");
  const card = excerpt.closest(".attachment-card")!;
  expect(card.querySelector(".approval")).toBeNull();
  expect(
    card.parentElement?.classList.contains("document-attachment-group"),
  ).toBe(true);
  expect(card.nextElementSibling?.classList.contains("approval")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: /문서 열기/ }));
  expect(navigate).toHaveBeenCalledWith("documents", "doc-a", "version-a");
  fireEvent.click(screen.getByRole("button", { name: "근거 추가" }));
  expect(
    screen.queryByRole("option", { name: "Other application resume" }),
  ).toBeNull();
  fireEvent.change(screen.getByLabelText("참고 문서"), {
    target: { value: "doc-a" },
  });
  expect(
    (screen.getByRole("button", { name: "전송" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("문서 버전"), {
    target: { value: "version-a" },
  });
  fireEvent.click(screen.getByLabelText("Verified experience"));
  fireEvent.click(screen.getByRole("button", { name: "전송" }));
  await waitFor(() => expect(api.run).toHaveBeenCalled());
  expect(api.run.mock.calls[0]).toEqual([
    "conversations/conversation/messages",
    expect.objectContaining({
      context: {
        documentId: "doc-a",
        versionId: "version-a",
        evidenceIds: ["evidence"],
      },
    }),
  ]);
  await act(async () =>
    useChat.setState({
      inputs: { "app-a": "Cross scope" },
      contexts: {
        "app-a": {
          documentId: "doc-b",
          versionId: "version-b",
          evidenceIds: [],
        },
      },
    }),
  );
  expect(
    (screen.getByRole("button", { name: "전송" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
