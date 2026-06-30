import { docMap } from "@/lib/docs";
import { ServiceStatusPanel } from "@/components/cryptohost/CryptohostDocView";

export default function CryptohostStatusPage() {
  return <ServiceStatusPanel doc={docMap.status} />;
}
