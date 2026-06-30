import { docMap } from "@/lib/docs";
import CryptohostDocView from "@/components/cryptohost/CryptohostDocView";

export default function CryptohostDocumentacionPage() {
  return <CryptohostDocView doc={docMap.cryptohost} />;
}
