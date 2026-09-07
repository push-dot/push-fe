import { create } from "zustand";
import { useEffect } from "react";
import { listAll, request } from "./client";
import { localRead, localWrite, localUpdate } from "@/shared/storage";
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
  const changes = await localRead<Record<string, CacheChange>>(
    account,
    "cache:changes",
  ).catch(() => null);
  const restored = cached
    ? mergeCacheChanges(path, cached, Object.values(changes || {}))
    : null;
  if (restored && current())
    useCache.setState((s) => ({ data: { ...s.data, [path]: restored } }));
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
export type CacheChange = {
  resourceType: string;
  resourceId: string;
  revision: number;
  deleted: boolean;
  data: Resource | null;
  sequence: number;
};
const resourcePath: Record<string, string> = {
  APPLICATION: "applications",
  CALENDAR_EVENT: "calendar/events",
  DOCUMENT: "documents",
  DOCUMENT_DRAFT: "drafts",
};
export const mergeCacheChanges = (
  path: string,
  data: Resource[],
  changes: CacheChange[],
) => {
  let result = data.slice();
  for (const change of changes) {
    if (
      !path.startsWith(resourcePath[change.resourceType] + "?") &&
      path !== resourcePath[change.resourceType]
    )
      continue;
    const prior = result.find((r) => r.id === change.resourceId);
    if (prior && prior.revision > change.revision) continue;
    result = result.filter((r) => r.id !== change.resourceId);
    if (change.deleted || !change.data) continue;
    const query = new URLSearchParams(path.split("?")[1] || "");
    if (
      query.get("applicationId") &&
      change.data.applicationId !== query.get("applicationId")
    )
      continue;
    if (change.resourceType === "CALENDAR_EVENT") {
      const start = Date.parse(change.data.startsAt);
      if (query.get("from") && start < Date.parse(query.get("from")!)) continue;
      if (query.get("to") && start >= Date.parse(query.get("to")!)) continue;
    }
    result.unshift(change.data);
  }
  return result;
};
export const applyCachedChanges = async (
  account: string,
  changes: CacheChange[],
) => {
  await localUpdate<Record<string, CacheChange>>(
    account,
    "cache:changes",
    (current) => {
      const prior = { ...current };
      for (const change of changes) {
        const key = `${change.resourceType}:${change.resourceId}`;
        if (!prior[key] || prior[key].sequence <= change.sequence)
          prior[key] = change;
      }
      return prior;
    },
  );
  if (account !== useSession.getState().accountId) return;
  for (const [path, data] of Object.entries(useCache.getState().data)) {
    const merged =
      (await localUpdate<Resource[]>(account, `cache:${path}`, (current) =>
        mergeCacheChanges(path, current || data, changes),
      )) || [];
    if (account === useSession.getState().accountId)
      useCache.setState((s) => ({ data: { ...s.data, [path]: merged } }));
  }
};
