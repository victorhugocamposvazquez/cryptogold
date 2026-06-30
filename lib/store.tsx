"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRICES_USD } from "./format";
import { TOKEN_SYMBOL } from "./brand";
import { getMarket, startMarketTicker } from "./market";

/* ──────────────────────────────────────────────────────────
   CryptoGold demo store. Trading logic simulated client-side
   and persisted to localStorage.
   ────────────────────────────────────────────────────────── */

export type Balances = Record<string, number>;
export type Tx = {
  type: string;
  main: string;
  sub: string;
  time: string;
  id: string;
  date: string;
  openStr: string;
  payLabel: string;
  rate: string;
  fee: string;
  isSell?: boolean;
  recvLabel?: string;
};
const STORAGE_KEY = "cryptogold_demo_v1";
const TK = TOKEN_SYMBOL;

export function prices(open: number): Record<string, number> {
  return { [TK]: open, ...PRICES_USD };
}

function fmtN(n: number, d: number) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtUSD(n: number) {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface AppState {
  // wallet / account
  connected: boolean;
  address: string;
  balances: Balances;
  openAvg: number;
  txs: Tx[];
  // buy form
  buyMethod: "card" | "crypto";
  payAsset: string;
  payAmount: string;
  cardCur: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
  cardName: string;
  provider: string;
  // swap form
  fromAsset: string;
  fromAmount: string;
  slippage: number;
  swapSide: "toOpen" | "fromOpen";
  tf: string;
  processing: boolean;
  walletOpen: boolean;
  providerOpen: boolean;
  successOpen: boolean;
  successTx: Tx | null;
  toast: string | null;
}

export interface AppApi extends AppState {
  set: <K extends keyof AppState>(patch: Partial<AppState>) => void;
  // wallet
  openWallet: () => void;
  closeWallet: () => void;
  connect: (name: string) => void;
  disconnect: () => void;
  // buy
  setBuyMethod: (k: "card" | "crypto") => void;
  setPay: (k: string) => void;
  setPayAmount: (v: string) => void;
  setQuick: (v: number) => void;
  maxPay: () => void;
  setCardCur: (k: string) => void;
  onCardNumber: (v: string) => void;
  onCardExp: (v: string) => void;
  onCardCvc: (v: string) => void;
  onCardName: (v: string) => void;
  setProvider: (k: string) => void;
  closeProvider: () => void;
  buy: () => void;
  confirmProvider: () => void;
  // swap
  setFrom: (k: string) => void;
  setFromAmount: (v: string) => void;
  flipSwap: () => void;
  setSlip: (v: number) => void;
  maxFrom: () => void;
  swap: () => void;
  // success
  closeSuccess: () => void;
  downloadReceipt: () => void;
  // misc
  toastMsg: (m: string) => void;
}

const Ctx = createContext<AppApi | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within <AppProvider>");
  return v;
};

