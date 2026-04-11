import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
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
  MdPhone,
  MdEmail,
  MdRefresh,
  MdStarHalf
} from "react-icons/md";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── Order Data ────────────────────────────────────────────────── */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';


/* ─── Status Pipeline ────────────────────────────────────────────────── */
const STEPS = [
  { key: "placed", label: "Order Placed", icon: <MdAssignment />, desc: "We've received your order" },
  { key: "confirmed", label: "Confirmed", icon: <MdCheckCircle />, desc: "Restaurant accepted your order" },
  { key: "preparing", label: "Preparing", icon: <MdRestaurant />, desc: "Your food is being crafted" },
  { key: "ready", label: "Ready for Pickup", icon: <MdNotificationsActive />, desc: "Waiting for your rider" },
  { key: "on_the_way", label: "On the Way", icon: <MdDeliveryDining />, desc: "Daniel is heading to you" },
  { key: "delivered", label: "Delivered", icon: <MdCelebration />, desc: "Enjoy your meal!" },
];

/* ─── Utility hooks ─────────────────────────────────────────────────── */
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

function useEtaCountdown(etaISO) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!etaISO) {
      setSecs(0);
      return;
    }
    const calc = () => Math.max(0, Math.floor((new Date(etaISO) - Date.now()) / 1000));
    setSecs(calc());
    const iv = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(iv);
  }, [etaISO]);
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, "0");
  return { m, s, secs };
}

/* ─── Progress Bar (horizontal visual) ──────────────────────────────── */
const ProgressPipeline = ({ currentStepIdx }) => (
  <div style={{ position: "relative", padding: "8px 0 4px" }}>
    {/* Track */}
    <div style={{
      position: "absolute", top: 28, left: 24, right: 24, height: 3,
      background: "rgba(255,255,255,0.07)", borderRadius: 2,
    }}>
      <div style={{
        height: "100%", borderRadius: 2,
        background: "linear-gradient(90deg,#22C55E,#F59E0B)",
        width: `${Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100)}%`,
        transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 0 8px rgba(245,158,11,0.5)",
      }} />
    </div>

    {/* Steps */}
    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
      {STEPS.map((step, i) => {
        const done = i < currentStepIdx;
        const active = i === currentStepIdx;
        return (
          <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 80 }}>
            {/* Circle */}
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: done ? "rgba(34,197,94,0.15)" : active ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
              border: `2px solid ${done ? "#22C55E" : active ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              boxShadow: active ? "0 0 16px rgba(245,158,11,0.35)" : "none",
              transition: "all 0.5s ease",
              animation: active ? "pulseDot 2s ease-in-out infinite" : "none",
              position: "relative",
            }}>
              {done ? <MdCheck /> : step.icon}
              {active && (
                <div style={{
                  position: "absolute", inset: -6, borderRadius: "50%",
                  border: "2px solid rgba(245,158,11,0.25)",
                  animation: "rippleRing 1.8s ease-out infinite",
                }} />
              )}
            </div>
            {/* Label */}
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: active ? 700 : 600,
              fontSize: 10, letterSpacing: "0.1em", textAlign: "center",
              textTransform: "uppercase",
              color: done ? "#22C55E" : active ? "#F59E0B" : "#3D3632",
              transition: "color 0.5s",
              lineHeight: 1.3,
            }}>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Tracking Log Entry ─────────────────────────────────────────────── */
const LogEntry = ({ step, time, isLatest, delay }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      display: "flex", gap: 16, alignItems: "flex-start",
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : "translateX(-16px)",
      transition: `all 0.4s ease ${delay}ms`,
    }}>
      {/* Icon + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isLatest ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.1)",
          border: `1.5px solid ${isLatest ? "#F59E0B" : "#22C55E40"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: isLatest ? "#F59E0B" : "#22C55E",
          boxShadow: isLatest ? "0 0 12px rgba(245,158,11,0.2)" : "none",
        }}>
          {step.icon}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: 15, letterSpacing: "0.06em",
            color: isLatest ? "#F5F5F4" : "#78716C",
          }}>
            {step.label}
            {isLatest && (
              <span style={{
                marginLeft: 8,
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                color: "#F59E0B",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 9, letterSpacing: "0.18em",
                padding: "2px 8px", borderRadius: 999, textTransform: "uppercase",
              }}>LIVE</span>
            )}
          </span>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#44403C", flexShrink: 0 }}>{time}</span>
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E", marginTop: 3, lineHeight: 1.5 }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
};

