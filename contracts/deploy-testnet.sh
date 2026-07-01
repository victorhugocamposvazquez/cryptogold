#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Copia contracts/.env.example → contracts/.env y rellena DEPLOYER_PRIVATE_KEY"
  exit 1
fi

set -a
source .env
set +a

if [[ -z "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
  echo "DEPLOYER_PRIVATE_KEY es obligatorio en contracts/.env"
  exit 1
fi

RPC="${BSC_TESTNET_RPC_URL:-https://data-seed-prebsc-1-s1.binance.org:8545}"

echo "→ Deploy token (CappedMintableToken) en BNB Smart Chain Testnet (chainId 97)"
echo "→ RPC: $RPC"

VERIFY_ARGS=()
if [[ -n "${BSCSCAN_API_KEY:-}" ]]; then
  VERIFY_ARGS=(--verify --etherscan-api-key "$BSCSCAN_API_KEY")
  echo "→ Verificación BscScan: activada"
else
  echo "→ Verificación BscScan: omitida (añade BSCSCAN_API_KEY para verificar)"
fi

forge script script/DeployCappedMintableToken.s.sol:DeployCappedMintableToken \
  --rpc-url "$RPC" \
  --broadcast \
  "${VERIFY_ARGS[@]}" \
  -vvvv

echo ""
echo "Actualiza la app con la dirección desplegada:"
echo "  NEXT_PUBLIC_BNB_NETWORK=testnet"
echo "  NEXT_PUBLIC_CGOLD_BNB_TESTNET=0x..."
