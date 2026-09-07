import { useState, useRef } from "react";
import { ArrowUp, Plus, Sparkles, Lock, AudioLines } from "lucide-react";
import {
  request,
  refresh,
  useResources,
  runOperation,
  type Resource,
} from "@/shared/api";
import { Empty, Notice } from "@/shared/ui";
import { useT } from "@/shared/config";
import { ContextPicker } from "./context-picker";
import { AttachmentCard, type Attachment } from "./attachment-card";
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
  onNavigate: (page: string, resourceId?: string) => void;
}) => {
  const t = useT();
  const scope = `${applicationId}:${conversationId || ""}`;
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const documents = useResources("documents");
  const evidence = useResources("career-evidence");
  const [contextOpen, setContextOpen] = useState(false);
  const models = useResources("ai/models");
  const messages = useResources(
    conversationId
      ? `conversations/${conversationId}/messages`
      : "conversations",
  );
  const {
    inputs,
    contexts,
    setContext,
    ai,
    accessMode,
    setInput,
    setAi,
    setAccess,
  } = useChat();
  const context = contexts[applicationId] || { evidenceIds: [] };
  const contextValid =
    (!context.documentId ||
      (Boolean(context.versionId) &&
        documents.data.some(
          (d) =>
            d.id === context.documentId && d.applicationId === applicationId,
        ))) &&
    context.evidenceIds.every((id) => evidence.data.some((e) => e.id === id));
  const input = inputs[applicationId] || "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async () => {
    if (busy || !contextValid || !applicationId || !ai.model || !input.trim())
      return;
    setBusy(true);
    setError("");
    try {
      let id = conversationId;
      if (!id) {
        const c = await request<Resource>("conversations", "POST", {
          applicationId,
          title: input.slice(0, 80),
        });
        if (currentScope.current !== scope) return;
        id = c.id;
        onConversation(id);
      }
      await runOperation(`conversations/${id}/messages`, {
        text: input,
        context,
        ai,
        accessMode,
      });
      if (useChat.getState().inputs[applicationId] === input)
        setInput(applicationId, "");
      await refresh(`conversations/${id}/messages`);
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
                  {m.attachments?.map((attachment: Attachment) => (
                    <AttachmentCard
                      key={`${attachment.type}:${attachment.id}`}
                      attachment={attachment}
                      applicationId={applicationId}
                      onOpenDocument={(id) => onNavigate("documents", id)}
                    />
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
        {contextOpen && applicationId && (
          <ContextPicker
            applicationId={applicationId}
            documents={documents.data}
            evidence={evidence.data}
            context={context}
            onChange={(value) => setContext(applicationId, value)}
          />
        )}
        {(context.documentId || context.evidenceIds.length > 0) && (
          <div className="context-summary">
            <button onClick={() => setContextOpen(!contextOpen)}>
              {documents.data.find((d) => d.id === context.documentId)?.title ||
                t("선택한 근거", "Selected evidence")}{" "}
              · {context.evidenceIds.length} {t("개 근거", "evidence items")}
            </button>
            <button
              onClick={() => setContext(applicationId, { evidenceIds: [] })}
            >
              {t("선택 해제", "Clear context")}
            </button>
          </div>
        )}
        {!contextValid && (
          <Notice
            error={t(
              "이 지원의 문서 버전을 선택하거나 참고 자료를 다시 선택하세요.",
              "Choose a version belonging to this application or select context again.",
            )}
          />
        )}
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
              ai.model &&
              contextValid &&
              !busy
            )
              void send();
          }}
        />
        <div className="composer-tools">
          <button
            aria-label={t("근거 추가", "Add evidence")}
            onClick={() => setContextOpen(!contextOpen)}
            disabled={!applicationId}
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
                .filter(
                  (m) =>
                    m.available &&
                    (ai.credentialMode !== "MANAGED" ||
                      m.provider === "OPENAI"),
                )
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
            disabled={
              busy ||
              !contextValid ||
              !input.trim() ||
              !applicationId ||
              !ai.model
            }
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