const INITIAL: AppState = {
  connected: false,
  address: "0x7A3f…9E2b",
  balances: { USDT: 0, USDC: 0, ETH: 0, BTC: 0, CGOLD: 0 },
  openAvg: 0,
  txs: [],
  buyMethod: "card",
  payAsset: "USDT",
  payAmount: "500",
  cardCur: "EUR",
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
  cardName: "",
  provider: "transak",
  fromAsset: "USDT",
  fromAmount: "1",
  slippage: 0.5,
  swapSide: "toOpen",
  tf: "1M",
  processing: false,
  walletOpen: false,
  providerOpen: false,
  successOpen: false,
  successTx: null,
  toast: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(INITIAL);
  const sref = useRef(s);
  sref.current = s;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const procTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((patch: Partial<AppState>) => setS((p) => ({ ...p, ...patch })), []);

  // ── hydrate from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === "object") {
          setS((p) => ({
            ...p,
            connected: !!d.connected,
            address: d.address || p.address,
            balances: d.balances || p.balances,
            openAvg: d.openAvg || 0,
            txs: Array.isArray(d.txs) ? d.txs : [],
          }));
        }
      }
    } catch {}
    startMarketTicker();
  }, []);

  const persist = useCallback((next: AppState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          connected: next.connected,
          address: next.address,
          balances: next.balances,
          openAvg: next.openAvg,
          txs: next.txs,
        })
      );
    } catch {}
  }, []);

  const toastMsg = useCallback((m: string) => {
    setS((p) => ({ ...p, toast: m }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setS((p) => ({ ...p, toast: null })), 2600);
  }, []);

  // ── wallet ──
  const openWallet = useCallback(() => set({ walletOpen: true }), [set]);
  const closeWallet = useCallback(() => set({ walletOpen: false }), [set]);
  const connect = useCallback(
    (name: string) => {
      setS((p) => {
        const next = {
          ...p,
          connected: true,
          walletOpen: false,
          balances: { USDT: 12500, USDC: 5000, ETH: 4.2, BTC: 0.35, CGOLD: p.balances.CGOLD || 0 },
        };
        persist(next);
        return next;
      });
      toastMsg("Wallet conectada · " + name);
    },
    [persist, toastMsg]
  );
  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ connected: false, openAvg: 0, balances: { USDT: 0, USDC: 0, ETH: 0, BTC: 0, CGOLD: 0 }, txs: [] });
    toastMsg("Wallet desconectada");
  }, [set, toastMsg]);

  // ── buy form setters ──
  const setBuyMethod = useCallback((k: "card" | "crypto") => set({ buyMethod: k }), [set]);
  const setPay = useCallback((k: string) => set({ payAsset: k }), [set]);
  const setPayAmount = useCallback((v: string) => set({ payAmount: v }), [set]);
  const setQuick = useCallback((v: number) => set({ payAmount: String(v) }), [set]);
  const maxPay = useCallback(() => set({ payAmount: String(sref.current.balances[sref.current.payAsset] || 0) }), [set]);
  const setCardCur = useCallback((k: string) => set({ cardCur: k }), [set]);
  const onCardNumber = useCallback((v: string) => {
    const f = v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    set({ cardNumber: f });
  }, [set]);
  const onCardExp = useCallback((v: string) => {
    let f = v.replace(/\D/g, "").slice(0, 4);
    if (f.length >= 3) f = f.slice(0, 2) + "/" + f.slice(2);
    set({ cardExp: f });
  }, [set]);
  const onCardCvc = useCallback((v: string) => set({ cardCvc: v.replace(/\D/g, "").slice(0, 4) }), [set]);
  const onCardName = useCallback((v: string) => set({ cardName: v }), [set]);
  const setProvider = useCallback((k: string) => set({ provider: k }), [set]);
  const closeProvider = useCallback(() => set({ providerOpen: false }), [set]);

  // ── swap form setters ──
  const setFrom = useCallback((k: string) => set({ fromAsset: k }), [set]);
  const setFromAmount = useCallback((v: string) => set({ fromAmount: v }), [set]);
  const flipSwap = useCallback(
    () => setS((p) => ({ ...p, swapSide: p.swapSide === "toOpen" ? "fromOpen" : "toOpen", fromAmount: "" })),
    []
  );
  const setSlip = useCallback((v: number) => set({ slippage: v }), [set]);
  const maxFrom = useCallback(() => {
    const p = sref.current;
    const pt = p.swapSide === "toOpen" ? p.fromAsset : TK;
    set({ fromAmount: String(p.balances[pt] || 0) });
  }, [set]);

  // ── transaction completion ──
  const runProcessing = useCallback((fn: () => void) => {
    if (sref.current.processing) return;
    set({ processing: true });
    if (procTimer.current) clearTimeout(procTimer.current);
    procTimer.current = setTimeout(() => {
      set({ processing: false });
      fn();
    }, 950);
  }, [set]);

  const dateStr = () => {
    try {
      return new Date().toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return new Date().toLocaleString();
    }
  };

  const finishBuy = useCallback(
    (openAdded: number, usdGross: number, feeUsd: number, payLabel: string, kind: string, debit: { asset: string; amount: number } | null) => {
      const P = prices(getMarket().price);
      const tx: Tx = {
        type: kind,
        main: "+" + fmtN(openAdded, 2) + " " + TK,
        sub: payLabel,
        time: "ahora",
        id: "CGD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: dateStr(),
        openStr: fmtN(openAdded, 2),
        payLabel,
        rate: "1 " + TK + " = " + fmtUSD(P[TK]),
        fee: fmtUSD(feeUsd),
      };
      setS((p) => {
        const b = { ...p.balances };
        if (debit) b[debit.asset] = +(b[debit.asset] - debit.amount).toFixed(6);
        const oldQty = b[TK],
          oldAvg = p.openAvg;
        b[TK] = +(b[TK] + openAdded).toFixed(2);
        const newAvg = oldQty + openAdded > 0 ? (oldQty * oldAvg + usdGross) / (oldQty + openAdded) : 0;
        const next = { ...p, balances: b, openAvg: newAvg, txs: [tx, ...p.txs], successTx: tx, successOpen: true, providerOpen: false };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const finishSwapOut = useCallback(
    (openSpent: number, tokenAsset: string, tokenAmt: number, feeUsd: number) => {
      const P = prices(getMarket().price);
      const tx: Tx = {
        type: "Venta",
        main: "+" + fmtN(tokenAmt, tokenAsset === "BTC" ? 5 : 4) + " " + tokenAsset,
        sub: fmtN(openSpent, 2) + " " + TK + " → " + tokenAsset,
        time: "ahora",
        id: "CGD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: dateStr(),
        openStr: fmtN(openSpent, 2),
        payLabel: fmtN(openSpent, 2) + " " + TK,
        rate: "1 " + TK + " = " + fmtUSD(P[TK]),
        fee: fmtUSD(feeUsd),
        isSell: true,
        recvLabel: fmtN(tokenAmt, tokenAsset === "BTC" ? 5 : 4) + " " + tokenAsset,
      };
      setS((p) => {
        const b = { ...p.balances };
        b[TK] = +(b[TK] - openSpent).toFixed(2);
        b[tokenAsset] = +((b[tokenAsset] || 0) + tokenAmt).toFixed(6);
        const next = { ...p, balances: b, txs: [tx, ...p.txs], successTx: tx, successOpen: true };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const payCard = useCallback(() => {
    const p = sref.current;
    const amt = parseFloat(p.payAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) {
      set({ walletOpen: true });
      return toastMsg("Conecta una wallet para recibir tus " + TK);
    }
    set({ providerOpen: true });
  }, [set, toastMsg]);

  const confirmProvider = useCallback(() => {
    const p = sref.current;
    if (p.cardNumber.replace(/\D/g, "").length < 15) return toastMsg("Número de tarjeta incompleto");
    if (!/^\d{2}\/\d{2}$/.test(p.cardExp)) return toastMsg("Caducidad inválida (MM/AA)");
    if (p.cardCvc.length < 3) return toastMsg("CVC inválido");
    if (!p.cardName.trim()) return toastMsg("Añade el titular de la tarjeta");
    runProcessing(() => {
      const cur = sref.current;
      const amt = parseFloat(cur.payAmount) || 0;
      const P = prices(getMarket().price);
      const rate = cur.provider === "moonpay" ? 0.019 : 0.015;
      const usd = amt * P[cur.cardCur];
      const open = (usd * (1 - rate)) / P[TK];
      const prov = cur.provider === "moonpay" ? "MoonPay" : "Transak";
      finishBuy(open, usd, usd * rate, fmtN(amt, 2) + " " + cur.cardCur + " · " + prov, "Compra con tarjeta", null);
    });
  }, [runProcessing, finishBuy, toastMsg]);

  const buy = useCallback(() => {
    const p = sref.current;
    if (p.buyMethod === "card") return payCard();
    const amt = parseFloat(p.payAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) return set({ walletOpen: true });
    const P = prices(getMarket().price);
    const a = p.payAsset;
    const isCrypto = a === "USDT" || a === "USDC" || a === "ETH" || a === "BTC";
    if (isCrypto && (p.balances[a] || 0) < amt) return toastMsg("Saldo insuficiente de " + a);
    runProcessing(() => {
      const cur = sref.current;
      const usd = amt * P[a];
      const open = (usd * 0.99) / P[TK];
      finishBuy(open, usd, usd * 0.01, "con " + fmtN(amt, a === "BTC" ? 4 : 2) + " " + a, "Compra", isCrypto ? { asset: a, amount: amt } : null);
    });
  }, [payCard, runProcessing, finishBuy, set, toastMsg]);

  const swap = useCallback(() => {
    const p = sref.current;
    const amt = parseFloat(p.fromAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) return set({ walletOpen: true });
    const P = prices(getMarket().price);
    const side = p.swapSide,
      token = p.fromAsset;
    const payToken = side === "toOpen" ? token : TK;
    if ((p.balances[payToken] || 0) < amt) return toastMsg("Saldo insuficiente de " + payToken);
    runProcessing(() => {
      const usd = amt * P[payToken];
      if (side === "toOpen") {
        const open = (usd * 0.997) / P[TK];
        finishBuy(open, usd, usd * 0.003, fmtN(amt, 4) + " " + token + " → " + TK, "Intercambio", { asset: token, amount: amt });
      } else {
        const recv = (usd * 0.997) / P[token];
        finishSwapOut(amt, token, recv, usd * 0.003);
      }
    });
  }, [runProcessing, finishBuy, finishSwapOut, set, toastMsg]);

  const closeSuccess = useCallback(() => set({ successOpen: false }), [set]);
  const downloadReceipt = useCallback(() => {
    const t = sref.current.successTx;
    if (!t) return;
    const lines = [
      "CryptoGold — Recibo de operación",
      "----------------------------------------",
      "ID            " + t.id,
      "Tipo          " + t.type,
      "Fecha         " + t.date,
      "Pagado        " + t.payLabel,
      "Recibido      " + t.openStr + " " + TK,
      "Precio        " + t.rate,
      "Comisión      " + t.fee,
      "Wallet        " + sref.current.address,
      "----------------------------------------",
      "Gracias por confiar en CryptoGold.",
    ].join("\n");
    try {
      const blob = new Blob([lines], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CryptoGold-recibo-" + t.id + ".txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toastMsg("Recibo descargado");
    } catch {
      toastMsg("No se pudo descargar el recibo");
    }
  }, [toastMsg]);

  const api: AppApi = useMemo(
    () => ({
      ...s,
      set,
      openWallet,
      closeWallet,
      connect,
      disconnect,
      setBuyMethod,
      setPay,
      setPayAmount,
      setQuick,
      maxPay,
      setCardCur,
      onCardNumber,
      onCardExp,
      onCardCvc,
      onCardName,
      setProvider,
      closeProvider,
      buy,
      confirmProvider,
      setFrom,
      setFromAmount,
      flipSwap,
      setSlip,
      maxFrom,
      swap,
      closeSuccess,
      downloadReceipt,
      toastMsg,
    }),
    [s, set, openWallet, closeWallet, connect, disconnect, setBuyMethod, setPay, setPayAmount, setQuick, maxPay, setCardCur, onCardNumber, onCardExp, onCardCvc, onCardName, setProvider, closeProvider, buy, confirmProvider, setFrom, setFromAmount, flipSwap, setSlip, maxFrom, swap, closeSuccess, downloadReceipt, toastMsg]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
