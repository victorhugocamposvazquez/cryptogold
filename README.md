# CryptoGold

Plataforma del token **CGOLD** — activo digital respaldado en oro, anclado al spot XAU/USD.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Demo client-side (localStorage) · Supabase scaffolding para producción

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Token

| Característica | Valor |
|----------------|-------|
| Símbolo | CGOLD |
| Suministro | 12.000M (fijo) |
| Anclaje | 0,001 oz oro / token |
| Redes | BNB Chain, ETH, MATIC, SOL, Stellar, XRP Ledger |

Precio del oro en vivo vía `/api/gold`.
