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

### Panel CRYPTOHOST (`/admin`)

**No requiere Supabase ni Vercel.** Funciona en local y en producción solo con contraseña.

1. Abre [http://localhost:3000/admin](http://localhost:3000/admin)
2. Contraseña por defecto: `cryptohost-dev` (cámbiala con `CRYPTOHOST_ADMIN_PASSWORD` en `.env.local`)

Desde el panel puedes ver transferencias, regenerar el histórico de 5.000 operaciones y consultar métricas.

## Producción (Fase 3)

1. **Supabase** — crea proyecto, ejecuta `supabase/schema.sql`, copia URL y keys a `.env.local`
2. **Vercel** — deploy con env vars; `vercel.json` ejecuta cron de precios cada minuto
3. **Contrato** — deploy `contracts/CryptoGold.sol` en BNB Chain (ver `contracts/README.md`)
4. **Pagos fiat** — configura webhook Transak/MoonPay → `POST /api/webhooks/payment` con header `x-webhook-secret`

### Variables de entorno

Ver `.env.example`.

| Variable | ¿Obligatoria? | Para qué |
|----------|---------------|----------|
| `CRYPTOHOST_ADMIN_PASSWORD` | No (default `cryptohost-dev`) | Login en `/admin` |
| `NEXT_PUBLIC_SUPABASE_*` | No | Persistir trades y usuarios en BD |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Webhooks y cron con Supabase |
| `PAYMENT_WEBHOOK_SECRET` | No | Webhook Transak/MoonPay |

## Token

| Característica | Valor |
|----------------|-------|
| Símbolo | CGOLD |
| Suministro | 12.000M (fijo) |
| Anclaje | 0,001 oz oro / token |
| Red principal | BNB Chain |

Precio del oro: `/api/gold` · Cron CGOLD: `/api/tick`
