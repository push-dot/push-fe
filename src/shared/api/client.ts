import { recordOperation } from "./operation-state";
import ky, { HTTPError } from "ky";
import { useSession } from "@/shared/auth";
export type ApiError = Error & {
  code?: string;
  status?: number;
  currentRevision?: number;
};
export type Envelope<T> = {
  data: T;
  page?: { nextCursor: string | null; hasMore: boolean };
};
let refreshing: Promise<void> | null = null;
export const envelope = async <T>(
  path: string,
  method = "GET",
  body?: unknown,
  key?: string,
  retried = false,
): Promise<Envelope<T>> => {
  const { apiUrl, accessToken, refreshToken, generation } =
    useSession.getState();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (method === "POST" && !/^auth\/(exchange|refresh|logout)$/.test(path))
    headers["Idempotency-Key"] = key || crypto.randomUUID();
  try {
    const response = await ky(`${apiUrl.replace(/\/$/, "")}/${path}`, {
      method,
      headers,
      json: body instanceof FormData ? undefined : body,
      body: body instanceof FormData ? body : undefined,
      retry: method === "GET" ? 1 : 0,
      timeout: 30000,
    });
    if (
      useSession.getState().generation !== generation ||
      useSession.getState().apiUrl !== apiUrl
    )
      throw new Error("Session changed during request");
    if (response.status === 204) return { data: undefined as T };
    return await response.json<Envelope<T>>();
  } catch (error) {
    if (error instanceof HTTPError) {
      if (
        error.response.status === 401 &&
        refreshToken &&
        !retried &&
        !path.startsWith("auth/")
      ) {
        if (!refreshing)
          refreshing = envelope<{ accessToken: string; refreshToken: string }>(
            "auth/refresh",
            "POST",
            { refreshToken },
            undefined,
            true,
          )
            .then(({ data }) => {
              if (
                useSession.getState().generation !== generation ||
                useSession.getState().apiUrl !== apiUrl
              )
                throw new Error("Session changed during refresh");
              useSession.getState().set(data);
            })
            .catch((e) => {
              if (useSession.getState().generation === generation)
                useSession.getState().clear();
              throw e;
            })
            .finally(() => {
              refreshing = null;
            });
        await refreshing;
        if (
          useSession.getState().generation !== generation ||
          useSession.getState().apiUrl !== apiUrl
        )
          throw new Error("Session changed during refresh");
        return envelope<T>(
          path,
          method,
          body,
          headers["Idempotency-Key"],
          true,
        );
      }
      const result = await error.response
        .json<{
          error?: {
            code: string;
            message: string;
            details?: { currentRevision?: number };
          };
        }>()
        .catch(() => ({ error: undefined }));
      throw Object.assign(
        new Error(result.error?.message || `HTTP ${error.response.status}`),
        {
          code: result.error?.code,
          status: error.response.status,
          currentRevision: result.error?.details?.currentRevision,
        },
      );
    }
    throw error;
  }
};
export const request = async <T = unknown>(
  path: string,
  method = "GET",
  body?: unknown,
  key?: string,
): Promise<T> => (await envelope<T>(path, method, body, key)).data;
export const listAll = async <T>(path: string): Promise<T[]> => {
  const items: T[] = [];
  let cursor: string | null = null;
  do {
    const result: Envelope<T[]> = await envelope<T[]>(
      `${path}${path.includes("?") ? "&" : "?"}limit=100${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`,
    );
    items.push(...result.data);
    cursor = result.page?.hasMore ? result.page.nextCursor : null;
  } while (cursor);
  return items;
};
export type Operation<T = unknown> = {
  id: string;
  status: string;
  result: { kind: string; value: T } | null;
  error: { message: string } | null;
  inputRequest?: {
    message: string;
    fields: { name: string; label: string; type: "TEXT" | "FILE" }[];
  } | null;
  type?: string;
};
export const runOperation = async <T>(
  path: string,
  body: unknown,
  onProgress?: (operation: Operation<T>) => void,
): Promise<T> => {
  let operation = await request<Operation<T>>(path, "POST", body);
  for (let i = 0; i < 120; i++) {
    await recordOperation(operation);
    onProgress?.(operation);
    if (operation.status === "SUCCEEDED" && operation.result)
      return operation.result.value;
    if (["FAILED", "CANCELLED", "NEEDS_INPUT"].includes(operation.status))
      throw new Error(
        operation.error?.message ||
          operation.inputRequest?.message ||
          operation.status,
      );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    operation = await request<Operation<T>>(`operations/${operation.id}`);
  }
  throw new Error(`작업이 계속 진행 중입니다. 작업 ID: ${operation.id}`);
};
