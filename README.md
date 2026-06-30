# CryptoGold

Plataforma del token **CGOLD** — activo digital respaldado en oro, anclado al spot XAU/USD.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (opcional) · demo client-side con localStorage
- Vercel Cron → `/api/tick`

## Desarrollo local

```bash
cp .env.example .env.local   # opcional
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción (Fase 3)

1. **Supabase** — crea proyecto, ejecuta `supabase/schema.sql`, copia URL y keys a `.env.local`
2. **Vercel** — deploy con env vars; `vercel.json` ejecuta cron de precios cada minuto
3. **Contrato** — deploy `contracts/CryptoGold.sol` en BNB Chain (ver `contracts/README.md`)
4. **Pagos fiat** — configura webhook Transak/MoonPay → `POST /api/webhooks/payment` con header `x-webhook-secret`

### Variables de entorno

Ver `.env.example`.

## Token

| Característica | Valor |
|----------------|-------|
| Símbolo | CGOLD |
| Suministro | 12.000M (fijo) |
| Anclaje | 0,001 oz oro / token |
| Red principal | BNB Chain |

Precio del oro: `/api/gold` · Cron CGOLD: `/api/tick`
