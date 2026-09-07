import { useState } from "react";
import { useSession, createPkce } from "@/shared/auth";
import {
  request,
  useResources,
  resetCache,
  runOperation,
  type Resource,
} from "@/shared/api";
import { usePreferences, useT, useLabel } from "@/shared/config";
import { Field, Form, Notice, Action, text } from "@/shared/ui";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauri } from "@tauri-apps/api/core";
let pendingVerifier = "";
let pendingGeneration = 0;
let integrationVerifier = "";
let integrationAccount = "";
export const completeAuth = async (url: string) => {
  const parsed = new URL(url);
  if (
    parsed.protocol === "push:" &&
    parsed.host === "integrations" &&
    parsed.pathname === "/google/callback"
  ) {
    const code = parsed.searchParams.get("integrationCode");
    if (
      !code ||
      !integrationVerifier ||
      integrationAccount !== useSession.getState().accountId
    )
      throw new Error("Invalid integration callback");
    await request("integrations/google/complete", "POST", {
      integrationCode: code,
      codeVerifier: integrationVerifier,
    });
    integrationVerifier = "";
    return;
  }
  if (
    parsed.protocol !== "push:" ||
    parsed.host !== "auth" ||
    parsed.pathname !== "/callback"
  )
    return;
  const code = parsed.searchParams.get("code");
  if (
    !code ||
    !pendingVerifier ||
    pendingGeneration !== useSession.getState().generation
  )
    throw new Error("Invalid authentication callback");
  const result = await request<{
    accessToken: string;
    refreshToken: string;
    user: { id: string };
  }>("auth/exchange", "POST", { code, codeVerifier: pendingVerifier });
  if (pendingGeneration !== useSession.getState().generation)
    throw new Error("Authentication session changed");
  pendingVerifier = "";
  resetCache();
  useSession.getState().set({ ...result, accountId: result.user.id });
};
const external = async (url: string) => {
  if (isTauri()) await openUrl(url);
  else window.open(url, "_blank", "noopener,noreferrer");
};
export const SettingsPage = () => {
  const t = useT();
  const label = useLabel();
  const session = useSession();
  const preferences = usePreferences();
  const keys = useResources("ai/keys");
  const [google, setGoogle] = useState<Resource | null>(null);
  const [billing, setBilling] = useState<Resource | null>(null);
  const [message, setMessage] = useState("");
  return (
    <div className="page settings">
      <div className="page-heading">
        <div>
          <h1>{t("설정", "Settings")}</h1>
        </div>
      </div>
      <section className="panel">
        <h2>{t("외관", "Appearance")}</h2>
        <div className="form-grid">
          <Field label={t("테마", "Theme")}>
            <select
              value={preferences.theme}
              onChange={(e) =>
                preferences.set({
                  theme: e.target.value as typeof preferences.theme,
                })
              }
            >
              <option value="dark">{t("어둡게", "Dark")}</option>
              <option value="light">{t("밝게", "Light")}</option>
              <option value="system">{t("시스템", "System")}</option>
            </select>
          </Field>
          <Field label={t("언어", "Language")}>
            <select
              value={preferences.locale}
              onChange={(e) =>
                preferences.set({ locale: e.target.value as "ko" | "en" })
              }
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
      </section>
      <section className="panel">
        <h2>{t("계정과 서버", "Account and server")}</h2>
        <p className="muted">
          {session.accountId
            ? t("로그인됨", "Signed in")
            : t("로그인되지 않음", "Not signed in")}
        </p>
        <Form
          submitLabel={t("개발 서버 연결", "Connect development server")}
          onSubmit={async (f) => {
            const url = new URL(text(f, "apiUrl"));
            if (
              url.protocol !== "https:" &&
              !(
                url.protocol === "http:" &&
                ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
              )
            )
              throw new Error(
                t(
                  "HTTPS 또는 로컬 서버만 허용합니다.",
                  "Use HTTPS or a loopback server.",
                ),
              );
            session.clear();
            resetCache();
            session.set({
              apiUrl: url.toString().replace(/\/$/, ""),
              accessToken: text(f, "token"),
            });
            const me = await request<{ id: string }>("auth/me");
            session.set({ accountId: me.id });
            setMessage(t("연결되었습니다.", "Connected."));
          }}
        >
          <Field label="API URL">
            <input
              name="apiUrl"
              type="url"
              defaultValue={session.apiUrl}
              required
            />
          </Field>
          <Field
            label={t(
              "개발 토큰 (이번 실행에만 사용)",
              "Development token (this session only)",
            )}
          >
            <input name="token" type="password" autoComplete="off" required />
          </Field>
        </Form>
        <div className="actions">
          {["google", "github"].map((provider) => (
            <Action
              key={provider}
              run={async () => {
                const pkce = await createPkce();
                pendingVerifier = pkce.verifier;
                pendingGeneration = useSession.getState().generation;
                const result = await request<{ authorizationUrl: string }>(
                  `auth/${provider}/start?codeChallenge=${pkce.challenge}&codeChallengeMethod=S256&redirectUri=${encodeURIComponent("push://auth/callback")}`,
                );
                await external(result.authorizationUrl);
              }}
            >
              {provider} {t("로그인", "Sign in")}
            </Action>
          ))}
          <Action
            run={async () => {
              try {
                if (session.refreshToken)
                  await request("auth/logout", "POST", {
                    refreshToken: session.refreshToken,
                  });
              } finally {
                session.clear();
                resetCache();
              }
            }}
          >
            {t("로그아웃", "Sign out")}
          </Action>
        </div>
      </section>
      <section className="panel">
        <h2>AI · BYOK</h2>
        <p className="muted">
          {t(
            "키는 서버에 암호화 저장됩니다. 모델은 실제 설정 목록에서 선택합니다.",
            "Keys are encrypted on the server. Models come from the configured catalog.",
          )}
        </p>
        <Form
          onSubmit={async (f) => {
            await request(`ai/keys/${text(f, "provider")}`, "PUT", {
              key: text(f, "key"),
            });
            await keys.reload();
          }}
        >
          <div className="form-grid">
            <Field label={t("공급자", "Provider")}>
              <select name="provider">
                <option value="OPENAI">{label("OPENAI")}</option>
                <option value="CLAUDE">{label("CLAUDE")}</option>
                <option value="GEMINI">{label("GEMINI")}</option>
                <option value="GROK">{label("GROK")}</option>
              </select>
            </Field>
            <Field label="API key">
              <input type="password" name="key" required autoComplete="off" />
            </Field>
          </div>
        </Form>
        {keys.data.map((k) => (
          <div key={k.provider} className="row">
            <span>
              {k.provider} · ••••{k.lastFour}
            </span>
            <Action
              run={async () => {
                const result = await request<{ valid: boolean }>(
                  `ai/keys/${k.provider}/test`,
                  "POST",
                  {},
                );
                setMessage(
                  result.valid
                    ? t("키 확인됨", "Key verified")
                    : t("유효하지 않은 키", "Invalid key"),
                );
              }}
            >
              {t("검사", "Test")}
            </Action>
            <Action
              run={async () => {
                await request(`ai/keys/${k.provider}`, "DELETE");
                await keys.reload();
              }}
            >
              {t("삭제", "Delete")}
            </Action>
          </div>
        ))}
      </section>
      <section className="panel">
        <h2>Google</h2>
        <Action
          run={async () => {
            const pkce = await createPkce();
            integrationVerifier = pkce.verifier;
            integrationAccount = session.accountId;
            const result = await request<{ authorizationUrl: string }>(
              "integrations/google/connect",
              "POST",
              {
                codeChallenge: pkce.challenge,
                codeChallengeMethod: "S256",
                redirectUri: "push://integrations/google/callback",
              },
            );
            await external(result.authorizationUrl);
          }}
        >
          {t("Google 연결", "Connect Google")}
        </Action>
        <Action
          run={async () => {
            await request("integrations/google", "DELETE");
            setGoogle(null);
          }}
        >
          {t("연결 해제", "Disconnect")}
        </Action>
        <Action
          run={async () =>
            setGoogle(await request<Resource>("integrations/google"))
          }
        >
          {t("연결 상태 확인", "Check connection")}
        </Action>
        {google && (
          <p>
            {google.enabled
              ? t("활성화", "Enabled")
              : t("베타 비활성화", "Beta disabled")}{" "}
            ·{" "}
            {google.connected
              ? t("연결됨", "Connected")
              : t("연결되지 않음", "Disconnected")}
          </p>
        )}
        <Action
          run={async () => {
            await runOperation("integrations/google/sync", {});
            setMessage(t("동기화 완료", "Synced"));
          }}
        >
          {t("동기화", "Sync")}
        </Action>
      </section>
      <section className="panel">
        <h2>{t("구독·크레딧", "Subscription and credits")}</h2>
        <Action
          run={async () => setBilling(await request<Resource>("billing"))}
        >
          {t("조회", "View")}
        </Action>
        {billing && (
          <p>
            {billing.subscriptionStatus} · {billing.balanceMicroCredits}{" "}
            microCredits
          </p>
        )}
        <Form
          submitLabel={t("결제 페이지 열기", "Open checkout")}
          onSubmit={async (f) => {
            const result = await request<{ url: string }>(
              "billing/checkout",
              "POST",
              { planId: text(f, "planId") },
            );
            await external(result.url);
          }}
        >
          <Field label="Plan ID">
            <input name="planId" required />
          </Field>
        </Form>
        <Action
          run={async () => {
            const result = await request<{ url: string }>(
              "billing/portal",
              "POST",
              {},
            );
            await external(result.url);
          }}
        >
          {t("구독 관리", "Manage subscription")}
        </Action>
      </section>
      <Notice error={message} />
    </div>
  );
};
