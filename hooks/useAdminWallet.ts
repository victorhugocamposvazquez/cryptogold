"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { adminWalletConnector } from "@/lib/wagmi/config";
import { getTargetChain, getTargetChainId, getTargetChainLabel } from "@/lib/wagmi/chains";

export function useAdminWallet() {
  const { address, isConnected, isConnecting, chainId } = useAccount();
  const { connect, isPending: isConnectPending, error: connectError, reset: resetConnect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const { data: walletClient, isLoading: walletLoading } = useWalletClient();
  const publicClient = usePublicClient();

  const targetChainId = getTargetChainId();
  const targetChainLabel = getTargetChainLabel();
  const isCorrectChain = !isConnected || chainId === targetChainId;

  function connectWallet() {
    resetConnect();
    connect({ connector: adminWalletConnector });
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
    connectError,
    disconnect,
    switchToTargetChain,
    isOwner,
  };
}
