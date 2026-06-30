# CryptoGold — Smart Contract

Token **CGOLD**: suministro fijo de 12.000.000.000 unidades, 18 decimales. Sin `mint` ni `burn`.

## Deploy (Foundry)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

cd contracts
forge create CryptoGold.sol:CryptoGold \
  --rpc-url $BNB_RPC_URL \
  --private-key $DEPLOYER_KEY \
  --constructor-args $TREASURY_ADDRESS
```

## Verificación

Publica el código en BscScan/Etherscan y actualiza `.env`:

```
NEXT_PUBLIC_CGOLD_BNB=0x...
```

## Distribución sugerida (off-chain / multisig)

| Asignación | % |
|------------|---|
| Adquirentes / preventa | 70% |
| Stake estratégico emisor | 20% |
| Liquidez y reservas | 10% |

Auditoría independiente obligatoria antes de mainnet.
