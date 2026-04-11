import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import {
  MdFastfood,
  MdLunchDining,
  MdLocalDrink,
  MdShoppingBag,
  MdRemove,
  MdAdd,
  MdDelete,
  MdLabel,
  MdCheck,
  MdClose,
  MdWarning,
  MdCelebration,
  MdArrowBack,
  MdArrowForward,
  MdCake,
  MdHourglassEmpty,
  MdAccountBalance,
  MdCreditCard,
  MdSmartphone,
  MdAttachMoney,
  MdLayers,
  MdShoppingCart
} from "react-icons/md";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);



const PROMO_CODES = {
  FIRST20: { type: "pct", value: 20, label: "20% off your order" },
  FREESHIP: { type: "ship", value: 0, label: "Free delivery" },
  SAVE5: { type: "fixed", value: 5, label: "$5 off your order" },
};

const DELIVERY_THRESHOLD = 20;
const DELIVERY_FEE = 3.99;

/* ─── Utility ────────────────────────────────────────────────────────── */
function useInView(threshold = 0.08) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Qty stepper ────────────────────────────────────────────────────── */
const Stepper = ({ qty, onDec, onInc, max }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {[
      { icon: <MdRemove />, onClick: onDec, disabled: qty <= 1 },
      null,
      { icon: <MdAdd />, onClick: onInc, disabled: qty >= max },
    ].map((btn, i) =>
      btn === null ? (
        <span key="val" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, color: "#F5F5F4",
          width: 32, textAlign: "center", lineHeight: 1,
        }}>{qty}</span>
      ) : (
        <button key={i} onClick={btn.onClick} disabled={btn.disabled} style={{
          width: 32, height: 32, borderRadius: "50%",
          background: btn.disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${btn.disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)"}`,
          color: btn.disabled ? "#3D3632" : "#F5F5F4",
          fontSize: 16, cursor: btn.disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          transition: "all 0.15s",
          lineHeight: 1,
        }}
          onMouseEnter={e => { if (!btn.disabled) e.currentTarget.style.background = "rgba(245,158,11,0.15)"; }}
          onMouseLeave={e => { if (!btn.disabled) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        >
          {btn.icon}
        </button>
      )
    )}
  </div>
);

/* ─── Cart Item Row ──────────────────────────────────────────────────── */
const CartItem = ({ item, onQtyChange, onRemove, delay }) => {
  const [ref, inView] = useInView();
  const [removing, setRemoving] = useState(false);
  const [hover, setHover] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 350);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#1C1917" : "#131110",
        border: `1px solid ${hover ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex", alignItems: "center", gap: 16,
        opacity: removing ? 0 : inView ? 1 : 0,
        transform: removing
          ? "translateX(60px) scale(0.95)"
          : inView ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity ${removing ? 0.35 : 0.4}s ease ${removing ? 0 : delay}ms,
                     transform ${removing ? 0.35 : 0.4}s ease ${removing ? 0 : delay}ms,
                     border-color 0.2s, background 0.2s`,
        maxHeight: removing ? 0 : 200,
        overflow: "hidden",
        marginBottom: removing ? 0 : undefined,
      }}
    >
      {/* Emoji */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        background: hover ? "linear-gradient(135deg,#2A1800,#1C1209)" : "linear-gradient(135deg,#18120A,#0E0B08)",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "#F59E0B",
        transition: "background 0.3s",
      }}>
        <span style={{
          transform: hover ? "scale(1.15) rotate(-6deg)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex", lineHeight: 1,
        }}>{item.icon}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1.1,
        }}>
          {item.name}
        </div>
        {item.addons.length > 0 && (
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 12, color: "#57534E", marginTop: 4,
          }}>
            + {item.addons.join(", ")}
          </div>
        )}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20, color: "#F59E0B", letterSpacing: "0.02em", marginTop: 6,
        }}>
          ${(Number(item.price) * item.qty).toFixed(2)}
          {item.qty > 1 && (
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#44403C", fontWeight: 600, letterSpacing: "0.06em", marginLeft: 6 }}>
              (${Number(item.price).toFixed(2)} each)
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <Stepper
          qty={item.qty}
          max={item.maxQty}
          onDec={() => onQtyChange(item.id, item.qty - 1)}
          onInc={() => onQtyChange(item.id, item.qty + 1)}
        />

        {/* Remove */}
        <button onClick={handleRemove} style={{
          width: 34, height: 34, borderRadius: 8,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.15)",
          color: "#78716C", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#78716C"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}
          title="Remove item"
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
};

/* ─── Promo Code Input ───────────────────────────────────────────────── */
const PromoInput = ({ onApply, applied, onRemove }) => {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleApply = () => {
    const upper = code.toUpperCase().trim();
    if (PROMO_CODES[upper]) {
      onApply(upper, PROMO_CODES[upper]);
      setCode("");
      setError("");
    } else {
      setError("Invalid promo code. Try FIRST20, FREESHIP, or SAVE5");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: 11, letterSpacing: "0.2em",
        color: "#44403C", textTransform: "uppercase", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6
      }}>
        <MdLabel /> Promo Code
      </div>

      {applied ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 10, padding: "11px 14px",
        }}>
          <div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, color: "#22C55E", letterSpacing: "0.1em", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MdCheck /> {applied.code}
            </span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E", marginLeft: 8 }}>
              {PROMO_CODES[applied.code]?.label}
            </span>
          </div>
          <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#57534E", fontSize: 18, display: "flex" }}
            onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#57534E"}
          ><MdClose /></button>
        </div>
      ) : (
        <>
          <div style={{
            display: "flex", gap: 8,
            animation: shake ? "shakeInput 0.4s ease" : "none",
          }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && handleApply()}
              placeholder="Enter code"
              style={{
                flex: 1, padding: "11px 14px",
                background: focused ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${error ? "#EF4444" : focused ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, color: "#F5F5F4",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 14, letterSpacing: "0.1em",
                outline: "none", transition: "all 0.2s",
              }}
            />
            <button onClick={handleApply} style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#F59E0B", cursor: "pointer",
              padding: "0 18px", borderRadius: 10,
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.12)"; }}
            >
              Apply
            </button>
          </div>
          {error && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#EF4444", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <MdWarning /> {error}
            </p>
          )}
        </>
      )}
    </div>
  );
};

