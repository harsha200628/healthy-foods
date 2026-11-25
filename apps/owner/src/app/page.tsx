import { OrdersBoard } from "@/components/owner/OrdersBoard";
import { OwnerGate } from "@/components/owner/OwnerGate";

export default function OwnerHomePage() {
  return (
    <OwnerGate>
      <OrdersBoard />
    </OwnerGate>
  );
}
