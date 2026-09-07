import { useSession } from "@/shared/auth";
import { create } from "zustand";
import type { AiOptions } from "@/shared/api";
export type ChatContext = {
  documentId?: string;
  versionId?: string;
  evidenceIds: string[];
};
export const useChat = create<{
  inputs: Record<string, string>;
  contexts: Record<string, ChatContext>;
  setContext: (id: string, context: ChatContext) => void;
  ai: AiOptions;
  accessMode: "SUGGEST" | "CONFIRM_ACTIONS";
  setInput: (id: string, text: string) => void;
  setAi: (ai: AiOptions) => void;
  setAccess: (accessMode: "SUGGEST" | "CONFIRM_ACTIONS") => void;
}>((set) => ({
  inputs: {},
  contexts: {},
  setContext: (id, context) =>
    set((s) => ({ contexts: { ...s.contexts, [id]: context } })),
  ai: { provider: "OPENAI", model: "", credentialMode: "BYOK", effort: "HIGH" },
  accessMode: "SUGGEST",
  setInput: (id, text) => set((s) => ({ inputs: { ...s.inputs, [id]: text } })),
  setAi: (ai) => set({ ai }),
  setAccess: (accessMode) => set({ accessMode }),
}));

useSession.subscribe((state, previous) => {
  if (state.accountId !== previous.accountId)
    useChat.setState({ inputs: {}, contexts: {} });
});
