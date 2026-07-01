"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { getTargetChain, getTargetChainId, getTargetChainLabel } from "@/lib/wagmi/chains";

export function useAdminWallet() {
  const { address, isConnected, isConnecting, chainId } = useAccount();
  const { connect, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { data: walletClient, isLoading: walletLoading } = useWalletClient();
  const publicClient = usePublicClient();

  const targetChainId = getTargetChainId();
  const targetChainLabel = getTargetChainLabel();
  const isCorrectChain = !isConnected || chainId === targetChainId;

  function connectWallet() {
    connect({ connector: injected({ target: "metaMask" }) });
  }

  async function switchToTargetChain() {
    await switchChain({ chainId: targetChainId });
  }

  function isOwner(owner: string | null | undefined): boolean {
    if (!address || !owner) return false;
    return address.toLowerCase() === owner.toLowerCase();
  }

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    isCorrectChain,
    isSwitchPending,
    targetChainId,
    targetChainLabel,
    targetChain: getTargetChain(),
    walletClient: walletClient ?? null,
    publicClient: publicClient ?? null,
    walletReady: !!walletClient && !walletLoading,
    connectWallet,
    disconnect,
    switchToTargetChain,
    isOwner,
  };
}
