/** Static content for CryptoGold — landing, FAQ, tokenomics visuals. */

import { BRAND, TOKEN_SYMBOL, TOKEN_SUPPLY_LABEL } from "./brand";

export const ecosystem = [
  { name: "Reserva de oro físico", desc: "Activos tangibles custodiados bajo estructura legal internacional. Cada lote queda registrado, auditado y vinculado al suministro circulante del token." },
  { name: "TradFi · Banca corporativa", desc: "Cuentas en jurisdicciones reguladas (Dubai, Hong Kong, Suiza) que canalizan capital institucional hacia la reserva y la liquidez del ecosistema." },
  { name: "DeFi · Liquidez on-chain", desc: "Pools en BNB Chain, Ethereum y Polygon con paridad USDT. Compra, swap y transferencia sin custodia centralizada." },
  { name: "CRYPTOHOST", desc: "Infraestructura de transferencias automatizada con historial operativo de más de 5 millones de operaciones. Liquidación confiable a escala global." },
  { name: "Cumplimiento y auditoría", desc: "Contratos verificados on-chain, informes de auditoría independiente y registro progresivo en CoinMarketCap y exchanges de confianza." },
  { name: "Soporte dedicado", desc: "Atención automatizada 24/7 más equipo humano cualificado durante el primer año. Respuesta media inferior a 24 horas." },
];

export const tokenWhy = [
  { icon: "◆", title: "Respaldo en oro real", desc: "CGOLD está anclado al precio spot del oro: 1 token = 0,001 oz troy. Cuando el oro sube, tu posición lo refleja." },
  { icon: "◈", title: "Crypto + TradFi + DeFi", desc: "Lo mejor de tres mundos: liquidez on-chain, estructura bancaria internacional y activos tangibles auditables." },
  { icon: "◉", title: "Diseñado para patrimonio", desc: "Modelo orientado a revalorización sostenible, sin esquemas especulativos. Pensado para capital institucional y patrimonial." },
];

export const steps = [
  { n: "1", title: "Conecta tu wallet", desc: "MetaMask, Trust Wallet, WalletConnect o cualquier wallet estándar compatible." },
  { n: "2", title: "Compra con USDT, cripto o fiat", desc: "Tarjeta, transferencia SEPA o stablecoins. Liquidación instantánea vía CRYPTOHOST." },
  { n: "3", title: "Custodia y seguimiento", desc: "Tus CGOLD van directo a tu wallet. Sigue valor, correlación con el oro y movimientos en tiempo real." },
];

export const hubPos = [
  "position:absolute;left:50%;top:7.7%;transform:translate(-50%,-50%)",
  "position:absolute;left:84.2%;top:28.8%;transform:translate(-50%,-50%)",
  "position:absolute;left:84.2%;top:71.2%;transform:translate(-50%,-50%)",
  "position:absolute;left:50%;top:88.8%;transform:translate(-50%,-50%)",
  "position:absolute;left:15.8%;top:71.2%;transform:translate(-50%,-50%)",
  "position:absolute;left:15.8%;top:28.8%;transform:translate(-50%,-50%)",
];

export const hubMeta: [string, string, string][] = [
  ["Oro físico", "Reserva auditada", "respaldo tangible"],
  ["TradFi", "Banca internacional", "capital institucional"],
  ["DeFi", "Liquidez USDT", "on-chain 24/7"],
  ["CRYPTOHOST", "5M+ transferencias", "liquidación auto"],
  ["Legal", "Entidad global", "cumplimiento"],
  ["Exchanges", "CMC + listing", "visibilidad"],
];

export const chainCompare = {
  title: "BNB Chain vs. otros líderes (2026)",
  cols: ["Característica", "BNB Chain", "Ethereum", "Solana"],
  rows: [
    ["Ventaja principal", "Mayor base de usuarios activos", "Máxima seguridad y liquidez", "Velocidad y comisiones mínimas"],
    ["Cuota mercado RWA", "~10% (crecimiento rápido)", "~66% (dominante)", "~5%"],
    ["Compatibilidad", "EVM completo (migración fácil)", "Nativa", "Limitada (Rust/C)"],
    ["Coste", "Muy bajo y predecible", "Alto (L1) / Bajo (L2)", "Extremadamente bajo"],
  ],
};

