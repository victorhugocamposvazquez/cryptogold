# openAI — Next.js + Supabase + Vercel

Plataforma de inversión en el token **OPEN**: landing, mercado con gráfico en vivo, comprar (tarjeta vía Transak/MoonPay o cripto), swap desde wallet, cartera con P&L y páginas de documentación (whitepaper, tokenomics, legal…).

> ⚠️ **Concepto de diseño ficticio.** "openAI" y "OPEN" son inventados, sin valor real y sin afiliación con OpenAI. **No** es una oferta de inversión. No conectes rampas de pago reales ni muevas fondos reales sin entender las implicaciones legales.

---

## Arranque rápido

```bash
npm install
npm run dev
# http://localhost:3000
```

Funciona **sin backend**: toda la lógica (precio en vivo, balances, compra, swap, conexión de wallet, cartera) está simulada en el cliente y se guarda en `localStorage`. Ideal para diseñar y demostrar el flujo. La integración con Supabase está cableada como scaffolding listo para activar.

## Stack

- **Next.js 14** (App Router, React Server + Client Components, `next/font`).
- **TypeScript**, sin dependencias de UI: estilos inline (helper `lib/css.ts` que convierte cadenas CSS en objetos de estilo) + `app/globals.css` (fuentes, keyframes, media queries).
- **Supabase** (opcional): Auth + Postgres + RLS + RPC `execute_trade` + Realtime. Esquema en `supabase/schema.sql`.
- **Vercel**: hosting + env vars + Cron (`vercel.json` → `/api/tick`).

## Estructura

```
app/
  layout.tsx            Fuentes, AppProvider, chrome global (header, marquee, footer, nav móvil, modales, toast)
  page.tsx              Inicio
  mercado/page.tsx      Gráfico + market stats
  comprar/page.tsx      Comprar (tarjeta / cripto)
  swap/page.tsx         Intercambiar desde wallet
  cartera/page.tsx      Cartera (vacía sin conexión)
  docs/[slug]/page.tsx  Whitepaper, tokenomics, docs, auditoría, soporte, términos, privacidad, riesgos
  api/tick/route.ts     Cron de precio (Vercel)
  globals.css
components/
  Header, Marquee, Footer, MobileNav, Modals, Chart, ui (Hov + Logo)
  screens/              Home, Market, Buy, Swap, Portfolio, DocPage
lib/
  store.tsx             Estado global + acciones (demo simulada + persistencia)
  css.ts format.ts series.ts content.ts docs.ts
  supabase/client.ts server.ts
hooks/
  useOpenPrice, useBalances, useTrade   (wrappers del store; documentan el equivalente Supabase)
supabase/
  schema.sql            Tablas, RLS y RPC execute_trade
```

## Conectar Supabase (producción)

1. `npm i @supabase/supabase-js @supabase/ssr`
2. Crea el proyecto en Supabase y ejecuta `supabase/schema.sql` en el SQL editor.
3. Copia `.env.example` → `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (y `SUPABASE_SERVICE_ROLE_KEY` solo en servidor).
4. Sustituye la lógica del store por las llamadas documentadas en los hooks:

| Demo (store) | Producción (Supabase) |
|---|---|
| `price` random-walk | tabla `price_ticks` + Realtime; último tick = precio actual |
| series del gráfico | `select price_usd, ts from price_ticks` por rango |
| `connect()` simulado | wagmi connect → firmar mensaje (SIWE) → Supabase Auth → upsert `profiles.wallet_address` |
| `balances` en estado | tabla `balances` (RLS por `user_id`) + Realtime |
| `buy()` / `swap()` | `supabase.rpc('execute_trade', { p_kind, p_pay_asset, p_pay_amount, p_price_usd })` |
| pago con tarjeta (modal demo) | widget real de **Transak** / **MoonPay**; su **webhook** (Edge Function / route handler con service-role) acredita OPEN llamando a `execute_trade`. Nunca proceses la tarjeta en tu dominio. |
| `txs` | tabla `transactions` (`order by created_at desc`) |

## Wallet real

`npm i wagmi viem @rainbow-me/rainbowkit` y define `NEXT_PUBLIC_WALLETCONNECT_ID`. Envuelve la app con los providers de wagmi/RainbowKit y conecta el botón "Conectar wallet" del `Header` a `useConnectModal()`. El swap on-chain real requiere un contrato/DEX; en demo basta firmar un mensaje para autenticar la dirección y operar contra balances en Supabase.

## Desplegar en Vercel

1. Importa el repo en Vercel.
2. Añade las variables de entorno (Project Settings → Environment Variables).
3. El cron de `vercel.json` llama a `/api/tick` cada minuto para insertar un `price_tick` (cablea Supabase primero).
4. Para Supabase Auth: configura `Site URL` y `Redirect URLs` con el dominio de Vercel.

## Notas de diseño

Tokens, tipografía (Hanken Grotesk + JetBrains Mono), radios, sombras e interacciones son finales. El acento es la CSS var `--accent` (`#0E8C6A`); cámbiala en `app/globals.css`. Breakpoint móvil: `max-width: 860px` (ver `globals.css`).
