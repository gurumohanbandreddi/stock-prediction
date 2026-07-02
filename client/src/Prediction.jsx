import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import TodayStockCard from "./TodayStockCard";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const QUICK_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "TSLA", "AMZN",
  "NVDA", "META"
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  speed: Math.random() * 20 + 12,
  delay: Math.random() * 8,
}));

/* ── Fake stock info fetcher (replace with real API if available) ── */
async function fetchStockInfo(ticker) {
  // Calls your backend for current info
  // If your backend /api/stock-info endpoint exists, use it.
  // We also try a Yahoo Finance scrape via your proxy.
  try {
    const res = await fetch("http://localhost:3001/api/stock-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
    });
    if (res.ok) return await res.json();
  } catch (_) { }

  // Fallback: generate plausible placeholder from forecast
  return null;
}

export default function Prediction({ initialTicker = "AAPL", onBack }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [inputTicker, setInputTicker] = useState("");
  const [forecast, setForecast] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hoveredTicker, setHoveredTicker] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchForecast();
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const fetchForecast = async () => {
    setLoading(true);
    setForecast(null);
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:3001/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, days: 7 }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg("Ticker not found. Please try a valid symbol.");
      } else {
        setForecast(data);
      }
    } catch (e) {
      setErrorMsg("Cannot reach server. Check your connection.");
      console.error(e);
    }
    setLoading(false);
  };

  const fetchInfo = async () => {
    setInfoLoading(true);
    setStockInfo(null);
    const info = await fetchStockInfo(ticker);
    setStockInfo(info);
    setInfoLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setTicker(inputTicker.trim().toUpperCase());
      setInputTicker("");
    }
  };

  /* ── Chart trend ── */
  const trend =
    forecast && forecast.forecast.length >= 2
      ? forecast.forecast[forecast.forecast.length - 1] - forecast.forecast[0]
      : 0;
  const isUp = trend >= 0;

  /* ── Derived info fallbacks from forecast ── */
  const firstPrice = forecast?.forecast?.[0];
  const lastPrice = forecast?.forecast?.[forecast.forecast.length - 1];
  const pctChange =
    firstPrice && lastPrice
      ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)
      : null;

  const chartData = forecast
    ? {
      labels: forecast.dates,
      datasets: [
        {
          label: `${ticker} 7-Day Forecast`,
          data: forecast.forecast,
          fill: true,
          borderColor: isUp ? "#22c55e" : "#ef4444",
          backgroundColor: isUp
            ? "rgba(34,197,94,0.08)"
            : "rgba(239,68,68,0.08)",
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: isUp ? "#22c55e" : "#ef4444",
          pointBorderColor: "#0d0f1a",
          pointBorderWidth: 2,
          tension: 0.45,
          borderWidth: 2.5,
        },
      ],
    }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111422",
        borderColor: "rgba(124,58,237,0.3)",
        borderWidth: 1,
        titleColor: "#a855f7",
        bodyColor: "#e2e8f0",
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (v) => `$${v.toFixed(0)}`,
        },
      },
    },
  };

  return (
    <div style={S.root} className={mounted ? "mounted" : ""}>
      <style>{predictionCSS}</style>

      {/* Particle bg */}
      <div style={S.particleBg} aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.speed}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div style={S.gridOverlay} aria-hidden="true" />

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <button style={S.backBtn} onClick={onBack} className="backBtn">
          ← Back
        </button>
        <div style={S.navBrand}>
          <span style={S.logoMark}>◈</span>
          <span style={S.logoText}>StockOracle</span>
        </div>
        <div style={S.navRight}>
          <span style={S.navHint}>Forecast Dashboard</span>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={S.main}>
        {/* Left sidebar */}
        <aside style={S.sidebar}>
          {/* Search */}
          <form onSubmit={handleSubmit} style={S.sideSearch}>
            <input
              type="text"
              placeholder="Search ticker…"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
              style={S.sideInput}
            />
            <button type="submit" style={S.sideBtn} className="glowBtn">
              Go
            </button>
          </form>

          {/* Quick picks */}
          <div style={S.sideSection}>
            <p style={S.sideSectionLabel}>Quick Picks</p>
            <div style={S.quickList}>
              {QUICK_TICKERS.map((t) => (
                <button
                  key={t}
                  style={{
                    ...S.quickItem,
                    ...(ticker === t ? S.quickItemActive : {}),
                    ...(hoveredTicker === t && ticker !== t
                      ? S.quickItemHover
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredTicker(t)}
                  onMouseLeave={() => setHoveredTicker(null)}
                  onClick={() => setTicker(t)}
                >
                  <span style={S.quickItemLabel}>{t}</span>
                  {ticker === t && (
                    <span style={S.quickItemActive_dot}>●</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stock info panel */}
          <div style={S.infoPanel}>
            <p style={S.sideSectionLabel}>Stock Info</p>
            {infoLoading && (
              <p style={S.infoFetching}>Fetching data…</p>
            )}
            {!infoLoading && stockInfo && (
              <div style={S.infoGrid}>
                {Object.entries(stockInfo).map(([k, v]) => (
                  <div key={k} style={S.infoRow}>
                    <span style={S.infoKey}>{k}</span>
                    <span style={S.infoVal}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {!infoLoading && !stockInfo && forecast && (
              <div style={S.infoGrid}>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>Symbol</span>
                  <span style={S.infoVal}>{ticker}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>Forecast Start</span>
                  <span style={S.infoVal}>{firstPrice ? `$${firstPrice.toFixed(2)}` : "—"}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>Forecast End</span>
                  <span style={S.infoVal}>{lastPrice ? `$${lastPrice.toFixed(2)}` : "—"}</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>7-Day Change</span>
                  <span
                    style={{
                      ...S.infoVal,
                      color: isUp ? "#22c55e" : "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    {pctChange !== null
                      ? `${isUp ? "+" : ""}${pctChange}%`
                      : "—"}
                  </span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>Trend</span>
                  <span
                    style={{
                      ...S.infoVal,
                      color: isUp ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {isUp ? "▲ Bullish" : "▼ Bearish"}
                  </span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoKey}>Window</span>
                  <span style={S.infoVal}>7 Days</span>
                </div>
              </div>
            )}
            {!infoLoading && !stockInfo && !forecast && (
              <p style={S.infoFetching}>No data yet.</p>
            )}
          </div>
        </aside>

        {/* Chart area */}
        <section style={S.chartArea}>
          <div style={S.chartHeader}>
            <div>
              <div style={S.tickerBadge}>
                <span style={S.tickerBadgeDot} />
                {ticker}
              </div>
              <h1 style={S.chartTitle}>7-Day Price Forecast</h1>
            </div>
            {pctChange !== null && (
              <div
                style={{
                  ...S.changePill,
                  backgroundColor: isUp
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(239,68,68,0.12)",
                  border: `1px solid ${isUp ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: isUp ? "#22c55e" : "#ef4444",
                }}
              >
                {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
                {pctChange}%
              </div>
            )}
          </div>

          {/* Price row */}
          {forecast && (
            <div style={S.priceRow}>
              <span style={S.priceLabel}>Start</span>
              <span style={S.priceVal}>${firstPrice?.toFixed(2)}</span>
              <span style={S.priceSep}>→</span>
              <span style={S.priceLabel}>End (Day 7)</span>
              <span
                style={{
                  ...S.priceVal,
                  color: isUp ? "#22c55e" : "#ef4444",
                }}
              >
                ${lastPrice?.toFixed(2)}
              </span>
            </div>
          )}

          {/* Chart */}
          <div style={S.chartBox}>
            {loading && (
              <div style={S.loadingOverlay}>
                <div style={S.spinner} className="spinner" />
                <p style={S.loadingText}>Running AI model for {ticker}…</p>
              </div>
            )}
            {errorMsg && !loading && (
              <div style={S.errorBox}>
                <span style={S.errorIcon}>⚠</span>
                <p style={S.errorText}>{errorMsg}</p>
              </div>
            )}
            {!loading && !errorMsg && chartData && (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Mini date strip */}
          {forecast && !loading && (
            <div style={S.dateStrip}>
              {forecast.dates.map((d, i) => (
                <div key={i} style={S.dateChip}>
                  <span style={S.dateDay}>
                    {new Date(d).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span style={S.dateNum}>
                    {new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span
                    style={{
                      ...S.datePrice,
                      color:
                        i === 0
                          ? "#a855f7"
                          : forecast.forecast[i] > forecast.forecast[i - 1]
                            ? "#22c55e"
                            : "#ef4444",
                    }}
                  >
                    ${forecast.forecast[i].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p style={S.disclaimer}>
            ⚠ AI forecasts are for informational purposes only. Not financial advice.
          </p>
        </section>

        {/* Right Sidebar */}
        <aside style={S.rightSidebar}>
          <TodayStockCard
            key={ticker}
            ticker={ticker}
            initialPrice={firstPrice || 13266.20}
            initialChange={pctChange ? (firstPrice * (parseFloat(pctChange) / 100)) : -77.60}
          />
        </aside>
      </main>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */

const C = {
  bg: "#06070d",
  surface: "#0d0f1a",
  card: "#111422",
  border: "rgba(106,50,200,0.2)",
  accent: "#7c3aed",
  accentBright: "#a855f7",
  text: "#e2e8f0",
  muted: "#64748b",
  faint: "rgba(255,255,255,0.04)",
};

const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    backgroundColor: C.bg,
    color: C.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    position: "relative",
  },
  particleBg: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  gridOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: "rgba(6,7,13,0.85)",
    backdropFilter: "blur(16px)",
  },
  backBtn: {
    background: "transparent",
    border: `1px solid ${C.border}`,
    color: C.muted,
    borderRadius: "8px",
    padding: "0.45rem 1rem",
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
    minWidth: 100,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoMark: {
    color: C.accentBright,
    fontSize: "1.3rem",
  },
  logoText: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: C.text,
    letterSpacing: "-0.02em",
  },
  navRight: {
    minWidth: 100,
    display: "flex",
    justifyContent: "flex-end",
  },
  navHint: {
    fontSize: "0.75rem",
    color: C.muted,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  main: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
    gap: "0",
  },
  sidebar: {
    width: 240,
    minWidth: 240,
    borderRight: `1px solid ${C.border}`,
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    backgroundColor: "rgba(13,15,26,0.5)",
  },
  rightSidebar: {
    width: 360,
    minWidth: 360,
    borderLeft: `1px solid ${C.border}`,
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "rgba(13,15,26,0.5)",
  },
  sideSearch: {
    display: "flex",
    gap: "0.4rem",
  },
  sideInput: {
    flex: 1,
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    color: C.text,
    padding: "0.55rem 0.7rem",
    fontSize: "0.85rem",
    outline: "none",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.05em",
  },
  sideBtn: {
    backgroundColor: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.55rem 0.8rem",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  sideSectionLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: "0.3rem",
  },
  quickList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    maxHeight: "35vh",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  quickItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    border: `1px solid transparent`,
    borderRadius: "8px",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "'DM Mono', monospace",
  },
  quickItemActive: {
    backgroundColor: "rgba(124,58,237,0.15)",
    border: `1px solid rgba(124,58,237,0.35)`,
  },
  quickItemHover: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
  },
  quickItemLabel: {
    fontSize: "0.88rem",
    fontWeight: 600,
    color: C.text,
    letterSpacing: "0.04em",
  },
  quickItemActive_dot: {
    color: C.accentBright,
    fontSize: "0.5rem",
  },
  infoPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: 1,
  },
  infoFetching: {
    color: C.muted,
    fontSize: "0.8rem",
    fontStyle: "italic",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0.7rem",
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
  },
  infoKey: {
    fontSize: "0.75rem",
    color: C.muted,
    fontWeight: 500,
  },
  infoVal: {
    fontSize: "0.8rem",
    color: C.text,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
  },
  chartArea: {
    flex: 1,
    padding: "2rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  chartHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  tickerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "rgba(124,58,237,0.12)",
    border: `1px solid rgba(124,58,237,0.3)`,
    color: C.accentBright,
    borderRadius: "9999px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    fontFamily: "'DM Mono', monospace",
    marginBottom: "0.5rem",
  },
  tickerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: C.accentBright,
    display: "inline-block",
    boxShadow: `0 0 6px ${C.accentBright}`,
    animation: "pulse 2s infinite",
  },
  chartTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  changePill: {
    borderRadius: "9999px",
    padding: "0.5rem 1.2rem",
    fontSize: "1rem",
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.04em",
    alignSelf: "flex-start",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  priceLabel: {
    fontSize: "0.75rem",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  priceVal: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "1.5rem",
    color: "#fff",
    fontWeight: 700,
  },
  priceSep: {
    color: C.muted,
    fontSize: "1rem",
    margin: "0 0.2rem",
  },
  chartBox: {
    flex: 1,
    minHeight: 300,
    maxHeight: 400,
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "1.5rem",
    position: "relative",
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    backgroundColor: C.card,
    borderRadius: "16px",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(124,58,237,0.2)",
    borderTop: `3px solid ${C.accentBright}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: C.muted,
    fontSize: "0.9rem",
    letterSpacing: "0.02em",
  },
  errorBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "0.8rem",
  },
  errorIcon: {
    fontSize: "2rem",
    color: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
  },
  dateStrip: {
    display: "flex",
    gap: "0.5rem",
    overflowX: "auto",
    paddingBottom: "0.3rem",
  },
  dateChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    padding: "0.6rem 0.8rem",
    minWidth: 70,
    flex: "0 0 auto",
  },
  dateDay: {
    fontSize: "0.68rem",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  dateNum: {
    fontSize: "0.72rem",
    color: C.muted,
  },
  datePrice: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  disclaimer: {
    fontSize: "0.75rem",
    color: C.muted,
    textAlign: "center",
    paddingBottom: "0.5rem",
  },
};

const predictionCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06070d; }

  .particle {
    position: absolute;
    background: rgba(168, 85, 247, 0.4);
    border-radius: 50%;
    animation: floatUp linear infinite;
    box-shadow: 0 0 5px rgba(168,85,247,0.35);
  }

  @keyframes floatUp {
    0%   { transform: translateY(0px) scale(1); opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.4; }
    100% { transform: translateY(-90vh) scale(0.4); opacity: 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.4); }
  }

  .backBtn:hover {
    background: rgba(124,58,237,0.1) !important;
    border-color: rgba(124,58,237,0.4) !important;
    color: #a855f7 !important;
  }

  .glowBtn:hover {
    background: #9333ea !important;
    box-shadow: 0 0 16px rgba(124,58,237,0.5) !important;
  }

  input::placeholder { color: #475569; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }
`;