export const faqDefs: [string, string][] = [
  [`¿Qué es ${TOKEN_SYMBOL}?`, `${TOKEN_SYMBOL} es el token de ${BRAND}: un activo digital respaldado por oro físico y estructura financiera internacional. Su precio de referencia sigue al spot del oro (1 ${TOKEN_SYMBOL} = 0,001 oz troy). No es minable ni quemable: suministro fijo de ${TOKEN_SUPPLY_LABEL} unidades verificables on-chain.`],
  [`¿Cómo compro ${TOKEN_SYMBOL}?`, "Con tarjeta (Transak o MoonPay), con USDT u otras criptomonedas desde tu wallet, o intercambiando ETH/BTC. Elige el método en Comprar, conecta tu wallet y recibe los tokens al instante."],
  ["¿En qué redes está disponible?", "Contratos activos y en despliegue en BNB Chain, Ethereum, Polygon, Solana, Stellar y XRP Ledger. La red principal de lanzamiento es BNB Chain por su coste, velocidad y base de usuarios."],
  ["¿Cómo se garantiza el respaldo en oro?", `${BRAND} mantiene reservas de oro físico y equivalentes financieros bajo entidad legal internacional, sujetos a auditoría periódica. El modelo combina activos tangibles con infraestructura bancaria regulada.`],
  ["¿Quién custodia mis tokens?", "Tú. " + BRAND + " no tiene custodia de tus fondos: los " + TOKEN_SYMBOL + " se envían a tu wallet y solo tú controlas las claves. Compras con tarjeta se procesan en el widget del proveedor (Transak / MoonPay)."],
  ["¿Qué comisiones tiene?", "Swap y compra cripto: 0,3%–1%. Compra con tarjeta: 1,5% Transak o 1,9% MoonPay. Todas las comisiones se muestran antes de confirmar."],
  ["¿Es adecuado para inversores institucionales?", "Sí. El proyecto está diseñado para capital patrimonial e institucional: estructura legal internacional, white paper profesional, contratos auditados y estrategia de listing progresivo en exchanges fiables."],
  ["¿Cuáles son los riesgos?", "Invertir en criptoactivos conlleva riesgo de pérdida. El valor puede fluctuar aun con respaldo en oro. Invierte solo lo que puedas permitirte perder y consulta a un asesor si lo necesitas."],
];

export const tkSegs: [string, number, string][] = [
  ["Adquirentes / preventa", 70, "var(--accent,#C9A227)"],
  ["Stake estratégico emisor", 20, "#E8D48B"],
  ["Liquidez y reservas", 10, "#5A5A60"],
];

export const walletDefs: [string, string, string, string][] = [
  ["MetaMask", "Extensión de navegador · EVM", "#E9962E", "M"],
  ["Trust Wallet", "Wallet móvil multi-chain", "#3375BB", "T"],
  ["WalletConnect", "Escanea con tu wallet móvil", "#3A8DFF", "W"],
  ["Coinbase Wallet", "Self-custody de Coinbase", "#2775CA", "C"],
];

export const provDefs: [string, string, string, string, string, string][] = [
  ["transak", "Transak", "Tarjeta · Apple Pay · SEPA · USDT", "#1A6BF2", "T", "1.5%"],
  ["moonpay", "MoonPay", "Tarjeta · Apple Pay · transferencia", "#7A4DFF", "M", "1.9%"],
];

export const assetMeta: Record<string, { name: string; color: string; sym: string }> = {
  CGOLD: { name: "CryptoGold Token", color: "#C9A227", sym: "Au" },
  ETH: { name: "Ethereum", color: "#6478F0", sym: "Ξ" },
  BTC: { name: "Bitcoin", color: "#E9962E", sym: "₿" },
  USDT: { name: "Tether USD", color: "#26A17B", sym: "$" },
  USDC: { name: "USD Coin", color: "#2775CA", sym: "$" },
};

