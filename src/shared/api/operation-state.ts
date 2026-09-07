import { create } from "zustand";
import { useSession } from "@/shared/auth";
import { localRead, localWrite } from "@/shared/storage";
import type { Operation } from "./client";
export const useOperations = create<{ items: Record<string, Operation> }>(
  () => ({ items: {} }),
);
export const recordOperation = async (operation: Operation) => {
  useOperations.setState((s) => ({
    items: { ...s.items, [operation.id]: operation },
  }));
  const account = useSession.getState().accountId;
  if (account)
    await localWrite(account, "operations", useOperations.getState().items);
};
export const restoreOperations = async () => {
  const account = useSession.getState().accountId;
  if (!account) return;
  const saved = await localRead<Record<string, Operation>>(
    account,
    "operations",
  );
  if (account === useSession.getState().accountId)
    useOperations.setState({ items: saved || {} });
};
export const dismissOperation = async (id: string) => {
  const items = { ...useOperations.getState().items };
  delete items[id];
  useOperations.setState({ items });
  const account = useSession.getState().accountId;
  if (account) await localWrite(account, "operations", items);
};
useSession.subscribe((s, p) => {
  if (s.accountId !== p.accountId) useOperations.setState({ items: {} });
});
