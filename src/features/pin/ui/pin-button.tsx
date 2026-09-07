import { Pin, PinOff } from "lucide-react";
import { request, useResources } from "@/shared/api";
import { Action } from "@/shared/ui";
import { useT } from "@/shared/config";
export const PinButton = ({
  resourceType,
  resourceId,
}: {
  resourceType: "JOB" | "DOCUMENT";
  resourceId: string;
}) => {
  const t = useT();
  const pins = useResources("pins");
  const pin = pins.data.find(
    (p) => p.resourceId === resourceId && p.resourceType === resourceType,
  );
  return (
    <Action
      run={async () => {
        if (pin) await request(`pins/${pin.id}`, "DELETE");
        else await request("pins", "POST", { resourceType, resourceId });
        await pins.reload();
      }}
    >
      {pin ? <PinOff size={16} /> : <Pin size={16} />}{" "}
      {pin ? t("고정 해제", "Unpin") : t("고정", "Pin")}
    </Action>
  );
};
