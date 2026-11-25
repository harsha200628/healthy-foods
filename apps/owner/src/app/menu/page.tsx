import { MenuManager } from "@/components/owner/MenuManager";
import { OwnerGate } from "@/components/owner/OwnerGate";

export default function OwnerMenuPage() {
  return (
    <OwnerGate>
      <MenuManager />
    </OwnerGate>
  );
}