/* ─── Card wrapper ───────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#131110",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "24px 28px",
    ...style,
  }}>
    {children}
  </div>
);

const CardHead = ({ eyebrow, title }) => (
  <div style={{ marginBottom: 20 }}>
    {eyebrow && (
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#44403C", textTransform: "uppercase", marginBottom: 4 }}>
        {eyebrow}
      </div>
    )}
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F5F5F4", letterSpacing: "0.04em" }}>
      {title}
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function OrderTrackingPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [pageIn, setPageIn] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // ETA countdown hook - must be called unconditionally to avoid hook count mismatch
  const { m: etaM, s: etaS, secs: etaSecs } = useEtaCountdown(order?.estimated_delivery_time);

  // Fetch order data
  useEffect(() => {
    console.log('OrderTrackingPage useEffect: id=', id, 'token=', !!token);
    const fetchOrder = async () => {
      try {
        console.log('Fetching order:', id);
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Fetch response:', response.data);

        if (response.data.success) {
          const orderData = response.data.data;

          // Transform API data to component format
          const transformedOrder = {
            order_number: orderData.order_number,
            created_at: orderData.created_at,
            total_amount: orderData.total_amount,
            payment_status: orderData.payment_status,
            payment_method: orderData.payment_method,
            delivery_address: orderData.delivery_address,
            delivery_instructions: orderData.delivery_instructions,
            estimated_delivery_time: orderData.estimated_delivery_time,
            items: orderData.items.map(item => ({
              id: item.id,
              icon: getIconForProduct(item.product_name),
              name: item.product_name,
              qty: item.quantity,
              price: item.unit_price,
              addons: item.customizations?.addons || []
            })),
            driver: {
              name: "Daniel M.", // Mock driver data for now
              vehicle: "Scooter",
              rating: 4.9,
              icon: <MdPerson />,
              phone: "+972 50-555-0142",
              email: "daniel@burgerdelivery.com"
            }
          };

          setOrder(transformedOrder);

          // Set initial step based on order status
          const statusSteps = {
            'pending': 0,
            'confirmed': 1,
            'preparing': 2,
            'ready': 3,
            'on_the_way': 4,
            'delivered': 5
          };
          setCurrentStep(statusSteps[orderData.status] || 0);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchOrder();
    }
  }, [id, token]);

  // Helper function to get icons for products
  const getIconForProduct = (productName) => {
    if (productName.toLowerCase().includes('burger')) return <MdFastfood />;
    if (productName.toLowerCase().includes('fries') || productName.toLowerCase().includes('sides')) return <MdLunchDining />;
    if (productName.toLowerCase().includes('drink')) return <MdLocalDrink />;
    return <MdLayers />;
  };

  // Page animation
  useEffect(() => {
    const t = setTimeout(() => setPageIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Simulate real-time progression for demo
  useEffect(() => {
    if (!order || currentStep >= STEPS.length - 1) return;
    const iv = setInterval(() => {
      setCurrentStep(s => {
        if (s >= STEPS.length - 1) { clearInterval(iv); return s; }
        return s + 1;
      });
    }, 12000); // reduced frequency
    return () => clearInterval(iv);
  }, [currentStep, order]);

  // Handle rate order
  const handleRateOrder = async () => {
    try {
      setIsRating(true);
      setError(null);

      // Simulate API call to rate order
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      alert(`Thank you for rating your order! Your feedback helps us improve.`);
      setIsRating(false);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      setIsRating(false);
    }
  };

  // Handle reorder
  const handleReorder = async () => {
    try {
      setIsReordering(true);
      setError(null);

      // Simulate API call to create new order
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      alert(`Your order has been placed successfully! You'll receive a confirmation email soon.`);
      setIsReordering(false);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      setIsReordering(false);
    }
  };

  // Handle contact driver
  const handleContactDriver = () => {
    if (navigator.userAgentData.mobile) {
      window.location.href = `tel:${order.driver.phone}`;
    } else {
      alert(`Driver Phone: ${order.driver.phone}\nDriver Email: ${order.driver.email}`);
    }
  };

  // Handle need help - Chat
  const handleChatSupport = () => {
    // In a real app, this would open a chat window
    alert("Chat support would open here");
  };

  // Handle need help - Call
  const handleCallSupport = () => {
    // In a real app, this would initiate a call
    if (navigator.userAgentData.mobile) {
      window.location.href = "tel:+1234567890";
    } else {
      alert("Call support at +1 234 567 890");
    }
  };

  // Handle need help - Cancel
  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel your order?")) {
      try {
        // Simulate API call to cancel order
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Your order has been canceled successfully!");
        // In a real app, you would redirect to the orders page or home
        window.location.href = "/orders";
      } catch (err) {
        setError('Failed to cancel order. Please try again.');
      }
    }
  };

  // Build log timestamps
  const now = Date.now();
  const logTimes = STEPS.slice(0, currentStep + 1).map((_, i) => {
    const ago = (currentStep - i) * 3.5 * 60000;
    return new Date(now - ago);
  }).reverse();

  const fmt = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Loading state
  if (loading) {
    return (
      <div style={{
        background: "#0C0A09",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F5F5F4"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍔</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, marginBottom: 8 }}>
            Loading your order...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        background: "#0C0A09",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F5F5F4"
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, marginBottom: 8 }}>
            Failed to load order
          </div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#78716C", marginBottom: 16 }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 8,
              color: "#F59E0B",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div style={{
        background: "#0C0A09",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F5F5F4"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, marginBottom: 8 }}>
            Order not found
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const delivery = subtotal >= 20 ? 0 : 3.99;
  const total = subtotal + delivery;
  const etaProgress = Math.max(0, Math.min(100, 100 - (etaSecs / (30 * 60)) * 100));
  const isDelivered = currentStep === STEPS.length - 1;

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes pulseDot { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 24px rgba(245,158,11,0.6)} }
        @keyframes rippleRing { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.5)} }
        @keyframes scooterBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #3D3632; border-radius: 2px; }
        @media (max-width: 900px) {
          .track-layout { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4", fontFamily: "'Barlow', sans-serif" }}>

        {/* ── Top header ── */}
        <div style={{
          background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 40px 32px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 11, letterSpacing: "0.3em",
              color: "#F59E0B", textTransform: "uppercase", marginBottom: 8,
              opacity: pageIn ? 1 : 0, transition: "opacity 0.5s 0.1s",
            }}>
              Live Tracking
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px,6vw,64px)",
                letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95,
                opacity: pageIn ? 1 : 0,
                transform: pageIn ? "none" : "translateY(14px)",
                transition: "all 0.5s 0.2s",
              }}>
                Order {order.order_number}
              </h1>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: isDelivered ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${isDelivered ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.25)"}`,
                borderRadius: 999, padding: "8px 18px",
                opacity: pageIn ? 1 : 0, transition: "opacity 0.5s 0.35s",
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isDelivered ? "#22C55E" : "#F59E0B",
                  animation: isDelivered ? "none" : "dotPulse 1.4s ease-in-out infinite",
                }} />
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: isDelivered ? "#22C55E" : "#F59E0B",
                }}>
                  {isDelivered ? "Delivered" : STEPS[currentStep].label}
                </span>
              </div>
            </div>
            <div style={{
              fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E", marginTop: 6,
              opacity: pageIn ? 1 : 0, transition: "opacity 0.5s 0.4s",
            }}>
              Placed {fmtDate(order.created_at)}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="track-layout" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 60px", display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* LEFT column */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Status Pipeline */}
            <Card>
              <CardHead eyebrow="Order Progress" title="Live Status" />
              <div className="pipeline-steps">
                <ProgressPipeline currentStepIdx={currentStep} />
              </div>
              <div style={{
                marginTop: 20, padding: "14px 18px",
                background: isDelivered ? "rgba(34,197,94,0.07)" : "rgba(245,158,11,0.07)",
                border: `1px solid ${isDelivered ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                borderRadius: 10,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 24, display: "flex", color: isDelivered ? "#22C55E" : "#F59E0B" }}>{STEPS[currentStep].icon}</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", color: isDelivered ? "#22C55E" : "#F59E0B" }}>
                    {STEPS[currentStep].label}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#78716C", marginTop: 2 }}>
                    {STEPS[currentStep].desc}
                  </div>
                </div>
              </div>
            </Card>

            {/* ETA Card */}
            {!isDelivered && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#44403C", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <MdTimer size={14} /> Estimated Arrival
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      {new Date(order.estimated_delivery_time) < Date.now() ? (
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: "#EF4444", letterSpacing: "0.02em", lineHeight: 1 }}>
                          Delayed
                        </span>
                      ) : (
                        <>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: "#F59E0B", letterSpacing: "0.02em", lineHeight: 1 }}>
                            {etaM}
                          </span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: "#57534E" }}>
                            min {etaS}s
                          </span>
                        </>
                      )}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E", marginTop: 4 }}>
                      Arriving at {new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                  {/* Animated scooter progress */}
                  <div style={{ flex: 1, maxWidth: 280, minWidth: 180 }}>
                    <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
                      {/* Road */}
                      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#F59E0B,#D97706)", width: `${etaProgress}%`, transition: "width 1s linear", boxShadow: "0 0 8px rgba(245,158,11,0.4)" }} />
                      </div>
                      {/* Scooter */}
                      <div style={{
                        position: "absolute", bottom: 12,
                        left: `calc(${etaProgress}% - 14px)`,
                        fontSize: 26,
                        animation: "scooterBob 0.8s ease-in-out infinite",
                        transition: "left 1s linear",
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
                        color: "#F59E0B",
                        display: "flex"
                      }}>
                        <MdDeliveryDining />
                      </div>
                      {/* Home */}
                      <div style={{ position: "absolute", right: 0, bottom: 10, fontSize: 22, color: "#57534E", display: "flex" }}>
                        <MdHome />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#3D3632", letterSpacing: "0.1em", textTransform: "uppercase" }}>Restaurant</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#3D3632", letterSpacing: "0.1em", textTransform: "uppercase" }}>Your Door</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {isDelivered && (
              <Card style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 12, color: "#22C55E", display: "flex", justifyContent: "center" }}>
                  <MdCelebration />
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#22C55E", letterSpacing: "0.04em" }}>Delivered!</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#78716C", marginTop: 6 }}>Your order has arrived. Enjoy your meal!</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                  <button
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "linear-gradient(135deg,#F59E0B,#D97706)",
                      color: "#1C1917",
                      border: "none",
                      cursor: "pointer",
                      padding: "10px 22px",
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      position: "relative"
                    }}
                    onClick={() => {
                      if (navigator.userAgentData.mobile) {
                        window.location.href = `tel:${order.driver.phone}`;
                      } else {
                        alert(`Driver Phone: ${order.driver.phone}\nDriver Email: ${order.driver.email}`);
                      }
                    }}
                  >
                    <MdPhone /> Contact Driver
                  </button>
                  <button
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "linear-gradient(135deg,#22C55E,#16A34A)",
                      color: "#F5F5F4",
                      border: "none",
                      cursor: "pointer",
                      padding: "10px 22px",
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      position: "relative"
                    }}
                    onClick={handleRateOrder}
                  >
                    <MdStar /> Rate Order
                  </button>
                  <button
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "transparent",
                      color: "#78716C",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      padding: "10px 22px",
                      borderRadius: 999,
                      position: "relative"
                    }}
                    onClick={handleReorder}
                  >
                    🔁 Reorder
                  </button>
                </div>
              </Card>
            )}

            {/* Tracking Log */}
            <Card>
              <CardHead eyebrow="Timeline" title="Tracking Updates" />
              <div style={{ position: "relative", paddingLeft: 8 }}>
                {/* Vertical line */}
                <div style={{ position: "absolute", left: 26, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.05)" }} />
                {[...STEPS.slice(0, currentStep + 1)].reverse().map((step, i) => (
                  <LogEntry
                    key={step.key}
                    step={step}
                    time={fmt(logTimes[currentStep - i])}
                    isLatest={i === 0}
                    delay={i * 80}
                  />
                ))}
              </div>
            </Card>

          </div>

          {/* RIGHT column */}
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Driver card */}
            {(currentStep >= 4) && !isDelivered && (
              <Card style={{
                background: "linear-gradient(135deg,#1C1200,#131110)",
                border: "1px solid rgba(245,158,11,0.2)",
                animation: "fadeSlideUp 0.5s ease",
              }}>
                <CardHead eyebrow="Your Driver" title="On the Way" />
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.06))",
                    border: "1px solid rgba(245,158,11,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, flexShrink: 1, color: "#F59E0B",
                    animation: "scooterBob 1.2s ease-in-out infinite",
                  }}>
                    {order.driver.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: "#F5F5F4", letterSpacing: "0.04em" }}>
                      {order.driver.name}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#78716C", marginTop: 2 }}>
                      {order.driver.vehicle}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F59E0B", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <MdStar size={14} /> {order.driver.rating}
                    </div>
                  </div>
                </div>
                <button style={{
                  marginTop: 16, width: "100%",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(245,158,11,0.25)",
                  color: "#F59E0B", cursor: "pointer",
                  padding: "10px", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <MdCall /> Call Driver
                </button>
              </Card>
            )}

            {/* Delivery address */}
            <Card>
              <CardHead eyebrow="Delivering To" title="Your Address" />
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, color: "#F59E0B", display: "flex" }}><MdLocationOn /></span>
                <div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#D6D3D1", lineHeight: 1.5 }}>
                    {order.delivery_address}
                  </div>
                  {order.delivery_instructions && (
                    <>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: "#44403C", textTransform: "uppercase", marginTop: 12, marginBottom: 4 }}>
                        Instructions
                      </div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#78716C", lineHeight: 1.5, fontStyle: "italic" }}>
                        "{order.delivery_instructions}"
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHead eyebrow="What You Ordered" title="Order Summary" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0, color: "#F59E0B", display: "flex" }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#D6D3D1", letterSpacing: "0.03em" }}>
                          {item.qty > 1 && <span style={{ color: "#F59E0B" }}>{item.qty}× </span>}
                          {item.name}
                        </span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#F59E0B", flexShrink: 0 }}>
                          ${(Number(item.price) * item.qty).toFixed(2)}
                        </span>
                      </div>
                      {item.addons.length > 0 && (
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#44403C", marginTop: 2 }}>
                          + {item.addons.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Subtotal", `$${subtotal.toFixed(2)}`],
                  ["Delivery", delivery === 0 ? "FREE" : `$${delivery.toFixed(2)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E" }}>{k}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 13, color: (delivery === 0 && k === "Delivery") ? "#22C55E" : "#A8A29E" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: "#F5F5F4", letterSpacing: "0.04em" }}>Total</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F59E0B", letterSpacing: "0.03em" }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E" }}>Payment</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: "#22C55E", letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <MdCheck /> {order.payment_method} · {order.payment_status}
                </span>
              </div>
            </Card>

            {/* Support */}
            <Card style={{ padding: "16px 20px" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", color: "#3D3632", textTransform: "uppercase", marginBottom: 10 }}>
                Need Help?
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Chat", icon: <MdChat />, onClick: handleChatSupport },
                  { label: "Call", icon: <MdCall />, onClick: handleCallSupport },
                  { label: "Cancel", icon: <MdClose />, onClick: handleCancelOrder }
                ].map((btn) => (
                  <button key={btn.label} style={{
                    flex: 1,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: btn.label === "Cancel" ? "#EF444460" : "#57534E",
                    cursor: "pointer", padding: "10px 4px", borderRadius: 8,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    transition: "all 0.15s",
                  }}
                    onClick={btn.onClick}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = btn.label === "Cancel" ? "#EF4444" : "#A8A29E"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = btn.label === "Cancel" ? "#EF444460" : "#57534E"; }}
                  >
                    <span style={{ fontSize: 18, display: "flex" }}>
                      {btn.icon}
                    </span>
                    {btn.label}
                  </button>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
}