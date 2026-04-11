import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  MdAccessTime, MdRestaurant, MdDeliveryDining, MdCheckCircle, MdCancel, MdCreditCard, MdPayments, MdApple, MdMoney,
  MdWarning, MdFlashOn, MdLocationOn, MdClose, MdReceipt, MdSearch, MdExpandMore, MdExpandLess,
  MdArrowForward
} from 'react-icons/md';
import { FaStar } from 'react-icons/fa';

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── API constants ──────────────────────────────────────────────────── */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ─── Status config ──────────────────────────────────────────────────── */
const STATUS_CFG = {
  pending: { color: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", label: "Pending", icon: <MdAccessTime size={13} color="#F97316" /> },
  preparing: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Preparing", icon: <MdRestaurant size={13} color="#F59E0B" /> },
  on_the_way: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)", label: "On the Way", icon: <MdDeliveryDining size={13} color="#60A5FA" /> },
  delivered: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", label: "Delivered", icon: <MdCheckCircle size={13} color="#22C55E" /> },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", label: "Cancelled", icon: <MdCancel size={13} color="#EF4444" /> },
};

const PAYMENT_ICONS = {
  card: <MdCreditCard size={12} />,
  paypal: <MdPayments size={12} />,
  apple: <MdCreditCard size={12} />,
  cash: <MdMoney size={12} />
};

const CANCELLABLE = ["pending", "preparing"];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ─── Status badge ───────────────────────────────────────────────────── */
const StatusBadge = ({ status, size = "sm" }) => {
  const cfg = STATUS_CFG[status] || { color: "#78716C", bg: "rgba(120,113,108,0.1)", border: "rgba(120,113,108,0.2)", label: status, icon: "○" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: size === "lg" ? 12 : 10, letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: size === "lg" ? "5px 12px" : "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: size === "lg" ? 13 : 11 }}>{cfg.icon}</span>{cfg.label}
    </span>
  );
};

/* ─── Cancel confirm modal ───────────────────────────────────────────── */
const CancelModal = ({ order, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }} />
    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 301, background: "#1C1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 32px", width: 360, animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}><MdWarning size={40} color="#F59E0B" /></div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#F5F5F4", letterSpacing: "0.04em", marginBottom: 8 }}>Cancel Order?</div>
      <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#78716C", lineHeight: 1.6, marginBottom: 6 }}>
        This will cancel order <strong style={{ color: "#F5F5F4" }}>{order?.order_number}</strong>.
      </p>
      <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#44403C", marginBottom: 24 }}>
        Refund will be processed within 3–5 business days.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#78716C", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Keep It</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, color: "#EF4444", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Yes, Cancel</button>
      </div>
    </div>
  </>
);