/* ─── Free Delivery Progress Bar ────────────────────────────────────── */
const DeliveryProgress = ({ subtotal, freeShip }) => {
  const pct = Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100);
  const remaining = Math.max(0, DELIVERY_THRESHOLD - Number(subtotal)).toFixed(2);
  const isFree = freeShip || subtotal >= DELIVERY_THRESHOLD;

  return (
    <div style={{
      background: isFree ? "rgba(34,197,94,0.07)" : "rgba(245,158,11,0.06)",
      border: `1px solid ${isFree ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.15)"}`,
      borderRadius: 10, padding: "14px 16px",
    }}>
      <div style={{
        fontFamily: "'Barlow', sans-serif", fontSize: 13,
        color: isFree ? "#22C55E" : "#A8A29E",
        marginBottom: 8, lineHeight: 1.4,
        display: "flex", alignItems: "center", gap: 6
      }}>
        {isFree
          ? <><MdCelebration /> You've unlocked free delivery!</>
          : <>Add <span style={{ color: "#F59E0B", fontWeight: 700 }}>${remaining}</span> more for free delivery</>
        }
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: isFree ? "#22C55E" : "linear-gradient(90deg,#F59E0B,#D97706)",
          width: `${pct}%`,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isFree ? "0 0 6px rgba(34,197,94,0.4)" : "0 0 6px rgba(245,158,11,0.4)",
        }} />
      </div>
    </div>
  );
};

