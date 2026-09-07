import { create } from "zustand";
import { persist } from "zustand/middleware";
export const usePreferences = create(
  persist<{
    locale: "ko" | "en";
    theme: "dark" | "light" | "system";
    set: (
      values: Partial<{
        locale: "ko" | "en";
        theme: "dark" | "light" | "system";
      }>,
    ) => void;
  }>((set) => ({ locale: "ko", theme: "dark", set }), {
    name: "push-preferences",
  }),
);
export const useT = () => {
  const locale = usePreferences((s) => s.locale);
  return (ko: string, en: string) => (locale === "ko" ? ko : en);
};
