import { create } from "zustand";
import { useEffect } from "react";
import { listAll, request } from "./client";
import { localRead, localWrite } from "@/shared/storage";
import { useSession } from "@/shared/auth";
export type Resource = {
  id: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};
export type AiOptions = {
  provider: "OPENAI" | "CLAUDE" | "GEMINI" | "GROK";
  model: string;
  credentialMode: "MANAGED" | "BYOK";
  effort: "LOW" | "MEDIUM" | "HIGH";
};
const useCache = create<{
  data: Record<string, Resource[]>;
  errors: Record<string, string>;
  loading: Record<string, boolean>;
}>(() => ({ data: {}, errors: {}, loading: {} }));
export const resetCache = () =>
  useCache.setState({ data: {}, errors: {}, loading: {} });
useSession.subscribe((state, previous) => {
  if (
    state.accountId !== previous.accountId ||
    state.apiUrl !== previous.apiUrl
  )
    resetCache();
});
const empty: Resource[] = [];
export const refresh = async (path: string) => {
  const { accountId: account, generation, accessToken } = useSession.getState();
  if (!account) return;
  const current = () =>
    useSession.getState().generation === generation &&
    useSession.getState().accountId === account;
  const cached = await localRead<Resource[]>(account, `cache:${path}`).catch(
    () => null,
  );
  if (cached && current())
    useCache.setState((s) => ({ data: { ...s.data, [path]: cached } }));
  if (!accessToken) return;
  useCache.setState((s) => ({ loading: { ...s.loading, [path]: true } }));
  try {
    const data = await listAll<Resource>(path);
    if (current()) await localWrite(account, `cache:${path}`, data);
    if (current())
      useCache.setState((s) => ({
        data: { ...s.data, [path]: data },
        errors: { ...s.errors, [path]: "" },
      }));
  } catch (e) {
    if (current())
      useCache.setState((s) => ({
        errors: { ...s.errors, [path]: (e as Error).message },
      }));
  } finally {
    if (current())
      useCache.setState((s) => ({ loading: { ...s.loading, [path]: false } }));
  }
};
export const useResources = (path: string) => {
  const token = useSession((s) => s.accessToken);
  const accountId = useSession((s) => s.accountId);
  const data = useCache((s) => s.data[path] || empty);
  const error = useCache((s) => s.errors[path] || "");
  const loading = useCache((s) => s.loading[path] || false);
  useEffect(() => {
    if (accountId) void refresh(path);
  }, [path, token, accountId]);
  return { data, error, loading, reload: () => refresh(path) };
};
export const mutate = async <T = Resource>(
  path: string,
  method: string,
  body?: unknown,
) => {
  const result = await request<T>(path, method, body);
  return result;
};
