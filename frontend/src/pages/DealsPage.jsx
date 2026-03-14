import { useState, useEffect, useRef } from "react";
import {
  MdFastfood,
  MdLunchDining,
  MdLocalDrink,
  MdAssignment,
  MdCheckCircle,
  MdRestaurant,
  MdNotificationsActive,
  MdDeliveryDining,
  MdCelebration,
  MdTimer,
  MdHome,
  MdLocationOn,
  MdChat,
  MdCall,
  MdClose,
  MdCheck,
  MdPerson,
  MdStar,
  MdLayers,
  MdWhatshot,
  MdGroups,
  MdEco,
  MdAutoAwesome,
  MdLocalOffer,
  MdError,
  MdRocketLaunch,
  MdFileDownload,
  MdTrackChanges
} from "react-icons/md";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── Deal Data ──────────────────────────────────────────────────────── */
const DEAL_OF_DAY = {
  id: 0,
  image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop",
  name: "Mega Beef Blast",
  tagline: "Double wagyu smash · truffle fries · shake of your choice",
  oldPrice: 26.99,
  newPrice: 15.99,
  savePct: 41,
  expiresIn: 2 * 3600 + 14 * 60 + 36,
  highlight: true,
};

const DEALS = [
  { id: 1, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop", name: "Double Combo", desc: "2 Classic Burgers + 2 Truffle Fries + 2 Drinks", oldPrice: 29.98, newPrice: 19.99, savePct: 33, tag: "BESTSELLER", tagColor: "#F59E0B", code: null },
  { id: 2, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop", name: "Bacon BOGO", desc: "Buy 1 Bacon Overload, get the second FREE", oldPrice: 13.99, newPrice: 13.99, savePct: 50, tag: "BOGO", tagColor: "#EF4444", code: "BOGO50" },
  { id: 3, image: "https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop", name: "Family Pack", desc: "4 Burgers + 4 Sides + 4 Drinks — feed the whole crew", oldPrice: 64.99, newPrice: 44.99, savePct: 31, tag: "FAMILY", tagColor: "#22C55E", code: null },
  { id: 4, image: "https://images.unsplash.com/photo-1598150490541-04372ebbd360?q=80&w=800&auto=format&fit=crop", name: "Spice Night Duo", desc: "2 Nashville Hot + 2 Inferno BBQ + onion rings", oldPrice: 48.99, newPrice: 32.99, savePct: 33, tag: "SPICY", tagColor: "#EF4444", code: null },
  { id: 5, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop", name: "Green & Clean", desc: "2 Garden Plant-Based + 2 Sweet Potato Fries + 2 Smoothies", oldPrice: 35.97, newPrice: 24.99, savePct: 30, tag: "VEGAN", tagColor: "#22C55E", code: "GREEN30" },
  { id: 6, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop", name: "Shake Trio", desc: "3 premium milkshakes: Chocolate, Vanilla, Strawberry", oldPrice: 17.97, newPrice: 11.99, savePct: 33, tag: "SWEET", tagColor: "#A78BFA", code: null },
  { id: 7, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop", name: "Sides Fiesta", desc: "Truffle Fries + Onion Rings + Mac Bites + Churros", oldPrice: 24.96, newPrice: 16.99, savePct: 32, tag: "SIDES", tagColor: "#60A5FA", code: null },
  { id: 8, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=800&auto=format&fit=crop", name: "Luxury Night In", desc: "2 Truffle Royale + bottle of craft lemonade + brownie dessert", oldPrice: 47.98, newPrice: 34.99, savePct: 27, tag: "PREMIUM", tagColor: "#A78BFA", code: "LUXE27" },
];

const PROMOS = [
  { code: "FIRST20", discount: "20% OFF", desc: "Your entire first order", color: "#EF4444" },
  { code: "FREESHIP", discount: "FREE DELIVERY", desc: "No minimum this weekend only", color: "#22C55E" },
  { code: "HAPPY4PM", discount: "15% OFF", desc: "Happy hour: 4 PM – 7 PM daily", color: "#F59E0B" },
];

/* ─── Utility ────────────────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Countdown ─────────────────────────────────────────────────────── */
function useCountdown(initialSeconds) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return { h, m, s, expired: secs === 0 };
}

/* ─── Countdown Unit ─────────────────────────────────────────────────── */
const CountUnit = ({ val, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <div style={{
      background: "#1C1917",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 10,
      padding: "10px 18px",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(32px,5vw,52px)",
      color: "#F59E0B",
      letterSpacing: "0.04em",
      lineHeight: 1,
      minWidth: 72, textAlign: "center",
      boxShadow: "0 0 16px rgba(245,158,11,0.1)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(245,158,11,0.06) 0%,transparent 50%)", pointerEvents: "none" }} />
      {val}
    </div>
    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: "#44403C", textTransform: "uppercase" }}>{label}</span>
  </div>
);

const Sep = () => (
  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#3D3632", paddingBottom: 18, lineHeight: 1 }}>:</div>
);

/* ─── Savings Badge ──────────────────────────────────────────────────── */
const SaveBadge = ({ pct }) => (
  <div style={{
    position: "absolute", top: -10, right: 16,
    background: "linear-gradient(135deg,#EF4444,#DC2626)",
    color: "#fff",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20, letterSpacing: "0.04em",
    padding: "4px 12px", borderRadius: 999,
    boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
    zIndex: 2,
    transform: "rotate(2deg)",
  }}>
    -{pct}%
  </div>
);

/* ─── Promo Code Pill ────────────────────────────────────────────────── */
const PromoCode = ({ code, discount, desc, color }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      background: "#131110",
      border: `1px solid ${color}30`,
      borderRadius: 14,
      padding: "22px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      flexWrap: "wrap",
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{
          background: `${color}18`, border: `1px solid ${color}40`,
          borderRadius: 8, padding: "6px 12px", flexShrink: 0,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20, color, letterSpacing: "0.04em",
        }}>
          {discount}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: "#F5F5F4", letterSpacing: "0.04em" }}>{desc}</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E", marginTop: 2 }}>Use code at checkout</div>
        </div>
      </div>
      <button onClick={copy} style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase",
        background: copied ? "#22C55E18" : "rgba(255,255,255,0.05)",
        border: `1px dashed ${copied ? "#22C55E" : "rgba(255,255,255,0.2)"}`,
        color: copied ? "#22C55E" : "#A8A29E",
        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
        transition: "all 0.2s", whiteSpace: "nowrap",
      }}>
        {copied ? <MdCheck /> : code}
      </button>
    </div>
  );
};

