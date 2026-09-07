import { create } from "zustand";
import type { AiOptions } from "@/shared/api";
export const useChat = create<{
  inputs: Record<string, string>;
  ai: AiOptions;
  accessMode: "SUGGEST" | "CONFIRM_ACTIONS";
  setInput: (id: string, text: string) => void;
  setAi: (ai: AiOptions) => void;
  setAccess: (accessMode: "SUGGEST" | "CONFIRM_ACTIONS") => void;
}>((set) => ({
  inputs: {},
  ai: { provider: "OPENAI", model: "", credentialMode: "BYOK", effort: "HIGH" },
  accessMode: "SUGGEST",
  setInput: (id, text) => set((s) => ({ inputs: { ...s.inputs, [id]: text } })),
  setAi: (ai) => set({ ai }),
  setAccess: (accessMode) => set({ accessMode }),
}));
