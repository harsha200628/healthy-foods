import { OwnerGate } from "@/components/owner/OwnerGate";
import { SettingsForm } from "@/components/owner/SettingsForm";

export default function OwnerSettingsPage() {
  return (
    <OwnerGate>
      <SettingsForm />
    </OwnerGate>
  );
}