/* ─── Empty State ────────────────────────────────────────────────────── */
const EmptyCart = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "100px 40px", textAlign: "center",
    animation: "fadeSlideUp 0.5s ease",
  }}>
    <div style={{ fontSize: 80, marginBottom: 20, animation: "floatBurger 3s ease-in-out infinite", filter: "grayscale(0.5)", color: "#3D3632", display: "flex", justifyContent: "center" }}>
      <MdShoppingCart />
    </div>
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1 }}>
      Your cart is empty
    </div>
    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: "#57534E", marginTop: 12, maxWidth: 320, lineHeight: 1.6 }}>
      Looks like you haven't added anything yet. Time to fix that.
    </p>
    <a href="/menu" style={{
      marginTop: 32,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase",
      textDecoration: "none",
      color: "#1C1917",
      background: "linear-gradient(135deg,#F59E0B,#D97706)",
      padding: "14px 36px", borderRadius: 999,
      boxShadow: "0 0 20px rgba(245,158,11,0.3)",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: 10
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(245,158,11,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 20px rgba(245,158,11,0.3)"; }}
    >
      <MdFastfood size={20} /> Browse Menu
    </a>
    {/* Suggested items */}
    <div style={{ marginTop: 60, width: "100%", maxWidth: 500 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", color: "#3D3632", textTransform: "uppercase", marginBottom: 16 }}>
        Popular Right Now
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          [<MdFastfood />, "OG Classic", "$8.99"],
          [<MdLayers />, "Bacon Overload", "$13.99"],
          [<MdLunchDining />, "Truffle Fries", "$6.99"]
        ].map(([icon, n, p]) => (
          <div key={n} style={{
            background: "#131110", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            transition: "all 0.2s",
          }}
            onMouseEnter={ev => { ev.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; ev.currentTarget.style.background = "#1C1917"; }}
            onMouseLeave={ev => { ev.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; ev.currentTarget.style.background = "#131110"; }}
          >
            <span style={{ fontSize: 24, color: "#F59E0B", display: "flex" }}>{icon}</span>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4" }}>{n}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#F59E0B" }}>{p}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main CartPage ──────────────────────────────────────────────────── */
export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, clearCart: clearCartContext, removeFromCart } = useCart();
  const [promo, setPromo] = useState(null); // { code, type, value }
  const [checkingOut, setCheckingOut] = useState(false);
  const [pageIn, setPageIn] = useState(false);

  useEffect(() => { const t = setTimeout(() => setPageIn(true), 80); return () => clearTimeout(t); }, []);

  const updateQty = (id, qty, customizations = {}) => {
    if (qty < 1) {
      removeFromCart(id, customizations);
      return;
    }
    updateQuantity(id, qty, customizations);
  };

  const removeItem = (id, customizations = {}) => {
    removeFromCart(id, customizations);
  };

  const clearCart = () => {
    clearCartContext();
  };

  const subtotal = cartTotal;
  const freeShip = promo?.type === "ship";
  const promoDiscount = !promo ? 0
    : promo.type === "pct" ? subtotal * (promo.value / 100)
      : promo.type === "fixed" ? promo.value
        : 0;
  const deliveryFee = (freeShip || subtotal >= DELIVERY_THRESHOLD) ? 0 : DELIVERY_FEE;
  const total = subtotal - promoDiscount + deliveryFee;
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    await new Promise(r => setTimeout(r, 1000));
    setCheckingOut(false);
    window.location.href = "/checkout";
  };

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes floatBurger { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shakeInput { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes loadBar { from{width:0%} to{width:100%} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #3D3632; border-radius: 2px; }
        input::placeholder { color: #3D3632; }
        @media (max-width: 900px) {
          .cart-layout { flex-direction: column !important; }
          .cart-sidebar { position: static !important; width: 100% !important; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 40px 28px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 11, letterSpacing: "0.3em",
              color: "#F59E0B", textTransform: "uppercase", marginBottom: 8,
              opacity: pageIn ? 1 : 0, transition: "opacity 0.5s 0.1s",
            }}>
              Review Your Order
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px,6vw,64px)",
                letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95,
                opacity: pageIn ? 1 : 0,
                transform: pageIn ? "none" : "translateY(14px)",
                transition: "all 0.5s 0.15s",
              }}>
                Your Cart
                {totalItems > 0 && (
                  <span style={{ color: "#F59E0B", marginLeft: 12, fontSize: "0.7em" }}>({totalItems})</span>
                )}
              </h1>
              {cartItems.length > 0 && (
                <button onClick={clearCart} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#44403C",
                  transition: "color 0.2s",
                  opacity: pageIn ? 1 : 0, transition2: "opacity 0.5s 0.4s",
                  display: "flex", alignItems: "center", gap: 4
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "#44403C"}
                >
                  Clear All <MdClose size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 60px" }}>
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="cart-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

              {/* ── LEFT: Items ── */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Back to menu */}
                <a href="/menu" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "#57534E", textDecoration: "none",
                  marginBottom: 4,
                  transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F59E0B"}
                  onMouseLeave={e => e.currentTarget.style.color = "#57534E"}
                >
                  <MdArrowBack size={16} /> Continue Shopping
                </a>

                {/* Item list */}
                {cartItems.map((item, i) => {
                  // Determine icon based on category
                  const getIcon = () => {
                    const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
                    switch (category) {
                      case 'burger': return <MdFastfood />;
                      case 'fries': return <MdLunchDining />;
                      case 'drink': case 'beverage': return <MdLocalDrink />;
                      case 'dessert': return <MdCake />;
                      default: return <MdShoppingBag />;
                    }
                  };
                  return (
                    <CartItem
                      key={`${item.id}-${JSON.stringify(item.customizations || {})}`}
                      item={{
                        id: item.id,
                        icon: getIcon(),
                        name: item.name,
                        price: item.price,
                        qty: item.quantity,
                        addons: item.customizations?.addons || [],
                        maxQty: item.maxQuantity || 10
                      }}
                      onQtyChange={(id, qty) => updateQty(id, qty, item.customizations || {})}
                      onRemove={(id) => removeItem(id, item.customizations || {})}
                      delay={i * 70}
                    />
                  );
                })}

                {/* Upsell strip */}
                <div style={{
                  marginTop: 8,
                  background: "rgba(245,158,11,0.04)",
                  border: "1px dashed rgba(245,158,11,0.2)",
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 12,
                }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#F5F5F4", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8 }}>
                      <MdCake /> Add a dessert?
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E", marginTop: 2 }}>
                      Lava Brownie, Churros, Ice Cream Sandwich — from $4.99
                    </div>
                  </div>
                  <a href="/menu" style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#F59E0B", textDecoration: "none",
                    border: "1px solid rgba(245,158,11,0.3)",
                    padding: "7px 14px", borderRadius: 999,
                    transition: "all 0.2s", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    Browse <MdArrowForward />
                  </a>
                </div>
              </div>

              {/* ── RIGHT: Summary ── */}
              <div className="cart-sidebar" style={{ width: 340, flexShrink: 0, position: "sticky", top: 84, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Delivery progress */}
                <DeliveryProgress subtotal={subtotal} freeShip={freeShip} />

                {/* Summary card */}
                <div style={{
                  background: "#131110",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, overflow: "hidden",
                }}>
                  <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F5F5F4", letterSpacing: "0.04em", marginBottom: 16 }}>
                      Order Summary
                    </div>

                    {/* Line items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {cartItems.map(item => (
                        <div key={`${item.id}-${JSON.stringify(item.customizations || {})}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#78716C" }}>
                            {item.quantity > 1 && <span style={{ color: "#F59E0B", fontWeight: 700 }}>{item.quantity}× </span>}
                            {item.name}
                            {item.customizations?.addons && item.customizations.addons.length > 0 && (
                              <span style={{ fontSize: 11, color: "#57534E", display: 'block' }}>
                                + {item.customizations.addons.join(', ')}
                              </span>
                            )}
                          </span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#A8A29E" }}>
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Subtotal */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E" }}>Subtotal</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#A8A29E" }}>${Number(subtotal).toFixed(2)}</span>
                    </div>

                    {/* Promo discount */}
                    {promo && promoDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#22C55E" }}>Promo ({promo.code})</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#22C55E" }}>-${Number(promoDiscount).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Delivery */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E" }}>Delivery</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: deliveryFee === 0 ? "#22C55E" : "#A8A29E" }}>
                        {deliveryFee === 0 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>FREE <MdCelebration /></span> : `$${Number(deliveryFee).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ padding: "16px 22px 20px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F5F4", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: "#F59E0B", letterSpacing: "0.03em" }}>${Number(total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo code */}
                <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
                  <PromoInput
                    applied={promo}
                    onApply={(code, data) => setPromo({ code, ...data })}
                    onRemove={() => setPromo(null)}
                  />
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{
                    width: "100%",
                    background: checkingOut ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)",
                    color: "#1C1917", border: "none",
                    cursor: checkingOut ? "not-allowed" : "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "16px", borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.2s",
                    boxShadow: checkingOut ? "none" : "0 0 24px rgba(245,158,11,0.28)",
                  }}
                  onMouseEnter={e => { if (!checkingOut) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(245,158,11,0.5)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = checkingOut ? "none" : "0 0 24px rgba(245,158,11,0.28)"; }}
                >
                  {checkingOut ? (
                    <span style={{ width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}><MdHourglassEmpty /></span>
                      Processing…
                    </span>
                  ) : (
                    <>
                      <span>Checkout</span>
                      <span style={{ background: "rgba(0,0,0,0.18)", padding: "4px 14px", borderRadius: 999, fontWeight: 800, fontSize: 16 }}>
                        ${Number(total).toFixed(2)}
                      </span>
                    </>
                  )}
                </button>

                {/* Payment icons */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#3D3632", marginBottom: 8 }}>Secure checkout · Encrypted payment</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, opacity: 0.4 }}>
                    {[<MdCreditCard />, <MdAccountBalance />, <MdSmartphone />, <MdAttachMoney />].map((icon, idx) => <span key={idx} style={{ fontSize: 18, display: "flex" }}>{icon}</span>)}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}