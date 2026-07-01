"use client";

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import { fmtN } from "@/lib/format";
import { TOKEN_NAME, TOKEN_SUPPLY, TOKEN_SYMBOL } from "@/lib/brand";
import { bnbNetworkLabel } from "@/lib/bnb";
import { TOKEN_CONTRACT_DESCRIPTION, TOKEN_CONTRACT_TEMPLATE } from "@/lib/token/contract";
import type { DeployRecord, TokenStats } from "@/lib/token/types";

type Props = {
  stats: TokenStats | null;
  onDeployed: () => void;
};

function deployExplorerBase(d: DeployRecord): string {
  return d.explorer ?? (d.network === "mainnet" ? "https://bscscan.com" : "https://testnet.bscscan.com");
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function contractTemplate(d: DeployRecord): string {
  return d.contractTemplate ?? TOKEN_CONTRACT_TEMPLATE;
}

export default function TokenDeployPanel({ stats, onDeployed }: Props) {
  const [deployments, setDeployments] = useState<DeployRecord[]>([]);
  const [deployerOk, setDeployerOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [treasury, setTreasury] = useState("");
  const [initialMint, setInitialMint] = useState("0");
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/token/deploy", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando despliegues");
      setDeployments(data.deployments ?? []);
      setDeployerOk(!!data.deployerConfigured);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function fillCgoldExample() {
    setName(TOKEN_NAME);
    setSymbol(TOKEN_SYMBOL);
    setMaxSupply(String(TOKEN_SUPPLY));
    setInitialMint("0");
  }

  async function submitDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) {
      setError("Confirma que has revisado los parámetros del contrato");
      return;
    }
    setDeploying(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/token/deploy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          maxSupply,
          treasury: treasury.trim() || undefined,
          initialMint: initialMint.trim() || "0",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy fallido");
      const dep = data.deployment as DeployRecord;
      const base = deployExplorerBase(dep);
      setSuccess(
        `Token ${dep.symbol} (${dep.name}) desplegado · ${shortAddr(dep.address)} · ${bnbNetworkLabel(dep.network)}`
      );
      setConfirm(false);
      await load();
      onDeployed();
      window.open(`${base}/address/${dep.address}`, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy fallido");
    } finally {
      setDeploying(false);
    }
  }

  async function activate(id: string) {
    setError("");
    try {
      const res = await fetch("/api/token/deploy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo activar");
      await load();
      onDeployed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  const networkLabel = stats?.network === "mainnet" ? "BNB Mainnet" : "BNB Testnet";

  return (
    <div>
      {!deployerOk && (
        <div style={css("background:#161616;border:1px solid rgba(224,82,82,0.35);border-radius:14px;padding:16px 18px;margin-bottom:20px;font:400 14px var(--font-hanken);color:#ffb4b4")}>
          Configura{" "}
          <code style={css("font-family:var(--font-mono);color:#C9A227")}>TOKEN_DEPLOYER_PRIVATE_KEY</code> (o{" "}
          <code style={css("font-family:var(--font-mono);color:#C9A227")}>TOKEN_OWNER_PRIVATE_KEY</code>) en el servidor y asegúrate de tener tBNB para gas.
        </div>
      )}

      {stats?.addressSource === "env" && (
        <div style={css("background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.35);border-radius:14px;padding:16px 18px;margin-bottom:20px;font:400 14px var(--font-hanken);color:#E8D48B")}>
          La app usa la dirección de variables de entorno ({stats.contractAddress?.slice(0, 10)}…). Los despliegues del backoffice quedan registrados pero el env tiene prioridad.
        </div>
      )}

      <div data-2col style={css("display:grid;grid-template-columns:1.05fr 0.95fr;gap:24px;align-items:start;margin-bottom:28px")}>
        <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px")}>
          <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px;flex-wrap:wrap")}>
            <h2 style={css("font:600 18px var(--font-hanken);margin:0")}>Crear token on-chain</h2>
            <button
              type="button"
              onClick={fillCgoldExample}
              style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.12);color:#C9A227;border-radius:8px;padding:6px 12px;font:600 11px var(--font-hanken)")}
            >
              Ejemplo CGOLD
            </button>
          </div>
          <p style={css("font:400 13px var(--font-hanken);color:#9A9AA0;margin:0 0 8px")}>
            Elige <strong style={css("color:#C8C8CE")}>nombre y símbolo del token</strong> (visible en BscScan y wallets). Plantilla técnica:{" "}
            <code style={css("font-family:var(--font-mono);color:#C9A227;font-size:12px")}>{TOKEN_CONTRACT_TEMPLATE}</code>.
          </p>
          <p style={css("font:400 13px var(--font-hanken);color:#9A9AA0;margin:0 0 20px")}>
            Red activa: <strong style={css("color:#C8C8CE")}>{networkLabel}</strong> · el deployer será owner y podrá mintear después.
          </p>

          <form onSubmit={submitDeploy} style={css("display:flex;flex-direction:column;gap:14px")}>
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px")} data-admin-form>
              <label>
                <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Nombre del token</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={48}
                  placeholder="Ej. Mi Proyecto Gold"
                  style={css(inputStyle)}
                />
              </label>
              <label>
                <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Símbolo del token</span>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  required
                  maxLength={12}
                  placeholder="Ej. MPG"
                  style={css(inputStyle)}
                />
              </label>
            </div>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Cantidad máxima (tokens enteros)</span>
              <input
                value={maxSupply}
                onChange={(e) => setMaxSupply(e.target.value)}
                inputMode="numeric"
                required
                placeholder="Ej. 12000000000"
                style={css(inputStyle)}
              />
              <span style={css("font:400 11px var(--font-hanken);color:#6B6B76;margin-top:6px;display:block")}>Hard cap on-chain · 18 decimales</span>
            </label>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Treasury (wallet genesis)</span>
              <input value={treasury} onChange={(e) => setTreasury(e.target.value)} placeholder="0x… (vacío = wallet deployer)" style={css(inputMono)} />
            </label>

            <label>
              <span style={css("display:block;font:500 12px var(--font-hanken);color:#9A9AA0;margin-bottom:6px")}>Mint inicial al treasury</span>
              <input value={initialMint} onChange={(e) => setInitialMint(e.target.value)} inputMode="numeric" style={css(inputStyle)} />
              <span style={css("font:400 11px var(--font-hanken);color:#6B6B76;margin-top:6px;display:block")}>0 = todo minteable desde la pestaña Gestionar</span>
            </label>

            <label style={css("display:flex;align-items:flex-start;gap:10px;cursor:pointer")}>
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} style={css("margin-top:3px")} />
              <span style={css("font:400 13px/1.45 var(--font-hanken);color:#C8C8CE")}>
                Confirmo nombre, símbolo, supply y red. Entiendo que el deploy es irreversible on-chain.
              </span>
            </label>

            <button
              type="submit"
              disabled={deploying || !deployerOk}
              style={css(
                `appearance:none;cursor:${deploying || !deployerOk ? "not-allowed" : "pointer"};background:${deployerOk ? "#C9A227" : "#3A3010"};color:#0D0D0D;border:none;border-radius:10px;padding:14px 20px;font:600 15px var(--font-hanken);opacity:${deploying ? 0.7 : 1}`
              )}
            >
              {deploying ? "Desplegando contrato…" : "Desplegar en " + networkLabel}
            </button>
          </form>
        </div>

        <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px")}>
          <div style={css("font:600 14px var(--font-hanken);margin-bottom:12px")}>Vista previa</div>
          <div style={css("font:400 13px/1.7 var(--font-hanken);color:#C8C8CE")}>
            <div><span style={css("color:#8A8A94")}>Token on-chain</span> · {name || "—"} ({symbol || "—"})</div>
            <div><span style={css("color:#8A8A94")}>Plantilla</span> · {TOKEN_CONTRACT_TEMPLATE}</div>
            <div><span style={css("color:#8A8A94")}>Max supply</span> · {fmtN(Number(maxSupply.replace(/,/g, "")) || 0, 0)}</div>
            <div><span style={css("color:#8A8A94")}>Mint inicial</span> · {fmtN(Number(initialMint.replace(/,/g, "")) || 0, 0)}</div>
            <div><span style={css("color:#8A8A94")}>Red</span> · {networkLabel}</div>
            <div><span style={css("color:#8A8A94")}>Owner</span> · wallet deployer</div>
          </div>
          <div style={css("margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font:400 12px/1.5 var(--font-hanken);color:#6B6B76")}>
            {TOKEN_CONTRACT_DESCRIPTION}. Tras el deploy queda activo en este backoffice (salvo{" "}
            <code style={css("font-family:var(--font-mono);color:#9A7B0A")}>NEXT_PUBLIC_CGOLD_BNB_TESTNET</code> en env).
          </div>
        </div>
      </div>

      {error && (
        <div style={css("background:rgba(224,82,82,0.12);border:1px solid rgba(224,82,82,0.35);color:#ffb4b4;border-radius:12px;padding:14px 16px;margin-bottom:16px;font:500 14px var(--font-hanken)")}>
          {error}
        </div>
      )}
      {success && (
        <div style={css("background:rgba(38,161,123,0.12);border:1px solid rgba(38,161,123,0.35);color:#9dffd0;border-radius:12px;padding:14px 16px;margin-bottom:16px;font:500 14px var(--font-hanken)")}>
          {success}
        </div>
      )}

      <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden")}>
        <div style={css("padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);font:600 16px var(--font-hanken)")}>
          Contratos desplegados {loading && "…"}
        </div>
        {deployments.length === 0 ? (
          <p style={css("padding:20px;margin:0;color:#6B6B76;font:400 14px var(--font-hanken)")}>Aún no hay despliegues desde el backoffice.</p>
        ) : (
          <>
            <div data-admin-table-wrap data-table-wrap data-deploy-table>
              <table style={css("width:100%;border-collapse:collapse;font:400 13px var(--font-hanken);min-width:1180px")}>
                <thead>
                  <tr style={css("color:#9A9AA0;text-align:left")}>
                    <th style={css("padding:12px 16px;font-weight:500")}>Token</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Red</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Plantilla</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Contrato</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Explorador</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Supply</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Wallets</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Estado</th>
                    <th style={css("padding:12px 16px;font-weight:500")}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((d) => {
                    const base = deployExplorerBase(d);
                    return (
                      <tr key={d.id} style={css("border-top:1px solid rgba(255,255,255,0.06)")}>
                        <td style={css("padding:12px 16px")}>
                          <div style={css("font:600 14px;color:#fff")}>{d.symbol}</div>
                          <div style={css("font:400 12px;color:#9A9AA0")}>{d.name}</div>
                          <div style={css("font:400 10px;color:#6B6B76;font-family:var(--font-mono);margin-top:4px")}>{d.id}</div>
                        </td>
                        <td style={css("padding:12px 16px")}>
                          <div style={css("color:#C8C8CE")}>{bnbNetworkLabel(d.network)}</div>
                          <div style={css("font:400 11px;color:#6B6B76;font-family:var(--font-mono)")}>chain {d.chainId}</div>
                        </td>
                        <td style={css("padding:12px 16px;color:#C8C8CE;font-family:var(--font-mono);font-size:11px")}>{contractTemplate(d)}</td>
                        <td style={css("padding:12px 16px")}>
                          <ExplorerLink href={`${base}/address/${d.address}`}>{shortAddr(d.address)}</ExplorerLink>
                        </td>
                        <td style={css("padding:12px 16px")}>
                          <div style={css("display:flex;flex-direction:column;gap:4px;align-items:flex-start")}>
                            <ExplorerLink href={`${base}/address/${d.address}`}>Contrato</ExplorerLink>
                            <ExplorerLink href={`${base}/token/${d.address}`}>Token</ExplorerLink>
                            <ExplorerLink href={`${base}/tx/${d.txHash}`}>Tx deploy</ExplorerLink>
                          </div>
                        </td>
                        <td style={css("padding:12px 16px;color:#C8C8CE")}>
                          <div>{fmtN(Number(d.maxSupply), 0)} max</div>
                          <div style={css("font:400 11px;color:#9A9AA0")}>mint ini. {fmtN(Number(d.initialMint), 0)}</div>
                        </td>
                        <td style={css("padding:12px 16px")}>
                          <div style={css("font:400 11px;color:#9A9AA0;margin-bottom:4px")}>Owner</div>
                          <ExplorerLink href={`${base}/address/${d.deployer}`}>{shortAddr(d.deployer)}</ExplorerLink>
                          <div style={css("font:400 11px;color:#9A9AA0;margin:8px 0 4px")}>Treasury</div>
                          <ExplorerLink href={`${base}/address/${d.treasury}`}>{shortAddr(d.treasury)}</ExplorerLink>
                        </td>
                        <td style={css("padding:12px 16px")}>
                          {d.active ? (
                            <span style={css("font:600 11px var(--font-mono);color:#26A17B")}>ACTIVO</span>
                          ) : stats?.addressSource !== "env" ? (
                            <button type="button" onClick={() => activate(d.id)} style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#C9A227;border-radius:8px;padding:6px 10px;font:600 11px var(--font-hanken)")}>
                              Activar
                            </button>
                          ) : (
                            <span style={css("color:#6B6B76")}>—</span>
                          )}
                        </td>
                        <td style={css("padding:12px 16px;color:#9A9AA0;white-space:nowrap")}>{new Date(d.createdAt).toLocaleString("es-ES")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div data-deploy-cards style={css("display:none;flex-direction:column;gap:12px;padding:16px")}>
              {deployments.map((d) => {
                const base = deployExplorerBase(d);
                return (
                  <div key={d.id} style={css("border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;background:#121212")}>
                    <div style={css("display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px")}>
                      <div>
                        <div style={css("font:600 16px;color:#fff")}>{d.symbol} · {d.name}</div>
                        <div style={css("font:400 11px;color:#6B6B76;font-family:var(--font-mono);margin-top:4px")}>{d.id}</div>
                      </div>
                      {d.active ? (
                        <span style={css("font:600 11px var(--font-mono);color:#26A17B")}>ACTIVO</span>
                      ) : stats?.addressSource !== "env" ? (
                        <button type="button" onClick={() => activate(d.id)} style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#C9A227;border-radius:8px;padding:6px 10px;font:600 11px var(--font-hanken)")}>
                          Activar
                        </button>
                      ) : null}
                    </div>
                    <DeployMeta label="Red" value={`${bnbNetworkLabel(d.network)} · chain ${d.chainId}`} />
                    <DeployMeta label="Plantilla" value={contractTemplate(d)} mono />
                    <DeployMeta label="Contrato" value={<ExplorerLink href={`${base}/address/${d.address}`}>{d.address}</ExplorerLink>} />
                    <DeployMeta
                      label="Explorador"
                      value={
                        <span style={css("display:flex;flex-wrap:wrap;gap:8px")}>
                          <ExplorerLink href={`${base}/address/${d.address}`}>Contrato</ExplorerLink>
                          <ExplorerLink href={`${base}/token/${d.address}`}>Token</ExplorerLink>
                          <ExplorerLink href={`${base}/tx/${d.txHash}`}>Tx</ExplorerLink>
                        </span>
                      }
                    />
                    <DeployMeta label="Supply" value={`${fmtN(Number(d.maxSupply), 0)} max · mint ini. ${fmtN(Number(d.initialMint), 0)}`} />
                    <DeployMeta label="Owner" value={<ExplorerLink href={`${base}/address/${d.deployer}`}>{shortAddr(d.deployer)}</ExplorerLink>} />
                    <DeployMeta label="Treasury" value={<ExplorerLink href={`${base}/address/${d.treasury}`}>{shortAddr(d.treasury)}</ExplorerLink>} />
                    <DeployMeta label="Fecha" value={new Date(d.createdAt).toLocaleString("es-ES")} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExplorerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={css(linkStyle)}>
      {children}
    </a>
  );
}

function DeployMeta({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={css("margin-bottom:10px")}>
      <div style={css("font:500 10px var(--font-hanken);color:#6B6B76;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px")}>{label}</div>
      <div style={css(`font:400 13px var(--font-hanken);color:#C8C8CE;${mono ? "font-family:var(--font-mono);font-size:11px" : ""}`)}>{value}</div>
    </div>
  );
}

const inputStyle = "width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 14px var(--font-hanken);color:#fff";
const inputMono = inputStyle + ";font-family:var(--font-mono);font-size:13px";
const linkStyle = "color:#C9A227;text-decoration:none;font-family:var(--font-mono);font-size:11px";
