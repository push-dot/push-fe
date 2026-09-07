import { create } from "zustand";
type SessionValues = {
  apiUrl: string;
  accessToken: string;
  refreshToken: string;
  accountId: string;
};
const savedAccount = () => {
  try {
    return JSON.parse(
      localStorage.getItem("push-offline-account") || "null",
    ) as { accountId: string; apiUrl: string } | null;
  } catch {
    return null;
  }
};
export const useSession = create<
  SessionValues & {
    generation: number;
    set: (values: Partial<SessionValues>) => void;
    clear: () => void;
  }
>((set, get) => ({
  apiUrl:
    savedAccount()?.apiUrl ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1",
  accessToken: "",
  refreshToken: "",
  accountId: savedAccount()?.accountId || "",
  generation: 0,
  set: (values) => {
    const current = get();
    if (values.apiUrl) {
      const url = new URL(values.apiUrl);
      if (
        url.username ||
        url.password ||
        (url.protocol !== "https:" &&
          !(
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
          ))
      )
        throw new Error("Use HTTPS or a loopback API URL");
    }
    const changed =
      (values.apiUrl !== undefined && values.apiUrl !== current.apiUrl) ||
      (values.accountId !== undefined &&
        values.accountId !== current.accountId);
    const clearCredentials =
      (values.apiUrl !== undefined && values.apiUrl !== current.apiUrl) ||
      (Boolean(current.accountId) &&
        values.accountId !== undefined &&
        values.accountId !== current.accountId);
    set({
      ...(clearCredentials
        ? { accessToken: "", refreshToken: "", accountId: "" }
        : {}),
      ...(changed ? { generation: current.generation + 1 } : {}),
      ...values,
    });
    if (values.accountId && get().accessToken) {
      try {
        localStorage.setItem(
          "push-offline-account",
          JSON.stringify({ accountId: get().accountId, apiUrl: get().apiUrl }),
        );
      } catch {}
    }
  },
  clear: () => {
    try {
      localStorage.removeItem("push-offline-account");
    } catch {}
    set((s) => ({
      accessToken: "",
      refreshToken: "",
      accountId: "",
      generation: s.generation + 1,
    }));
  },
}));
export const createPkce = async () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const encode = (v: Uint8Array) =>
    btoa(String.fromCharCode(...v))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const verifier = encode(bytes);
  return {
    verifier,
    challenge: encode(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    ),
  };
};
