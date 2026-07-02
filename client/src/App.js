import React, { useState, useEffect } from "react";
import Prediction from "./Prediction";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  speed: Math.random() * 18 + 10,
  delay: Math.random() * 6,
}));

const TICKERS_DEMO = ["AAPL", "TSLA", "MSFT", "AMZN", "NVDA", "GOOGL"];

const STATS = [
  { value: "98.4%", label: "Model Accuracy" },
  { value: "500+", label: "Stocks Tracked" },
  { value: "7-Day", label: "Forecast Window" },
  { value: "Real-Time", label: "Data Feed" },
];

const FEATURES = [
  {
    icon: "◈",
    title: "AI-Powered Forecasts",
    desc: "Our deep learning models are trained on decades of OHLCV data, earnings reports, and macro indicators. Each forecast outputs a directional probability score alongside a predicted price range — not just a single line.",
  },
  {
    icon: "⬡",
    title: "Live Market Pulse",
    desc: "Real-time data feeds update every few seconds during market hours, capturing price action, volume spikes, and momentum shifts. Pre-market and after-hours data is included so you're never caught off guard by a gap open.",
  },
  {
    icon: "◉",
    title: "Portfolio Intelligence",
    desc: "Analyze any U.S.-listed ticker in seconds. Get a full 7-day price trajectory complete with upper and lower confidence bands, trend strength score, and a plain-English signal summary — bullish, bearish, or neutral.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Enter a ticker",
    desc: "Type any U.S.-listed stock symbol into the search bar — or pick one of the quick-access chips below it. No account or sign-up required.",
  },
  {
    num: "02",
    title: "Model runs in seconds",
    desc: "Our ensemble of LSTM and transformer models ingests the latest price history, volume profile, and sentiment signals to generate your forecast on the fly.",
  },
  {
    num: "03",
    title: "Read your 7-day outlook",
    desc: "Receive a day-by-day price trajectory with confidence intervals, a momentum indicator, and a plain-English summary of the dominant trend drivers.",
  },
];

const ASSET_CLASSES = [
  { icon: "▣", label: "Large-Cap Equities", example: "AAPL · MSFT · GOOGL" },
  { icon: "▣", label: "Growth & Tech", example: "NVDA · META · TSLA" },
  { icon: "▣", label: "ETFs & Index Funds", example: "SPY · QQQ · IWM" },
  { icon: "▣", label: "Mid & Small Cap", example: "CRWD · DKNG · RIVN" },
];

