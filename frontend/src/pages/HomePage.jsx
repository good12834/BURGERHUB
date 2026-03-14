import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { 
  MdFastfood, 
  MdLunchDining, 
  MdWhatshot, 
  MdAutoAwesome, 
  MdAgriculture, 
  MdLocalDrink, 
  MdDeliveryDining, 
  MdTimer, 
  MdThermostat, 
  MdSmartphone, 
  MdShoppingCart, 
  MdCreditCard, 
  MdStar, 
  MdStarBorder,
  MdArrowForward,
  MdElectricBolt,
  MdCardGiftcard
} from "react-icons/md";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap"
    rel="stylesheet"
  />
);

/* ─── Mock Data ─────────────────────────────────────────────────────── */
const BURGERS = [
  { id: 1, name: "The OG Classic", price: 8.99, tag: "BESTSELLER", cal: 650, icon: <MdFastfood />, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop", desc: "Double smash, American cheese, pickles, special sauce" },
  { id: 2, name: "Inferno BBQ", price: 12.99, tag: "🔥 SPICY", cal: 820, icon: <MdWhatshot />, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop", desc: "Pepper jack, jalapeños, crispy onion strings, chipotle" },
  { id: 3, name: "Truffle Royale", price: 16.99, tag: "PREMIUM", cal: 740, icon: <MdAutoAwesome />, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop", desc: "Wagyu beef, truffle aioli, caramelized onions, arugula" },
  { id: 4, name: "Mushroom Swiss", price: 11.99, tag: "VEGETARIAN", cal: 580, icon: <MdLunchDining />, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=800&auto=format&fit=crop", desc: "Portobello, Swiss, garlic herb spread, lettuce" },
  { id: 5, name: "Bacon Overload", price: 13.99, tag: "FAN FAVE", cal: 910, icon: <MdFastfood />, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop", desc: "Triple bacon, cheddar, BBQ glaze, crispy shallots" },
  { id: 6, name: "The Garden", price: 10.99, tag: "PLANT-BASED", cal: 490, icon: <MdAgriculture />, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop", desc: "Beyond patty, avocado, sun-dried tomato, tahini" },
];

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1600&auto=format&fit=crop",
    title: "CRAFTED WITH",
    highlight: "PASSION.",
    desc: "Jerusalem's #1 Hand-Smashed Burgers.",
    tag: "SIGNATURE BLEND"
  },
  {
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1600&auto=format&fit=crop",
    title: "FEEL THE",
    highlight: "HEAT.",
    desc: "The Inferno BBQ is back for a limited time.",
    tag: "LTD EDITION"
  },
  {
    image: "https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=1600&auto=format&fit=crop",
    title: "BETTER",
    highlight: "TOGETHER.",
    desc: "Family combos that feed the whole crew.",
    tag: "COMBO DEALS"
  },
  {
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1600&auto=format&fit=crop",
    title: "ICE COLD",
    highlight: "REFRESH.",
    desc: "The perfect pairing for your favorite burger.",
    tag: "DRINK SPECIALS"
  }
];

const REVIEWS = [
  { name: "Marcus T.", stars: 5, text: "Hands down the best smash burger I've had outside of NYC. Obsessed.", location: "Tel Aviv" },
  { name: "Lena K.", stars: 5, text: "Arrived in 22 minutes, still sizzling. Insane quality for delivery.", location: "Jerusalem" },
  { name: "Omar S.", stars: 5, text: "The Truffle Royale is on another level. Worth every shekel.", location: "Haifa" },
];

/* ─── Utility hooks ─────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCounter(target, running, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!running) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [running, target, duration]);
  return val;
}

/* ─── Stars ─────────────────────────────────────────────────────────── */
const Stars = ({ n }) => (
  <span style={{ color: "#F59E0B", fontSize: 16, letterSpacing: 2, display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      i < n ? <MdStar key={i} /> : <MdStarBorder key={i} />
    ))}
  </span>
);

/* ─── Burger Card ────────────────────────────────────────────────────── */
const BurgerCard = ({ burger, delay }) => {
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const handleAdd = () => {
    addToCart({
      id: burger.id,
      name: burger.name,
      price: burger.price,
      image_url: burger.image
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#1C1917" : "#161210",
        border: `1px solid ${hover ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: inView
          ? hover ? "translateY(-6px)" : "translateY(0)"
          : "translateY(32px)",
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${delay}ms` : "0ms",
        boxShadow: hover ? "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.15)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Emoji / image area */}
      <div style={{
        height: 180,
        background: hover
          ? "linear-gradient(135deg,#2D1B00,#1C1209)"
          : "linear-gradient(135deg,#1C1209,#0F0A07)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        transition: "background 0.3s",
      }}>
        <img 
          src={burger.image}
          alt={burger.name}
          style={{
            width: "85%",
            height: "85%",
            objectFit: "contain",
            transform: hover ? "scale(1.1) rotate(-4deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.6))",
          }}
        />
        <span style={{
          position: "absolute", top: 14, left: 14,
          background: burger.tag.includes("SPICY") ? "#EF4444"
            : burger.tag === "PREMIUM" ? "#F59E0B"
              : burger.tag === "VEGETARIAN" || burger.tag === "PLANT-BASED" ? "#22C55E"
                : "#374151",
          color: "#fff",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: 10, letterSpacing: "0.15em",
          padding: "3px 10px", borderRadius: 999,
        }}>
          {burger.tag}
        </span>
        <span style={{
          position: "absolute", bottom: 10, right: 14,
          color: "#57534E", fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, letterSpacing: "0.05em",
        }}>
          {burger.cal} cal
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, color: "#F5F5F4", letterSpacing: "0.04em",
        }}>
          {burger.name}
        </div>
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 13, color: "#78716C", lineHeight: 1.5,
          flex: 1,
        }}>
          {burger.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, color: "#F59E0B", letterSpacing: "0.02em",
          }}>
            ${burger.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            style={{
              background: added ? "#22C55E" : "linear-gradient(135deg,#F59E0B,#D97706)",
              color: "#1C1917",
              border: "none", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 13, letterSpacing: "0.08em",
              padding: "9px 18px", borderRadius: 999,
              transition: "all 0.25s",
              transform: added ? "scale(0.97)" : "scale(1)",
            }}
          >
            {added ? "✓ ADDED" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Stats Counter ─────────────────────────────────────────────────── */
const Stat = ({ target, suffix, label, running }) => {
  const val = useCounter(target, running);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(48px,6vw,72px)",
        color: "#F59E0B",
        lineHeight: 1,
        letterSpacing: "0.02em",
      }}>
        {val.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600, fontSize: 13,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "#57534E", marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  );
};

/* ─── How It Works Step ─────────────────────────────────────────────── */
const Step = ({ num, icon, title, desc, delay, inView }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 16, textAlign: "center",
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.5s ease ${delay}ms`,
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(245,158,11,0.04))",
      border: "1px solid rgba(245,158,11,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, position: "relative",
    }}>
      {icon}
      <span style={{
        position: "absolute", top: -6, right: -6,
        width: 22, height: 22,
        background: "#F59E0B", borderRadius: "50%",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 13, color: "#1C1917",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{num}</span>
    </div>
    <div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: 17,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "#F5F5F4", marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: 14, color: "#78716C", lineHeight: 1.5,
        maxWidth: 200,
      }}>{desc}</div>
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function HomePage() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);
  const [howRef, howInView] = useInView(0.2);
  const [dealsRef, dealsInView] = useInView(0.2);
  const [reviewRef, reviewInView] = useInView(0.2);
  const [burgerWord, setBurgerWord] = useState(0);
  const words = ["JUICY.", "BOLD.", "FRESH.", "HOT."];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentSlide(s => (s + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const S = (style) => style; // passthrough for readability

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes wordFlip { 0%{opacity:0;transform:translateY(16px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-16px)} }
        @keyframes floatBurger { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(245,158,11,0.5)} 100%{box-shadow:0 0 0 20px rgba(245,158,11,0)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .deal-card:hover { transform: scale(1.02) !important; }
        .review-card:hover { border-color: rgba(245,158,11,0.3) !important; }
        @media (max-width:768px) {
          .hero-inner { flex-direction:column !important; }
          .hero-emoji { font-size:120px !important; }
          .stats-grid { grid-template-columns:1fr 1fr !important; }
          .steps-grid { grid-template-columns:1fr 1fr !important; }
          .burgers-grid { grid-template-columns:1fr !important; }
          .deals-grid { grid-template-columns:1fr !important; }
          .reviews-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", color: "#F5F5F4", minHeight: "100vh", fontFamily: "'Barlow', sans-serif", overflowX: "hidden" }}>

        {/* ── Ticker ── */}
        <div style={{ background: "#F59E0B", overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", animation: "ticker 18s linear infinite", whiteSpace: "nowrap" }}>
            {Array(4).fill(null).map((_, i) => (
              <span key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", color: "#1C1917", paddingRight: 60, display: "flex", alignItems: "center", gap: 10 }}>
                <MdFastfood size={16} /> FREE DELIVERY OVER $20 &nbsp;·&nbsp; 24/7 OPEN &nbsp;·&nbsp; FRESH DAILY &nbsp;·&nbsp; COMBO DEALS FROM $14.99 &nbsp;·&nbsp; NEW: TRUFFLE ROYALE &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ── HERO CAROUSEL ── */}
        <section style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "#000"
        }}>
          {/* Slides */}
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                inset: 0,
                opacity: idx === currentSlide ? 1 : 0,
                transition: "opacity 1.2s ease-in-out",
                zIndex: idx === currentSlide ? 1 : 0
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: idx === currentSlide ? "scale(1.05)" : "scale(1)",
                  transition: "transform 8s linear",
                  filter: "brightness(0.7)"
                }}
              />
              
              {/* Overlays */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,10,9,0.9) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(12,10,9,0.6) 0%, transparent 80%)" }} />

              {/* Content Box */}
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 8%",
                zIndex: 2
              }}>
                <div style={{ maxWidth: 800 }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "0.3em",
                    color: "#F59E0B",
                    background: "rgba(0,0,0,0.4)",
                    padding: "6px 16px",
                    borderRadius: 99,
                    marginBottom: 24,
                    opacity: idx === currentSlide && heroLoaded ? 1 : 0,
                    transform: idx === currentSlide && heroLoaded ? "none" : "translateY(20px)",
                    transition: "all 0.8s 0.2s"
                  }}>
                    <MdWhatshot /> {slide.tag}
                  </div>
                  
                  <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(60px, 12vw, 150px)",
                    lineHeight: 0.85,
                    color: "#FFF",
                    marginBottom: 20,
                    opacity: idx === currentSlide && heroLoaded ? 1 : 0,
                    transform: idx === currentSlide && heroLoaded ? "none" : "translateY(30px)",
                    transition: "all 0.8s 0.4s"
                  }}>
                    {slide.title}<br />
                    <span style={{ color: "#F59E0B" }}>{slide.highlight}</span>
                  </h1>

                  <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "clamp(18px, 2vw, 24px)",
                    color: "#D6D3D1",
                    maxWidth: 550,
                    marginBottom: 40,
                    opacity: idx === currentSlide && heroLoaded ? 1 : 0,
                    transform: idx === currentSlide && heroLoaded ? "none" : "translateY(20px)",
                    transition: "all 0.8s 0.6s"
                  }}>
                    {slide.desc}
                  </p>

                  <div style={{
                    display: "flex",
                    gap: 20,
                    opacity: idx === currentSlide && heroLoaded ? 1 : 0,
                    transform: idx === currentSlide && heroLoaded ? "none" : "translateY(20px)",
                    transition: "all 0.8s 0.8s"
                  }}>
                    <a href="/menu" style={{
                      background: "linear-gradient(135deg, #F59E0B, #D97706)",
                      color: "#000",
                      padding: "16px 42px",
                      borderRadius: 14,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: "0.1em",
                      textDecoration: "none",
                      boxShadow: "0 10px 30px rgba(245,158,11,0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      EXPLORE MENU <MdArrowForward />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicators */}
          <div style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 10,
            zIndex: 10
          }}>
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  background: idx === currentSlide ? "#F59E0B" : "rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.4s ease"
                }}
              />
            ))}
          </div>
          
          {/* Scroll prompt */}
          <div style={{
            position: "absolute",
            bottom: 40,
            right: "8%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            zIndex: 10,
            opacity: 0.6
          }}>
            <div style={{ width: 1, height: 60, background: "linear-gradient(to top, rgba(245,158,11,1), transparent)" }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.2em", color: "#F59E0B", writingMode: "vertical-rl" }}>SCROLL</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <section ref={statsRef} style={{ background: "#0C0A09", padding: "80px 40px" }}>
          <div className="stats-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 40 }}>
            {[
              { target: 12400, suffix: "+", label: "Orders Delivered" },
              { target: 98, suffix: "%", label: "5-Star Reviews" },
              { target: 24, suffix: "min", label: "Avg. Delivery" },
              { target: 16, suffix: "+", label: "Burger Varieties" },
            ].map(s => <Stat key={s.label} {...s} running={statsInView} />)}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section ref={howRef} style={{ background: "#0F0D0B", padding: "90px 40px", position: "relative" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 12 }}>
                Dead Simple
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,64px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>
                How It Works
              </h2>
            </div>
            <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 40 }}>
              {[
                { num: 1, icon: <MdSmartphone />, title: "Browse Menu", desc: "Pick from 16+ handcrafted burgers and customise your order" },
                { num: 2, icon: <MdShoppingCart />, title: "Add to Cart", desc: "Build your meal, add sides and drinks" },
                { num: 3, icon: <MdCreditCard />, title: "Checkout", desc: "Pay securely with card, PayPal, or cash on delivery" },
                { num: 4, icon: <MdDeliveryDining />, title: "Fast Delivery", desc: "Your order arrives hot at your door in ~25 minutes" },
              ].map((step, i) => (
                <Step key={step.num} {...step} delay={i * 120} inView={howInView} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED BURGERS ── */}
        <section style={{ background: "#0C0A09", padding: "90px 40px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 10 }}>
                  Hand-Crafted Daily
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,64px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>
                  Featured Burgers
                </h2>
              </div>
              <a href="/menu" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", textDecoration: "none", border: "1px solid rgba(245,158,11,0.3)", padding: "10px 22px", borderRadius: 999, transition: "all 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Full Menu <MdArrowForward size={16} />
              </a>
            </div>
            <div className="burgers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {BURGERS.map((b, i) => <BurgerCard key={b.id} burger={b} delay={i * 80} />)}
            </div>
          </div>
        </section>

        {/* ── DEALS ── */}
        <section ref={dealsRef} style={{ background: "#0F0D0B", padding: "90px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: "#EF4444", textTransform: "uppercase", marginBottom: 12 }}>
                Limited Time
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,64px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>
                Today's Deals
              </h2>
            </div>
            <div className="deals-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { tag: "🎉 FIRST ORDER", title: "20% Off", sub: "Your entire first order", code: "FIRST20", color: "#EF4444" },
                { tag: "🍟 COMBO DEAL", title: "2 Burgers + Fries", sub: "Only $24.99 — save $8", code: "COMBO25", color: "#F59E0B" },
                { tag: "🛵 FREE DELIVERY", title: "Free on $20+", sub: "Every day, no minimum", code: null, color: "#22C55E" },
              ].map((deal, i) => (
                <div key={i}
                  className="deal-card"
                  style={{
                    background: `linear-gradient(135deg, ${deal.color}18, ${deal.color}06)`,
                    border: `1px solid ${deal.color}35`,
                    borderRadius: 16, padding: "32px 28px",
                    display: "flex", flexDirection: "column", gap: 12,
                    transition: "transform 0.25s",
                    opacity: dealsInView ? 1 : 0,
                    transform: dealsInView ? "translateY(0)" : "translateY(24px)",
                    transitionDelay: `${i * 100}ms`,
                  }}>
                  <span style={{ fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.15em", color: deal.color, textTransform: "uppercase" }}>{deal.tag}</span>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#F5F5F4", letterSpacing: "0.02em", lineHeight: 1 }}>{deal.title}</div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: "#A8A29E" }}>{deal.sub}</p>
                  {deal.code && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", color: "#F5F5F4", background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.15)" }}>{deal.code}</span>
                      <span style={{ fontSize: 12, color: "#57534E" }}>copy code</span>
                    </div>
                  )}
                    <a href="/menu" style={{ marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: deal.color, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                      Claim Now <MdArrowForward size={16} />
                    </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section ref={reviewRef} style={{ background: "#0C0A09", padding: "90px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 12 }}>
                Real People, Real Hunger
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,64px)", letterSpacing: "0.03em", color: "#F5F5F4" }}>
                What They're Saying
              </h2>
            </div>
            <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {REVIEWS.map((r, i) => (
                <div key={i}
                  className="review-card"
                  style={{
                    background: "#161210",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: "28px 26px",
                    display: "flex", flexDirection: "column", gap: 14,
                    opacity: reviewInView ? 1 : 0,
                    transform: reviewInView ? "translateY(0)" : "translateY(24px)",
                    transition: `all 0.5s ease ${i * 100}ms, border-color 0.2s`,
                  }}>
                  <Stars n={r.stars} />
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: "#D6D3D1", lineHeight: 1.6, fontStyle: "italic" }}>
                    "{r.text}"
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", color: "#F5F5F4" }}>{r.name}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#57534E", letterSpacing: "0.08em" }}>{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{
          background: "linear-gradient(135deg,#1C0E00,#0C0A09)",
          padding: "100px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 32, animation: "floatBurger 4s ease-in-out infinite", display: "flex", justifyContent: "center" }}>
              <img 
                src="https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop" 
                alt="Burger" 
                style={{ width: "clamp(200px, 30vw, 350px)", height: "auto", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.6))" }} 
              />
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px,7vw,90px)", letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95, marginBottom: 20 }}>
              YOUR BURGER<br /><span style={{ color: "#F59E0B" }}>IS WAITING.</span>
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 18, color: "#78716C", marginBottom: 40 }}>
              Don't think about it. Just order.
            </p>
            <a href="/menu" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 20, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              color: "#1C1917",
              background: "linear-gradient(135deg,#F59E0B,#D97706)",
              padding: "16px 52px", borderRadius: 999,
              boxShadow: "0 0 40px rgba(245,158,11,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(245,158,11,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(245,158,11,0.4)"; }}
            >
              Order Now — Free Delivery <MdDeliveryDining size={24} />
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#080705", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "50px 40px 30px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F5F5F4", letterSpacing: "0.05em", marginBottom: 10 }}>
                  BURGER<span style={{ color: "#F59E0B" }}>HUB</span>
                </div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E", lineHeight: 1.7, maxWidth: 240 }}>
                  Seriously good burgers, delivered hot. Open 24/7 across Jerusalem.
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                  {["𝕏", "f", "📸"].map(s => (
                    <button key={s} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#A8A29E", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    >{s}</button>
                  ))}
                </div>
              </div>
              {[
                { heading: "Menu", links: ["Burgers", "Combos", "Sides", "Drinks"] },
                { heading: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
                { heading: "Support", links: ["Track Order", "Contact", "FAQ", "Privacy"] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#57534E", marginBottom: 16 }}>{col.heading}</div>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#78716C", textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#F59E0B"}
                      onMouseLeave={e => e.currentTarget.style.color = "#78716C"}
                    >{l}</a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#3D3632" }}>© 2026 BurgerHub. All rights reserved.</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#3D3632" }}>Made with 🍔 in Jerusalem</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}