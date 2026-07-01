import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { bsc, bscTestnet } from "wagmi/chains";

const testnetRpc =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
const mainnetRpc = process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org";

export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [bscTestnet.id]: http(testnetRpc),
    [bsc.id]: http(mainnetRpc),
  },
  ssr: true,
});
