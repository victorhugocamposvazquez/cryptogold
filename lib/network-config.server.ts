import { getActiveDeployment } from "@/lib/token/deployments";
import {
  buildEnvTemplate,
  getActiveNetwork,
  resolveNetworkConfigView as resolveBase,
  type BnbNetwork,
  type NetworkConfigView,
} from "./network-profiles";

/** Vista admin con contrato del registro cuando no hay env (solo servidor). */
export function resolveNetworkConfigView(network: BnbNetwork): NetworkConfigView {
  const base = resolveBase(network);
  if (!base.active || base.contractAddress) return base;

  const reg = getActiveDeployment(network);
  if (!reg?.address) return base;

  return {
    ...base,
    contractAddress: reg.address,
    contractSource: "registry",
  };
}

export { buildEnvTemplate, getActiveNetwork };
export type { BnbNetwork, NetworkConfigView };
