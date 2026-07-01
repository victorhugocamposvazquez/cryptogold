# CryptoGold — Smart Contract (CGOLD)

Token **CGOLD**: suministro máximo de **12.000.000.000** unidades, **18 decimales**. **Mint** por `owner` hasta el cap. Sin `burn`.

## Modelo v2 (mint controlado)

- `MAX_SUPPLY` = 12.000M (hard cap)
- En el deploy puedes mintear `INITIAL_TREASURY_MINT_TOKENS` al treasury (por defecto **0**)
- El **owner** (deployer o multisig) mintea el resto vía backoffice `/admin/token`
- Ideal para marketing, preventa y reserva de liquidez **antes** del pool

> Si desplegaste la versión antigua (sin mint), **redeploy obligatorio** en testnet. Estándar ERC-20 / BEP-20.

## Requisitos

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Wallet con **tBNB** en BNB Smart Chain Testnet ([faucet](https://www.bnbchain.org/en/testnet-faucet))
- (Opcional) API key de [BscScan](https://docs.bscscan.com/getting-started/viewing-api-usage-statistics) para verificar el contrato

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

```bash
cd contracts
cp .env.example .env
# Edita .env: DEPLOYER_PRIVATE_KEY (sin 0x), opcional TREASURY_ADDRESS y BSCSCAN_API_KEY
forge install foundry-rs/forge-std
```

## Compilar y testear

```bash
npm run contracts:build    # desde la raíz del repo
npm run contracts:test
```

O dentro de `contracts/`:

```bash
forge build
forge test -vv
```

## Deploy en BNB Smart Chain Testnet (chainId 97)

1. Obtén tBNB del faucet en la wallet del deployer.
2. Configura `contracts/.env`.
3. Ejecuta:

```bash
chmod +x deploy-testnet.sh
./deploy-testnet.sh
```

O manualmente:

```bash
forge script script/DeployCryptoGold.s.sol:DeployCryptoGold \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545 \
  --broadcast \
  --verify \
  -vvvv
```

4. Copia la dirección del log (`CryptoGold (CGOLD): 0x...`) a la app:

```env
# .env.local (raíz del proyecto)
NEXT_PUBLIC_BNB_NETWORK=testnet
NEXT_PUBLIC_CGOLD_BNB_TESTNET=0x...
TOKEN_OWNER_PRIVATE_KEY=...     # owner del contrato (mint en /admin/token)
CGOLD_TREASURY_ADDRESS=0x...    # opcional
```

5. Abre `/admin/token` y mintea a la wallet de marketing. Verifica en BscScan testnet.

## Treasury y mint

En el constructor, opcionalmente se mintea `INITIAL_TREASURY_MINT_TOKENS` al treasury. El resto se emite con `mint()` desde el owner (backoffice).

Distribución objetivo (off-chain / multisig antes de mainnet):

| Asignación | % |
|------------|---|
| Adquirentes / preventa | 70% |
| Stake estratégico emisor | 20% |
| Liquidez y reservas | 10% |

## Mainnet (cuando toque)

```bash
# contracts/.env — usa BSC_MAINNET_RPC_URL y fondos reales en BNB
forge script script/DeployCryptoGold.s.sol:DeployCryptoGold \
  --rpc-url https://bsc-dataseed.binance.org \
  --broadcast --verify -vvvv
```

Luego:

```env
NEXT_PUBLIC_BNB_NETWORK=mainnet
NEXT_PUBLIC_CGOLD_BNB=0x...
```

**Auditoría independiente obligatoria antes de mainnet.**
