import {
  buildEnvTemplate,
  getActiveNetwork,
  resolveNetworkConfigView as resolveBase,
  type BnbNetwork,
  type NetworkConfigView,
} from "./network-profiles";
import { getActiveDeployment } from "@/lib/token/deployments";

/** Vista admin con contrato del registro cuando no hay env (solo servidor). */
export async function resolveNetworkConfigView(network: BnbNetwork): Promise<NetworkConfigView> {
  const base = resolveBase(network);
  if (!base.active || base.contractAddress) return base;

  const reg = await getActiveDeployment(network);
  if (!reg?.address) return base;

  return {
    ...base,
    contractAddress: reg.address,
    contractSource: "registry",
  };
}

export { buildEnvTemplate, getActiveNetwork };
export type { BnbNetwork, NetworkConfigView };