/* ─── Deal Card ──────────────────────────────────────────────────────── */
const DealCard = ({ deal, delay }) => {
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const claim = () => {
    setClaimed(true);
    setTimeout(() => setClaimed(false), 2500);
  };

  const copyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const savings = deal.oldPrice - deal.newPrice;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#1C1917" : "#131110",
        border: `1px solid ${hover ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        overflow: "visible",
        position: "relative",
        opacity: inView ? 1 : 0,
        transform: inView ? (hover ? "translateY(-5px)" : "translateY(0)") : "translateY(28px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.28s ease, border-color 0.2s, background 0.2s`,
        boxShadow: hover ? "0 18px 40px rgba(0,0,0,0.5)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      <SaveBadge pct={deal.savePct} />

      {/* Image area */}
      <div style={{
        height: 150,
        background: hover
          ? "linear-gradient(135deg,#2A1800,#1C1209)"
          : "linear-gradient(135deg,#18120A,#0E0B08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "14px 14px 0 0",
        transition: "background 0.3s",
        position: "relative",
      }}>
        <img 
          src={deal.image}
          alt={deal.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hover ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.5s ease",
            filter: "brightness(0.8)",
          }}
        />
        {deal.tag && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: deal.tagColor,
            color: ["#22C55E", "#F59E0B"].includes(deal.tagColor) ? "#1C1917" : "#fff",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 9, letterSpacing: "0.18em",
            padding: "3px 9px", borderRadius: 999, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 4
          }}>
            {deal.tag === "SPICY" && <MdWhatshot size={10} />} {deal.tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1.1 }}>
          {deal.name}
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#6B6560", lineHeight: 1.55, flex: 1 }}>
          {deal.desc}
        </p>

        {/* Prices */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#3D3632", textDecoration: "line-through" }}>
            ${deal.oldPrice.toFixed(2)}
          </span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F59E0B", letterSpacing: "0.02em", lineHeight: 1 }}>
            ${deal.newPrice.toFixed(2)}
          </span>
          {deal.id !== 2 && (
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#22C55E", fontWeight: 700 }}>
              Save ${savings.toFixed(2)}
            </span>
          )}
          {deal.id === 2 && (
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#22C55E", fontWeight: 700 }}>
              +1 FREE
            </span>
          )}
        </div>

        {/* Code pill */}
        {deal.code && (
          <button onClick={(e) => copyCode(e, deal.code)} style={{
            background: codeCopied ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px dashed ${codeCopied ? "#22C55E" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 6, padding: "6px 10px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", transition: "all 0.15s",
          }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: codeCopied ? "#22C55E" : "#78716C" }}>
              {deal.code}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: "0.1em", color: codeCopied ? "#22C55E" : "#44403C", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              {codeCopied ? <><MdCheck /> copied</> : "tap to copy"}
            </span>
          </button>
        )}

        {/* CTA */}
        <button onClick={claim} style={{
          background: claimed
            ? "#22C55E"
            : "linear-gradient(135deg,#F59E0B,#D97706)",
          color: "#1C1917", border: "none", cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "11px", borderRadius: 10,
          transition: "all 0.2s",
          transform: claimed ? "scale(0.97)" : "scale(1)",
          marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          {claimed ? <><MdCheck /> DEAL CLAIMED!</> : <><MdFileDownload /> Claim Deal</>}
        </button>
      </div>
    </div>
  );
};

/* ─── Deal of the Day Hero ───────────────────────────────────────────── */
const DealHero = ({ deal, countdown }) => {
  const [claimed, setClaimed] = useState(false);
  return (
    <div style={{
      background: "linear-gradient(135deg,#2A1400 0%,#1C0E00 50%,#0F0A05 100%)",
      border: "1px solid rgba(245,158,11,0.25)",
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 0 60px rgba(245,158,11,0.08)",
    }}>
      {/* Bg radial */}
      <div style={{ position: "absolute", top: "50%", left: "40%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.12),transparent 70%)", pointerEvents: "none" }} />

      {/* Ribbon */}
      <div style={{
        position: "absolute", top: 24, left: -36,
        background: "linear-gradient(135deg,#EF4444,#DC2626)",
        color: "#fff",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 15, letterSpacing: "0.15em",
        padding: "6px 52px",
        transform: "rotate(-45deg)",
        boxShadow: "0 2px 12px rgba(239,68,68,0.5)",
      }}>
        -{deal.savePct}% OFF
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
        {/* Icon panel */}
        <div style={{
          width: "45%", height: 320, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0C0A09",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          position: "relative", overflow: "hidden"
        }}>
          <img 
            src={deal.image} 
            alt={deal.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              animation: "floatBurger 6s ease-in-out infinite",
              filter: "brightness(0.9)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, rgba(15,10,5,1) 100%)" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "36px 40px", minWidth: 280 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#EF4444",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            padding: "4px 14px", borderRadius: 999, marginBottom: 14,
          }}>
            <MdWhatshot size={14} /> Deal of the Day
          </div>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px,5vw,56px)",
            color: "#F5F5F4", letterSpacing: "0.03em", lineHeight: 0.95,
            marginBottom: 10,
          }}>
            {deal.name}
          </h2>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#78716C", marginBottom: 20, lineHeight: 1.6 }}>
            {deal.tagline}
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 28 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, color: "#44403C", textDecoration: "line-through" }}>
              ${deal.oldPrice.toFixed(2)}
            </span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(40px,5vw,60px)",
              color: "#F59E0B", letterSpacing: "0.02em", lineHeight: 1,
            }}>
              ${deal.newPrice.toFixed(2)}
            </span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 14,
              color: "#22C55E",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              padding: "3px 10px", borderRadius: 999,
            }}>
              Save ${(deal.oldPrice - deal.newPrice).toFixed(2)}
            </span>
          </div>

          {/* Countdown */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", color: "#57534E", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <MdTimer size={14} /> Offer expires in
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <CountUnit val={countdown.h} label="Hours" />
              <Sep />
              <CountUnit val={countdown.m} label="Mins" />
              <Sep />
              <CountUnit val={countdown.s} label="Secs" />
            </div>
          </div>

          <button onClick={() => setClaimed(c => !c)} style={{
            background: claimed ? "#22C55E" : "linear-gradient(135deg,#F59E0B,#D97706)",
            color: "#1C1917", border: "none", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "15px 38px", borderRadius: 999,
            boxShadow: claimed ? "0 0 20px rgba(34,197,94,0.3)" : "0 0 30px rgba(245,158,11,0.35)",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10
          }}
            onMouseEnter={e => { if (!claimed) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 44px rgba(245,158,11,0.55)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = claimed ? "0 0 20px rgba(34,197,94,0.3)" : "0 0 30px rgba(245,158,11,0.35)"; }}
          >
            {claimed ? <><MdCheck /> Claimed — Check Cart</> : <><MdRocketLaunch size={22} /> Claim This Deal</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────────────────────────── */
const SectionHead = ({ eyebrow, title, inView, icon }) => (
  <div style={{
    textAlign: "center", marginBottom: 48,
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "translateY(16px)",
    transition: "all 0.5s ease",
  }}>
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {icon} {eyebrow}
    </div>
    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,60px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>{title}</h2>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function DealsPage() {
  const countdown = useCountdown(DEAL_OF_DAY.expiresIn);
  const [heroIn, setHeroIn] = useState(false);
  const [allDealsRef, allDealsInView] = useInView(0.05);
  const [promoRef, promoInView] = useInView(0.1);
  const [termsRef, termsInView] = useInView(0.3);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes floatBurger { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #3D3632; border-radius: 2px; }
        @media (max-width: 640px) {
          .deals-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .deals-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* ── Ticker ── */}
        <div style={{ background: "#EF4444", overflow: "hidden", height: 34, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", animation: "ticker 22s linear infinite", whiteSpace: "nowrap" }}>
            {Array(4).fill(null).map((_, i) => (
              <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", color: "#fff", paddingRight: 60, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <MdWhatshot /> UP TO 50% OFF TODAY &nbsp;·&nbsp; <MdDeliveryDining /> FREE DELIVERY OVER $20 &nbsp;·&nbsp; BACON BURGER BOGO &nbsp;·&nbsp; FAMILY PACK DEAL &nbsp;·&nbsp; CODE: FIRST20 FOR NEW CUSTOMERS &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ── Hero Banner ── */}
        <div style={{
          background: "linear-gradient(160deg,#1C0800 0%,#0C0A09 70%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "60px 40px 56px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 48px)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <div style={{
              display: "inline-block",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              padding: "4px 16px", borderRadius: 999, marginBottom: 18,
              opacity: heroIn ? 1 : 0, transition: "opacity 0.5s 0.1s",
            }}>
              Limited Time — Today Only
            </div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px,9vw,100px)",
              letterSpacing: "0.02em", color: "#F5F5F4", lineHeight: 0.92,
              marginBottom: 16,
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "none" : "translateY(20px)",
              transition: "all 0.6s 0.2s",
            }}>
              <MdWhatshot style={{ verticalAlign: "middle", marginBottom: 10, marginRight: 10 }} />
              Hot Deals.<br />
              <span style={{ color: "#F59E0B" }}>Massive Savings.</span>
            </h1>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "clamp(15px,2vw,18px)",
              color: "#78716C", maxWidth: 480, margin: "0 auto",
              opacity: heroIn ? 1 : 0,
              transition: "opacity 0.6s 0.4s",
            }}>
              Handpicked combos, BOGO offers, and daily specials — all ending at midnight.
            </p>

            {/* Deal count pills */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 28,
              opacity: heroIn ? 1 : 0, transition: "opacity 0.6s 0.5s",
            }}>
              {[["8", "Active Deals"], ["50%", "Max Discount"], ["$18", "Max Savings"], [<MdDeliveryDining size={16} />, "Free Delivery"]].map(([val, lbl]) => (
                <div key={lbl} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 999, padding: "8px 18px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#F59E0B", letterSpacing: "0.04em", display: "flex", alignItems: "center" }}>{val}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", color: "#57534E", textTransform: "uppercase" }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 80px", display: "flex", flexDirection: "column", gap: 72 }}>

          {/* ── Deal of the Day ── */}
          <section>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "#EF4444", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <MdTrackChanges /> Featured
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,60px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>
                Deal of the Day
              </h2>
            </div>
            <DealHero deal={DEAL_OF_DAY} countdown={countdown} />
          </section>

          {/* ── All Deals ── */}
          <section ref={allDealsRef}>
            <SectionHead eyebrow="All Offers" title="Amazing Deals" inView={allDealsInView} icon={<MdCelebration />} />
            <div className="deals-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
              {DEALS.map((deal, i) => (
                <DealCard key={deal.id} deal={deal} delay={i * 55} />
              ))}
            </div>
          </section>

          {/* ── Promo Codes ── */}
          <section ref={promoRef}>
            <SectionHead eyebrow="More Savings" title="Promo Codes" inView={promoInView} icon={<MdLocalOffer />} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROMOS.map(p => <PromoCode key={p.code} {...p} />)}
            </div>
          </section>

          {/* ── Urgency Strip ── */}
          <div style={{
            background: "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(245,158,11,0.06))",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 14,
            padding: "24px 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 20,
          }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#F5F5F4", letterSpacing: "0.03em", lineHeight: 1 }}>
                Don't let these deals slip away
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#78716C", marginTop: 4 }}>
                All deals reset at midnight · New offers drop daily at noon
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ animation: "pulse 1.5s ease-in-out infinite", width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", color: "#EF4444", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                <MdTimer /> {countdown.h}:{countdown.m}:{countdown.s} remaining
              </span>
            </div>
          </div>

          {/* ── Terms ── */}
          <div ref={termsRef} style={{
            background: "#0F0D0B",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12, padding: "24px 28px",
            opacity: termsInView ? 1 : 0,
            transition: "opacity 0.5s",
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#44403C", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <MdError /> Terms & Conditions
            </div>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#3D3632", lineHeight: 1.8 }}>
              All deals are valid for today only and subject to availability. BOGO offers apply to items of equal or lesser value.
              Promo codes cannot be combined with other offers unless stated. Prices shown exclude delivery fees and applicable taxes.
              BurgerHub reserves the right to modify or withdraw any offer without prior notice. Delivery area restrictions apply.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}