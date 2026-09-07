import { useState } from "react";
import { ArrowUp, Plus, Sparkles, Lock, AudioLines } from "lucide-react";
import {
  request,
  useResources,
  runOperation,
  type Resource,
} from "@/shared/api";
import { Empty, Notice, Action } from "@/shared/ui";
import { useT, useLabel } from "@/shared/config";
import { useChat } from "../model/chat";
export const ChatPage = ({
  applicationId,
  conversationId,
  onConversation,
  onNavigate,
}: {
  applicationId: string;
  conversationId?: string;
  onConversation: (id: string) => void;
  onNavigate: (page: string) => void;
}) => {
  const t = useT();
  const label = useLabel();
  const models = useResources("ai/models");
  const messages = useResources(
    conversationId
      ? `conversations/${conversationId}/messages`
      : "conversations",
  );
  const { inputs, ai, accessMode, setInput, setAi, setAccess } = useChat();
  const input = inputs[applicationId] || "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async () => {
    setBusy(true);
    setError("");
    try {
      let id = conversationId;
      if (!id) {
        const c = await request<Resource>("conversations", "POST", {
          applicationId,
          title: input.slice(0, 80),
        });
        id = c.id;
        onConversation(id);
      }
      await runOperation(`conversations/${id}/messages`, {
        text: input,
        context: { evidenceIds: [] },
        ai,
        accessMode,
      });
      setInput(applicationId, "");
      await messages.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="chat-page">
      <div className="chat-scroll">
        {!conversationId || !messages.data.length ? (
          <Empty
            title={t(
              "다음 지원을 함께 준비해요",
              "Let’s prepare your next application",
            )}
          >
            {applicationId
              ? t(
                  "공고를 분석하거나, 실제 경험을 바탕으로 서류를 다듬어 보세요.",
                  "Analyze the job or refine a document using your real experience.",
                )
              : t(
                  "공고를 등록하고 지원할 회사를 선택하세요.",
                  "Add a job and choose an application to get started.",
                )}
          </Empty>
        ) : (
          messages.data
            .slice()
            .reverse()
            .map((m) => (
              <div
                className={`message ${m.role === "USER" ? "user" : "assistant"}`}
                key={m.id}
              >
                {m.role !== "USER" && <span className="message-logo">P</span>}
                <div>
                  <p>{m.text}</p>
                  {m.attachments?.map((a: { type: string; id: string }) => (
                    <button
                      key={a.id}
                      onClick={() =>
                        onNavigate(
                          a.type.includes("DOCUMENT")
                            ? "documents"
                            : "applications",
                        )
                      }
                    >
                      {a.type} ↗
                    </button>
                  ))}
                </div>
              </div>
            ))
        )}
        {!applicationId && (
          <div className="actions centered">
            <button
              className="primary"
              onClick={() => onNavigate("applications")}
            >
              {t("첫 공고 등록", "Add your first job")}
            </button>
            <button onClick={() => onNavigate("career")}>Career Vault</button>
          </div>
        )}
        <Notice error={error} />
      </div>
      <div className="composer">
        <textarea
          aria-label={t("메시지", "Message")}
          placeholder={t("무엇이든 요청하세요", "Ask anything")}
          value={input}
          onChange={(e) => setInput(applicationId, e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.metaKey || e.ctrlKey) &&
              input.trim() &&
              applicationId &&
              ai.model
            )
              void send();
          }}
        />
        <div className="composer-tools">
          <button
            aria-label={t("근거 추가", "Add evidence")}
            onClick={() => onNavigate("career")}
          >
            <Plus size={21} />
          </button>
          <label className="tool-select access">
            <Lock size={16} />
            <select
              aria-label={t("실행 권한", "Access")}
              value={accessMode}
              onChange={(e) => setAccess(e.target.value as typeof accessMode)}
            >
              <option value="SUGGEST">{t("제안만", "Suggestions")}</option>
              <option value="CONFIRM_ACTIONS">
                {t("작업별 승인", "Confirm actions")}
              </option>
            </select>
          </label>
          <span className="grow" />
          <label className="tool-select">
            <select
              aria-label={t("AI 결제 모드", "AI billing mode")}
              value={ai.credentialMode}
              onChange={(e) =>
                setAi({
                  ...ai,
                  credentialMode: e.target.value as "MANAGED" | "BYOK",
                  provider:
                    e.target.value === "MANAGED" ? "OPENAI" : ai.provider,
                  model: "",
                })
              }
            >
              <option value="BYOK">BYOK</option>
              <option value="MANAGED">
                {t("Push 크레딧", "Push credits")}
              </option>
            </select>
          </label>
          <label className="tool-select">
            <Sparkles size={18} />
            <select
              aria-label={t("AI 모델", "AI model")}
              value={ai.model}
              onChange={(e) => {
                const m = models.data.find((m) => m.model === e.target.value);
                setAi({
                  ...ai,
                  model: e.target.value,
                  provider: m?.provider || "OPENAI",
                });
              }}
            >
              <option value="">{t("모델 설정", "Configure model")}</option>
              {models.data
                .filter((m) => m.available)
                .map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="tool-select">
            <AudioLines size={17} />
            <select
              aria-label={t("작업 강도", "Effort")}
              value={ai.effort}
              onChange={(e) =>
                setAi({ ...ai, effort: e.target.value as typeof ai.effort })
              }
            >
              <option value="LOW">{t("낮음", "Low")}</option>
              <option value="MEDIUM">{t("보통", "Medium")}</option>
              <option value="HIGH">{t("높음", "High")}</option>
            </select>
          </label>
          <button
            className="send"
            disabled={busy || !input.trim() || !applicationId || !ai.model}
            aria-label={t("전송", "Send")}
            onClick={() => void send()}
          >
            <ArrowUp size={23} />
          </button>
        </div>
        {!ai.model && (
          <small className="composer-hint">
            <button onClick={() => onNavigate("settings")}>
              {t(
                "설정에서 AI를 연결하세요",
                "Connect an AI provider in Settings",
              )}
            </button>
          </small>
        )}
      </div>
    </div>
  );
};