export const baseTk: { s: string; p: string; c: string; up: boolean }[] = [
  { s: "XAU", p: "$3,342", c: "+0.42%", up: true },
  { s: "BTC", p: "$64,180", c: "+1.8%", up: true },
  { s: "ETH", p: "$3,452", c: "+2.4%", up: true },
  { s: "BNB", p: "$611.40", c: "+0.6%", up: true },
  { s: "USDT", p: "$1.00", c: "+0.01%", up: true },
  { s: "SOL", p: "$172.30", c: "-0.9%", up: false },
  { s: "XRP", p: "$0.583", c: "+3.1%", up: true },
  { s: "MATIC", p: "$0.72", c: "+1.4%", up: true },
];

export const structuredBacking = {
  amount: "€12.000M",
  amountFull: "€12.000.000.000,00",
  note: "Respaldo estructurado estimado en oro físico y equivalentes financieros tangibles, sujeto a viabilidad legal y regulatoria y a la estructura corporativa final.",
};

export const infraItems: { icon: string; title: string; desc: string; href: string }[] = [
  { icon: "⬡", title: "Smart contract verificable", desc: "Token único, auditado y publicado en exploradores de bloques.", href: "/docs/audit" },
  { icon: "◎", title: "Compra integrada", desc: "USDT, criptomonedas y fiat (Transak / MoonPay) en un clic.", href: "/comprar" },
  { icon: "⇄", title: "CRYPTOHOST", desc: "Liquidación automatizada con historial de más de 5 millones de transferencias.", href: "/docs/cryptohost" },
  { icon: "◉", title: "Soporte dedicado", desc: "Respuesta automatizada 24/7 y equipo humano cualificado el primer año.", href: "/docs/support" },
  { icon: "⚖", title: "Estructura legal", desc: "Entidad internacional y banca corporativa en hubs regulados.", href: "/docs/legal-structure" },
  { icon: "↗", title: "Visibilidad global", desc: "Registro CoinMarketCap y listing progresivo en exchanges.", href: "/docs/listings" },
];

export const roadmapPhases: { when: string; title: string; status: "done" | "active" | "upcoming"; items: string[] }[] = [
  {
    when: "Q2 2026",
    title: "Fundación y preventa",
    status: "active",
    items: ["Preventa pública de CGOLD", "Despliegue BNB Chain + liquidez USDT", "Activación CRYPTOHOST", "White paper y auditoría de contratos"],
  },
  {
    when: "Q3–Q4 2026",
    title: "Expansión multi-chain",
    status: "upcoming",
    items: ["Contratos en Ethereum, Polygon y Solana", "Registro informativo CoinMarketCap", "Constitución entidad legal internacional", "Apertura estructura bancaria corporativa"],
  },
  {
    when: "2027",
    title: "Institucional y exchanges",
    status: "upcoming",
    items: ["Listings progresivos en exchanges fiables", "Ampliación reservas de oro auditadas", "Reporting para inversores institucionales", "Gobernanza y transparencia on-chain"],
  },
];

export const supportChannels: { channel: string; detail: string; sla: string }[] = [
  { channel: "Email", detail: "soporte@cryptogold.io", sla: "Respuesta media < 24 h" },
  { channel: "Chat in-app", detail: "Asistente automatizado + escalado humano", sla: "Instantáneo · 24/7" },
  { channel: "Equipo humano", detail: "3 especialistas dedicados (año 1)", sla: "L–V · cobertura completa" },
  { channel: "Estado del servicio", detail: "status.cryptogold.io", sla: "Incidencias en tiempo real" },
];

export const listingStages: { stage: string; target: string; desc: string; status: "done" | "active" | "planned" }[] = [
  { stage: "Fase 1", target: "CoinMarketCap", desc: "Registro informativo y datos de mercado públicos.", status: "active" },
  { stage: "Fase 2", target: "DEX tier-1", desc: "Liquidez profunda USDT/CGOLD en BNB Chain y Ethereum.", status: "active" },
  { stage: "Fase 3", target: "CEX regionales", desc: "Exchanges regulados en EMEA y APAC.", status: "planned" },
  { stage: "Fase 4", target: "CEX tier-1", desc: "Listings progresivos en plataformas globales de confianza.", status: "planned" },
];

export type DocSection = { h?: string; p: string[] };
export type Doc = {
  eyebrow: string;
  title: string;
  meta: string;
  subtitle: string;
  hasStats?: boolean;
  stats?: { value: string; label: string }[];
  sections: DocSection[];
};