/* ─── Order Card ─────────────────────────────────────────────────────── */
const OrderCard = ({ order, onCancel, onTrack, delay }) => {
  const [expanded, setExpanded] = useState(false);
  const [ref, inView] = useInView();
  const cfg = STATUS_CFG[order?.status] || {};
  const active = ["pending", "preparing", "on_the_way"].includes(order?.status);

  return (
    <div ref={ref} style={{ background: "#131110", border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.07)"}`, borderRadius: 16, overflow: "hidden", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(14px)", transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms, border-color 0.3s`, boxShadow: active ? `0 0 20px ${cfg.color}10` : "none" }}>

      {/* Active order live bar */}
      {active && (
        <div style={{ height: 3, background: `linear-gradient(90deg,${cfg.color},${cfg.color}80)`, animation: "shimmer 2s ease-in-out infinite", backgroundSize: "200% 100%" }} />
      )}

      {/* Header row */}
      <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5F5F4", letterSpacing: "0.04em" }}>{order.order_number}</div>
            <StatusBadge status={order?.status || "pending"} />
            {active && order?.eta && (
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", padding: "2px 8px", borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MdFlashOn size={12} /> ~{order?.eta} min
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#3D3632" }}>{fmtDate(order.created_at)} · {timeAgo(order.created_at)}</span>
            <span style={{ fontSize: 10, color: "#2D2926" }}>·</span>
            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#3D3632" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#3D3632" }}>
              <span>{PAYMENT_ICONS[order?.payment_method]}</span>
              {order?.payment_method?.charAt(0).toUpperCase() + order?.payment_method?.slice(1)}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#F59E0B", letterSpacing: "0.03em" }}>${order.total_amount.toFixed(2)}</div>
        </div>
      </div>

      {/* Items preview strip */}
      <div style={{ padding: "0 22px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {order.items.slice(0, 4).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 10px" }}>
            <span style={{ fontSize: 14 }}>{item.emoji}</span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, color: "#78716C", letterSpacing: "0.04em" }}>
              {item.quantity > 1 && <span style={{ color: "#F59E0B", marginRight: 2 }}>{item.quantity}×</span>}
              {item.product_name}
            </span>
          </div>
        ))}
        {order.items.length > 4 && (
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#3D3632" }}>+{order.items.length - 4} more</span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 22px", animation: "fadeIn 0.25s ease", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Full item list */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "#3D3632", textTransform: "uppercase", marginBottom: 8 }}>Order Items</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#D6D3D1", letterSpacing: "0.03em" }}>{item.product_name}</span>
                    {item.quantity > 1 && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#44403C", marginLeft: 6 }}>× {item.quantity}</span>}
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#F59E0B", letterSpacing: "0.03em", flexShrink: 0 }}>${item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "#3D3632", textTransform: "uppercase", marginBottom: 6 }}>Delivery Address</div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#A8A29E", lineHeight: 1.5 }}><MdLocationOn size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {order.delivery_address}</div>
              {order.delivery_instructions && (
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#44403C", marginTop: 4, fontStyle: "italic" }}>"{order.delivery_instructions}"</div>
              )}
            </div>
            {order.driver && (
              <div style={{ minWidth: 150 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "#3D3632", textTransform: "uppercase", marginBottom: 6 }}>Driver</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, color: "#F59E0B" }}>
                    {order.driver.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#A8A29E" }}>{order.driver}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div style={{ padding: "12px 22px 18px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {/* Track */}
        {(order?.status === "on_the_way" || order?.status === "preparing" || order?.status === "pending") && (
          <button onClick={() => onTrack(order.id)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", cursor: "pointer", padding: "9px 18px", borderRadius: 9, transition: "all 0.2s", boxShadow: "0 0 14px rgba(245,158,11,0.25)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 22px rgba(245,158,11,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 14px rgba(245,158,11,0.25)"; }}
          ><MdDeliveryDining size={14} /> Track Order</button>
        )}
        {/* Reorder */}
        {order?.status === "delivered" && (
          <button style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", cursor: "pointer", padding: "8px 16px", borderRadius: 9, transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
          ><MdArrowForward size={14} style={{ transform: 'rotate(180deg)' }} /> Reorder</button>
        )}
        {/* Cancel */}
        {order?.status && (order?.status === "pending" || order?.status === "preparing") && (
          <button onClick={() => onCancel(order)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#78716C", cursor: "pointer", padding: "8px 16px", borderRadius: 9, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.background = "rgba(239,68,68,0.13)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#78716C"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
          ><MdClose size={14} /> Cancel</button>
        )}
        {/* Rate */}
        {order?.status === "delivered" && (
          <button style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#44403C", cursor: "pointer", padding: "8px 14px", borderRadius: 9, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#F5F5F4"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#44403C"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          ><FaStar size={14} /> Rate</button>
        )}
        {/* Expand toggle */}
        <button onClick={() => setExpanded(x => !x)} style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", color: "#3D3632", transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.color = "#78716C"}
          onMouseLeave={e => e.currentTarget.style.color = "#3D3632"}
        >
          {expanded ? "Less ▲" : "Details ▼"}
        </button>
      </div>
    </div>
  );
};

/* ─── useInView ──────────────────────────────────────────────────────── */
function useInView(threshold = 0.05) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─── Stat pill ──────────────────────────────────────────────────────── */
const FilterPill = ({ statusKey, count, active, onClick }) => {
  const cfg = STATUS_CFG[statusKey];
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, background: active ? (cfg?.bg || "rgba(245,158,11,0.1)") : "rgba(255,255,255,0.03)", border: `1px solid ${active ? (cfg?.border || "rgba(245,158,11,0.25)") : "rgba(255,255,255,0.07)"}`, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {cfg && <span style={{ fontSize: 13 }}>{cfg.icon}</span>}
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? (cfg?.color || "#F59E0B") : "#57534E" }}>
        {statusKey === "all" ? "All Orders" : cfg?.label || statusKey}
      </span>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: active ? (cfg?.color || "#F59E0B") : "#3D3632", background: active ? `${cfg?.color || "#F59E0B"}18` : "rgba(255,255,255,0.05)", padding: "0 6px", borderRadius: 999 }}>
        {count}
      </span>
    </button>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [pageIn, setPageIn] = useState(false);

  useEffect(() => { const t = setTimeout(() => setPageIn(true), 80); return () => clearTimeout(t); }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      console.log('Starting fetch orders...');
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/users/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Orders response:', response.data);

        if (response.data.success) {
          // Transform API data to match component format
          const transformedOrders = response.data.data.map(order => ({
            ...order,
            // Add emoji based on product names
            items: order.items.map(item => ({
              ...item,
              emoji: getEmojiForProduct(item.product_name)
            }))
          }));
          setOrders(transformedOrders);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Helper function to get emojis for products
  const getEmojiForProduct = (productName) => {
    if (productName.toLowerCase().includes('burger')) return "🍔";
    if (productName.toLowerCase().includes('fries') || productName.toLowerCase().includes('rings')) return "🍟";
    if (productName.toLowerCase().includes('shake') || productName.toLowerCase().includes('smoothie')) return "🥤";
    if (productName.toLowerCase().includes('brownie') || productName.toLowerCase().includes('chocolate')) return "🍫";
    if (productName.toLowerCase().includes('bbq') || productName.toLowerCase().includes('inferno')) return "🌶️";
    if (productName.toLowerCase().includes('bacon')) return "🥓";
    if (productName.toLowerCase().includes('garden') || productName.toLowerCase().includes('veg')) return "🌿";
    return "🍽️";
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleCancel = () => {
    setOrders(prev => prev.map(o => o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o));
    setCancelTarget(null);
    showToast("Order cancelled. Refund initiated.", "error");
  };

  const handleTrack = (id) => {
    // Navigate to tracking page: navigate(`/order/${id}`)
    showToast(`Tracking order ${orders.find(o => o.id === id)?.order_number}…`);
  };

  // Counts
  const counts = {
    all: orders.length,
    ...Object.fromEntries(Object.keys(STATUS_CFG).map(s => [s, orders.filter(o => o.status === s).length])),
  };

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
            Loading your orders...
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
            Failed to load orders
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

  // Filter
  const filtered = orders.filter(o =>
    (filter === "all" || o.status === filter) &&
    (search === "" ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())))
  );

  const activeOrders = orders.filter(o => ["pending", "preparing", "on_the_way"].includes(o.status));

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        input::placeholder { color: #3D3632; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2D2926; border-radius: 2px; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes popIn   { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 400, background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`, color: toast.type === "success" ? "#22C55E" : "#EF4444", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "toastIn 0.3s ease", whiteSpace: "nowrap", display: 'flex', alignItems: 'center', gap: 6 }}>
            {toast.type === "success" ? <MdCheckCircle size={16} /> : <MdClose size={16} />} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "36px 40px 0", opacity: pageIn ? 1 : 0, transform: pageIn ? "none" : "translateY(10px)", transition: "all 0.5s 0.1s" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 6 }}>Your Account</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(32px,5vw,52px)", letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95 }}>My Orders</h1>
              <a href="/menu" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", color: "#1C1917", background: "linear-gradient(135deg,#F59E0B,#D97706)", padding: "9px 20px", borderRadius: 10, boxShadow: "0 0 16px rgba(245,158,11,0.25)", transition: "all 0.2s", display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdArrowForward size={14} /> Order Again
              </a>
            </div>

            {/* Active orders banner */}
            {activeOrders.length > 0 && (
              <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#22C55E", letterSpacing: "0.06em" }}>
                  {activeOrders.length} active order{activeOrders.length !== 1 ? "s" : ""} in progress
                </span>
                {activeOrders.map(o => (
                  <span key={o.id} style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#78716C" }}>
                    {o.order_number} · <span style={{ color: STATUS_CFG[o.status]?.color }}>{STATUS_CFG[o.status]?.label}</span>
                    {o.eta && <span style={{ color: "#44403C" }}> · ~{o.eta} min</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 16, flexWrap: "nowrap" }}>
              <FilterPill statusKey="all" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
              {Object.keys(STATUS_CFG).filter(s => counts[s] > 0).map(s => (
                <FilterPill key={s} statusKey={s} count={counts[s]} active={filter === s} onClick={() => setFilter(s)} />
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 40px 60px" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}><MdSearch size={18} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or item name…"
              style={{ width: "100%", padding: "11px 12px 11px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#F5F5F4", fontFamily: "'Barlow',sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
            />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#44403C", fontSize: 14 }}><MdClose size={16} /></button>}
          </div>

          {/* Results count */}
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#2D2926", textTransform: "uppercase", marginBottom: 16 }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* Orders */}
          {filtered.length === 0 ? (
            <div style={{ padding: "80px 40px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 16, animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 52, opacity: 0.25, marginBottom: 14, animation: "pulse 2.5s ease-in-out infinite" }}><MdReceipt size={52} color="#44403C" /></div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#3D3632", letterSpacing: "0.04em" }}>
                {filter === "all" ? "No Orders Yet" : `No ${STATUS_CFG[filter]?.label} Orders`}
              </div>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#2D2926", marginTop: 8, lineHeight: 1.6 }}>
                {filter === "all" ? "Place your first order and it'll appear here." : "Try a different filter."}
              </p>
              {filter === "all" && (
                <a href="/menu" style={{ display: "inline-block", marginTop: 24, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", color: "#1C1917", background: "linear-gradient(135deg,#F59E0B,#D97706)", padding: "12px 28px", borderRadius: 999, boxShadow: "0 0 20px rgba(245,158,11,0.3)", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MdArrowForward size={14} /> Browse Menu
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((order, i) => (
                <OrderCard key={order.id} order={order} delay={i * 60}
                  onCancel={setCancelTarget}
                  onTrack={handleTrack}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cancel modal */}
        {cancelTarget && <CancelModal order={cancelTarget} onConfirm={handleCancel} onCancel={() => setCancelTarget(null)} />}
      </div>
    </>
  );
}