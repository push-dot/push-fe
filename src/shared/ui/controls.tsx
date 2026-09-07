import { useState, type ReactNode, type FormEvent } from "react";
import { useT } from "@/shared/config";
export const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
export const Empty = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <div className="empty">
    <span className="empty-mark">P</span>
    <h2>{title}</h2>
    {children && <p>{children}</p>}
  </div>
);
export const Notice = ({ error }: { error?: string }) =>
  error ? (
    <div role="alert" className="notice">
      {error}
    </div>
  ) : null;
export const Action = ({
  children,
  run,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  run: () => Promise<unknown>;
  className?: string;
  disabled?: boolean;
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={busy || disabled}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await run();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "…" : children}
      </button>
      <Notice error={error} />
    </>
  );
};
export const Form = ({
  children,
  onSubmit,
  submitLabel,
  resetOnSuccess = true,
}: {
  children: ReactNode;
  onSubmit: (form: FormData) => Promise<unknown>;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) => {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await onSubmit(new FormData(form));
      if (resetOnSuccess) form.reset();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="form-stack">
      {children}
      <Notice error={error} />
      <div className="actions">
        <button className="primary" disabled={busy}>
          {busy ? t("처리 중…", "Working…") : submitLabel || t("저장", "Save")}
        </button>
        {saved && (
          <span role="status" className="muted">
            {t("저장됨", "Saved")}
          </span>
        )}
      </div>
    </form>
  );
};
export const text = (form: FormData, key: string) =>
  String(form.get(key) || "").trim();
export const lines = (value: string) =>
  value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