const TESTIMONIALS = [
  {
    quote: "StockOracle flagged the NVDA breakout three days before it happened. I've never had an edge like this.",
    name: "Jordan M.",
    role: "Swing Trader, 6 yrs experience",
  },
  {
    quote: "The confidence bands are what got me. It doesn't pretend to be certain — it gives me a range I can actually size a position around.",
    name: "Priya K.",
    role: "Options Trader",
  },
  {
    quote: "I run a small fund and this is the first retail tool I've seen that outputs something resembling institutional-quality signal.",
    name: "Rafael S.",
    role: "Independent Fund Manager",
  },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [tickerForPrediction, setTickerForPrediction] = useState("AAPL");
  const [inputTicker, setInputTicker] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hoveredTicker, setHoveredTicker] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToPredict = (ticker) => {
    setTickerForPrediction(ticker.toUpperCase());
    setPage("prediction");
  };

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (inputTicker.trim()) goToPredict(inputTicker.trim());
  };

  if (page === "prediction") {
    return (
      <Prediction
        initialTicker={tickerForPrediction}
        onBack={() => setPage("home")}
      />
    );
  }

  return (
    <div style={styles.root}>
      <style>{globalCSS}</style>

      {/* Particle Background */}
      <div style={styles.particleContainer} aria-hidden="true">
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

      {/* Grid overlay */}
      <div style={styles.gridOverlay} aria-hidden="true" />

      {/* NAV */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navLogo}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>StockOracle</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#how-it-works" style={styles.navLink}>How It Works</a>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#stats" style={styles.navLink}>Performance</a>
          <button style={styles.navCta} className="glowBtn" onClick={() => setPage("prediction")}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div className="fadeUp" style={styles.heroBadge}>
          <span style={styles.badgeDot} />
          AI-Powered Stock Intelligence
        </div>
        <h1 className="fadeUp" style={{ ...styles.heroTitle, animationDelay: "0.1s" }}>
          <span>Predict Tomorrow's</span>
          <span style={styles.heroAccent}> Markets</span>
          <span> Today.</span>
        </h1>
        <p className="fadeUp" style={{ ...styles.heroSub, animationDelay: "0.2s" }}>
          Harness deep learning forecasts for any stock ticker —{" "}
          <br />
          7-day price trajectories, confidence intervals, and real-time signals.
        </p>

        {/* Hero micro-trust line */}
        <p className="fadeUp" style={{ ...styles.heroMicro, animationDelay: "0.25s" }}>
          No account needed · Works on 500+ U.S.-listed stocks · Updates every market session
        </p>

        {/* Search */}
        <form onSubmit={handleHeroSubmit} className="fadeUp" style={{ ...styles.heroForm, animationDelay: "0.3s" }}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Enter ticker symbol — AAPL, TSLA, NVDA…"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn} className="glowBtn">
              Forecast Now
            </button>
          </div>
        </form>

        {/* Quick tickers */}
        <div className="fadeUp" style={{ ...styles.quickTickers, animationDelay: "0.4s" }}>
          <span style={styles.quickLabel}>Try it now →</span>
          {TICKERS_DEMO.map((t) => (
            <button
              key={t}
              style={{
                ...styles.quickChip,
                ...(hoveredTicker === t ? styles.quickChipHover : {}),
              }}
              onMouseEnter={() => setHoveredTicker(t)}
              onMouseLeave={() => setHoveredTicker(null)}
              onClick={() => goToPredict(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section id="stats" style={styles.statsSection}>
        <p style={styles.statsEyebrow}>Trusted by independent traders and small funds worldwide</p>
        <div style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <div key={i} style={styles.statCard} className="statCard">
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={styles.howSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>◈ Process</span>
          <h2 style={styles.sectionTitle}>From ticker to forecast in seconds</h2>
          <p style={styles.sectionSub}>
            Three steps. No configuration. No waiting for a report to email you.
          </p>
        </div>
        <div style={styles.stepsGrid}>
          {STEPS.map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <span style={styles.stepNum}>{s.num}</span>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>◈ Capabilities</span>
          <h2 style={styles.sectionTitle}>Built for Serious Traders</h2>
          <p style={styles.sectionSub}>
            Every feature crafted to give you an edge in volatile markets.
          </p>
        </div>
        <div style={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={styles.featureCard} className="featureCard">
              <span style={styles.featureIcon}>{f.icon}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED ASSETS */}
      <section style={styles.assetsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>◈ Coverage</span>
          <h2 style={styles.sectionTitle}>What You Can Forecast</h2>
          <p style={styles.sectionSub}>
            StockOracle covers U.S.-listed equities and ETFs across all major market-cap tiers.
          </p>
        </div>
        <div style={styles.assetsGrid}>
          {ASSET_CLASSES.map((a, i) => (
            <div key={i} style={styles.assetCard}>
              <span style={styles.assetIcon}>{a.icon}</span>
              <span style={styles.assetLabel}>{a.label}</span>
              <span style={styles.assetExample}>{a.example}</span>
            </div>
          ))}
        </div>
        <p style={styles.assetNote}>
          International ADRs and crypto-adjacent ETFs (BITO, GBTC) are also supported. Full coverage list available in the app.
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section style={styles.testimonialsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>◈ Traders Say</span>
          <h2 style={styles.sectionTitle}>Real Feedback from Real Traders</h2>
        </div>
        <div style={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={styles.testimonialCard}>
              <p style={styles.testimonialQuote}>"{t.quote}"</p>
              <div style={styles.testimonialMeta}>
                <span style={styles.testimonialName}>{t.name}</span>
                <span style={styles.testimonialRole}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to see the future?</h2>
          <p style={styles.ctaSub}>Pick a stock and get your 7-day AI forecast instantly.</p>
          <button style={styles.ctaBtn} className="glowBtn" onClick={() => setPage("prediction")}>
            Open Forecast Dashboard →
          </button>
          <p style={styles.ctaDisclaimer}>
            Free to use · No credit card · Results update each trading session
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.logoMark}>◈</span>
        <span style={styles.footerText}>
          StockOracle — For informational purposes only. Not financial advice. Past model performance does not guarantee future results.
        </span>
      </footer>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const C = {
  bg: "#06070d",
  surface: "#0d0f1a",
  card: "#111422",
  border: "rgba(106,50,200,0.2)",
  accent: "#7c3aed",
  accentBright: "#a855f7",
  accentGlow: "rgba(124,58,237,0.35)",
  gold: "#f59e0b",
  text: "#e2e8f0",
  muted: "#64748b",
  faint: "rgba(255,255,255,0.04)",
};

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    backgroundColor: C.bg,
    color: C.text,
    minHeight: "100vh",
    overflowX: "hidden",
    position: "relative",
  },
  particleContainer: {
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
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.2rem 3rem",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    backgroundColor: "rgba(6,7,13,0.92)",
    backdropFilter: "blur(16px)",
    borderBottom: `1px solid ${C.border}`,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoMark: {
    color: C.accentBright,
    fontSize: "1.4rem",
  },
  logoText: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: C.text,
    letterSpacing: "-0.02em",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  navLink: {
    color: C.muted,
    textDecoration: "none",
    fontSize: "0.9rem",
    letterSpacing: "0.02em",
    transition: "color 0.2s",
  },
  navCta: {
    backgroundColor: C.accent,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.55rem 1.2rem",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "all 0.2s",
  },
  hero: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "100vh",
    padding: "8rem 1.5rem 4rem",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(124,58,237,0.12)",
    border: `1px solid rgba(124,58,237,0.3)`,
    color: C.accentBright,
    borderRadius: "9999px",
    padding: "0.4rem 1rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "1.8rem",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: C.accentBright,
    boxShadow: `0 0 8px ${C.accentBright}`,
    animation: "pulse 2s infinite",
    display: "inline-block",
  },
  heroTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "clamp(3rem, 7vw, 6rem)",
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "1.4rem",
    color: "#fff",
  },
  heroAccent: {
    background: `linear-gradient(135deg, ${C.accentBright}, ${C.gold})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "1.1rem",
    color: C.muted,
    lineHeight: 1.7,
    maxWidth: 540,
    marginBottom: "0.8rem",
  },
  heroMicro: {
    fontSize: "0.8rem",
    color: C.muted,
    letterSpacing: "0.03em",
    marginBottom: "2rem",
    opacity: 0.7,
  },
  heroForm: {
    width: "100%",
    maxWidth: 580,
    marginBottom: "1.8rem",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "0.35rem 0.35rem 0.35rem 1.2rem",
    boxShadow: `0 0 40px rgba(124,58,237,0.15)`,
    gap: "0.5rem",
  },
  searchIcon: {
    fontSize: "1.3rem",
    color: C.muted,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: C.text,
    fontSize: "0.95rem",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.05em",
  },
  searchBtn: {
    backgroundColor: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.7rem 1.4rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  quickTickers: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: "0.78rem",
    color: C.muted,
    letterSpacing: "0.04em",
    marginRight: "0.2rem",
  },
  quickChip: {
    backgroundColor: C.faint,
    border: `1px solid ${C.border}`,
    color: C.muted,
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Mono', monospace",
  },
  quickChipHover: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: C.accentBright,
    color: C.accentBright,
  },
  statsSection: {
    position: "relative",
    zIndex: 1,
    padding: "4rem 2rem",
    borderTop: `1px solid ${C.border}`,
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: "rgba(13,15,26,0.6)",
    textAlign: "center",
  },
  statsEyebrow: {
    fontSize: "0.82rem",
    color: C.muted,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "2rem",
  },
  statsGrid: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.5rem",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    padding: "2rem 1rem",
    borderRadius: "12px",
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    transition: "transform 0.2s",
  },
  statValue: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "2.2rem",
    color: C.accentBright,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: "0.78rem",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  howSection: {
    position: "relative",
    zIndex: 1,
    padding: "6rem 2rem",
    maxWidth: 1100,
    margin: "0 auto",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  },
  stepCard: {
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "2rem 1.8rem",
  },
  stepNum: {
    display: "block",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.75rem",
    color: C.accentBright,
    letterSpacing: "0.12em",
    marginBottom: "1rem",
    opacity: 0.8,
  },
  stepTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "1.2rem",
    color: "#fff",
    marginBottom: "0.7rem",
    fontWeight: 600,
  },
  stepDesc: {
    color: C.muted,
    fontSize: "0.9rem",
    lineHeight: 1.65,
  },
  featuresSection: {
    position: "relative",
    zIndex: 1,
    padding: "6rem 2rem",
    maxWidth: 1100,
    margin: "0 auto",
    borderTop: `1px solid ${C.border}`,
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "3.5rem",
  },
  sectionTag: {
    display: "inline-block",
    color: C.accentBright,
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.8rem",
  },
  sectionTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "clamp(1.8rem, 4vw, 3rem)",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: "0.8rem",
  },
  sectionSub: {
    color: C.muted,
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  },
  featureCard: {
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "2rem 1.8rem",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  featureIcon: {
    fontSize: "1.8rem",
    color: C.accentBright,
    display: "block",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "1.2rem",
    color: "#fff",
    marginBottom: "0.7rem",
    fontWeight: 600,
  },
  featureDesc: {
    color: C.muted,
    fontSize: "0.9rem",
    lineHeight: 1.65,
  },
  assetsSection: {
    position: "relative",
    zIndex: 1,
    padding: "6rem 2rem",
    maxWidth: 1100,
    margin: "0 auto",
    borderTop: `1px solid ${C.border}`,
    textAlign: "center",
  },
  assetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.2rem",
    marginBottom: "1.5rem",
  },
  assetCard: {
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "1.6rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
  },
  assetIcon: {
    fontSize: "1.2rem",
    color: C.accentBright,
  },
  assetLabel: {
    fontSize: "0.9rem",
    color: C.text,
    fontWeight: 600,
    textAlign: "center",
  },
  assetExample: {
    fontSize: "0.75rem",
    color: C.muted,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
  assetNote: {
    fontSize: "0.82rem",
    color: C.muted,
    marginTop: "1rem",
    lineHeight: 1.6,
  },
  testimonialsSection: {
    position: "relative",
    zIndex: 1,
    padding: "6rem 2rem",
    maxWidth: 1100,
    margin: "0 auto",
    borderTop: `1px solid ${C.border}`,
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  },
  testimonialCard: {
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: "16px",
    padding: "2rem 1.8rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.5rem",
  },
  testimonialQuote: {
    color: C.text,
    fontSize: "0.92rem",
    lineHeight: 1.7,
    fontStyle: "italic",
  },
  testimonialMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  testimonialName: {
    fontSize: "0.88rem",
    color: C.accentBright,
    fontWeight: 600,
  },
  testimonialRole: {
    fontSize: "0.78rem",
    color: C.muted,
  },
  ctaBanner: {
    position: "relative",
    zIndex: 1,
    padding: "6rem 2rem",
    textAlign: "center",
    background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(13,15,26,0) 80%)`,
    borderTop: `1px solid ${C.border}`,
  },
  ctaInner: {
    maxWidth: 600,
    margin: "0 auto",
  },
  ctaTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "clamp(2rem, 4vw, 3rem)",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: "1rem",
  },
  ctaSub: {
    color: C.muted,
    fontSize: "1rem",
    marginBottom: "2rem",
  },
  ctaBtn: {
    backgroundColor: C.accent,
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "0.9rem 2.2rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "all 0.2s",
    display: "block",
    margin: "0 auto 1.2rem",
  },
  ctaDisclaimer: {
    fontSize: "0.78rem",
    color: C.muted,
    opacity: 0.7,
    letterSpacing: "0.03em",
  },
  footer: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "1.5rem",
    borderTop: `1px solid ${C.border}`,
  },
  footerText: {
    fontSize: "0.8rem",
    color: C.muted,
  },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #06070d; }

  .particle {
    position: absolute;
    background: rgba(168, 85, 247, 0.5);
    border-radius: 50%;
    animation: floatUp linear infinite;
    box-shadow: 0 0 6px rgba(168,85,247,0.4);
  }

  @keyframes floatUp {
    0%   { transform: translateY(0px) scale(1); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-80vh) scale(0.5); opacity: 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.4); }
  }

  .fadeUp {
    animation: fadeUp 0.7s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .glowBtn:hover {
    background: #9333ea !important;
    box-shadow: 0 0 24px rgba(124,58,237,0.6) !important;
    transform: translateY(-1px);
  }

  .statCard:hover {
    transform: translateY(-4px);
    border-color: rgba(124,58,237,0.5) !important;
  }

  .featureCard:hover {
    transform: translateY(-6px);
    border-color: rgba(124,58,237,0.4) !important;
    box-shadow: 0 12px 40px rgba(124,58,237,0.12);
  }

  input::placeholder { color: #475569; }
`;