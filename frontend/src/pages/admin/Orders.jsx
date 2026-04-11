import { useState, useEffect, useRef } from "react";
import {
  MdCreditCard,
  MdPayment,
  MdSmartphone,
  MdAttachMoney,
  MdAccessTime,
  MdRestaurant,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdEdit,
  MdDelete,
  MdFastfood,
  MdLocalFireDepartment,
  MdLocalDrink,
  MdStar,
  MdGrass,
  MdCookie,
  MdLocationOn,
  MdPerson,
  MdSearch,
  MdRefresh,
  MdVisibility,
  MdList
} from "react-icons/md";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ─── Status Configuration ────────────────────────────────────────────── */
const STATUS_CFG = {
  pending: { color: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", label: "Pending", icon: <MdAccessTime /> },
  preparing: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Preparing", icon: <MdRestaurant /> },
  on_the_way: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)", label: "On the Way", icon: <MdLocalShipping /> },
  delivered: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", label: "Delivered", icon: <MdCheckCircle /> },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", label: "Cancelled", icon: <MdCancel /> },
};

const STATUS_FLOW = ["pending", "preparing", "on_the_way", "delivered"];
const PAYMENT_CFG = {
  card: { icon: <MdCreditCard />, label: "Card" },
  paypal: { icon: <MdPayment />, label: "PayPal" },
  apple: { icon: <MdSmartphone />, label: "Apple" },
  cash: { icon: <MdAttachMoney />, label: "Cash" },
  stripe: { icon: <MdCreditCard />, label: "Card" }
};

const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

const StatusBadge = ({ status, size = "sm" }) => {
  const cfg = STATUS_CFG[status] || { color: "#78716C", bg: "rgba(120,113,108,0.1)", border: "rgba(120,113,108,0.2)", label: status, icon: "○" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: size === "lg" ? 12 : 10, letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: size === "lg" ? "5px 12px" : "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: size === "lg" ? 13 : 10 }}>{cfg.icon}</span>{cfg.label}
    </span>
  );
};

const Avatar = ({ initials, size = 32 }) => <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: size * 0.35, color: "#F59E0B", flexShrink: 0, letterSpacing: "0.04em" }}>{initials}</div>;

const StatusSelect = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => !disabled && setOpen(o => !o)} disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "5px 10px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#78716C" }}>Update</span>
        <span style={{ color: "#44403C", fontSize: 10, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#1C1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", zIndex: 100, minWidth: 160 }}>
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <button key={key} onClick={() => { onChange(key); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: key === value ? `${cfg.bg}` : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => { if (key !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (key !== value) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14 }}>{cfg.icon}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: key === value ? cfg.color : "#78716C" }}>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ children }) => <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#3D3632", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;

const OrderDrawer = ({ order, onClose, onStatusChange }) => {
  if (!order) return null;
  const stepIdx = STATUS_FLOW.indexOf(order.status);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 201, width: 420, background: "#131110", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", animation: "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#131110", zIndex: 1 }}>
          <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#44403C", textTransform: "uppercase", marginBottom: 4 }}>Order Details</div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#F5F5F4", letterSpacing: "0.04em" }}>{order.order_number}</div><div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#44403C", marginTop: 2 }}>{timeAgo(order.created_at)}</div></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", color: "#78716C", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <div><SectionLabel>Current Status</SectionLabel><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><StatusBadge status={order.status} size="lg" /><StatusSelect value={order.status} onChange={(s) => onStatusChange(order.id, s)} /></div>
            {order.status !== "cancelled" && (
              <div style={{ marginTop: 16, display: "flex", gap: 4 }}>{STATUS_FLOW.map((s, i) => (<div key={s} style={{ flex: 1 }}><div style={{ height: 3, borderRadius: 2, background: i <= stepIdx ? STATUS_CFG[STATUS_FLOW[i]].color : "rgba(255,255,255,0.07)" }} /><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: i <= stepIdx ? STATUS_CFG[STATUS_FLOW[i]].color : "#2D2926", marginTop: 4, textAlign: "center" }}>{STATUS_CFG[s].label}</div></div>))}</div>
            )}
          </div>
          <div><SectionLabel>Customer</SectionLabel><div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar initials={order.customer.avatar} size={40} /><div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: "#F5F5F4", letterSpacing: "0.04em" }}>{order.customer.name}</div><div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#57534E" }}>{order.customer.email}</div></div></div></div>
          <div><SectionLabel>Delivery Address</SectionLabel><div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#A8A29E", lineHeight: 1.5 }}><MdLocationOn style={{ verticalAlign: 'middle', marginRight: 4 }} /> {order.address}</div></div>
          <div><SectionLabel>Order Items</SectionLabel><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{order.items.map((item, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}><span style={{ fontSize: 22, flexShrink: 0, color: "#F59E0B" }}>{item.icon}</span><div style={{ flex: 1 }}><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4", letterSpacing: "0.04em" }}>{item.name}</div><div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#44403C" }}>× {item.qty}</div></div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: "#F59E0B", letterSpacing: "0.03em" }}>${(item.price * item.qty).toFixed(2)}</div></div>))}</div></div>
          <div><SectionLabel>Payment</SectionLabel><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 18 }}>{PAYMENT_CFG[order.payment]?.icon}</span><span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#A8A29E", letterSpacing: "0.06em" }}>{PAYMENT_CFG[order.payment]?.label}</span></div><div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#F59E0B", letterSpacing: "0.03em" }}>${order.total.toFixed(2)}</div></div></div></div>
          {order.status === "pending" && (<button onClick={() => { onStatusChange(order.id, "preparing"); onClose(); }} style={{ width: "100%", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px", borderRadius: 12 }}><MdRestaurant style={{ verticalAlign: 'middle', marginRight: 8 }} /> Accept & Start Preparing</button>)}
        </div>
      </div>
    </>
  );
};

const StatPill = ({ status, count, active, onClick }) => {
  const cfg = STATUS_CFG[status] || { color: "#78716C", bg: "rgba(120,113,108,0.1)", border: "rgba(120,113,108,0.15)", label: "All", icon: <MdList /> };
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: active ? cfg.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.07)"}`, cursor: "pointer", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 14 }}>{cfg.icon}</span><span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? cfg.color : "#57534E" }}>{cfg.label}</span><span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: active ? cfg.color : "#3D3632", background: active ? `${cfg.color}20` : "rgba(255,255,255,0.05)", padding: "0 7px", borderRadius: 999 }}>{count}</span>
    </button>
  );
};

/* ─── Main Admin Orders ────────────────────────────────────────────── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Transform backend data to match frontend structure
        const transformedOrders = response.data.data.orders.map(order => {
          // Map backend status to frontend status
          let frontendStatus = order.status;
          if (order.status === 'confirmed') frontendStatus = 'preparing';
          else if (order.status === 'ready') frontendStatus = 'preparing';
          else if (order.status === 'out_for_delivery') frontendStatus = 'on_the_way';

          // Get initials from customer name
          const nameParts = order.customer_name ? order.customer_name.split(' ') : ['U', 'N'];
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : nameParts[0].substring(0, 2).toUpperCase();

          return {
            id: order.id,
            order_number: order.order_number,
            customer: {
              name: order.customer_name || 'Unknown',
              email: order.customer_email || 'No email',
              avatar: initials
            },
            items: order.items ? order.items.map(item => ({
              icon: <MdFastfood />,
              name: item.product_name,
              qty: item.quantity,
              price: parseFloat(item.unit_price)
            })) : [],
            total: parseFloat(order.total_amount),
            status: frontendStatus,
            payment: order.payment_method || 'card',
            address: order.delivery_address || 'No address',
            created_at: order.created_at,
            driver: null // Backend doesn't have driver info yet
          };
        });

        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');

      // Map frontend status back to backend status
      let backendStatus = status;
      if (status === 'preparing') backendStatus = 'preparing';
      else if (status === 'on_the_way') backendStatus = 'out_for_delivery';
      else if (status === 'delivered') backendStatus = 'delivered';
      else if (status === 'cancelled') backendStatus = 'cancelled';
      else if (status === 'pending') backendStatus = 'pending';

      await axios.put(`${API_BASE}/api/orders/${id}/status`,
        { status: backendStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

      // Update drawer if open
      if (drawerOrder && drawerOrder.id === id) {
        setDrawerOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const toggleSelect = (id) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => (selectedIds.size === filtered.length) ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(o => o.id)));
  const bulkUpdate = (status) => {
    selectedIds.forEach(id => updateStatus(id, status));
    setSelectedIds(new Set());
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = { all: orders.length, ...Object.fromEntries(Object.keys(STATUS_CFG).map(s => [s, orders.filter(o => o.status === s).length])) };
  const filtered = orders
    .filter(o => (statusFilter === "all" || o.status === statusFilter) && (search === "" || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => { if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at); if (sortBy === "highest") return b.total - a.total; return 0; });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "#F59E0B" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍔</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, letterSpacing: "0.1em" }}>Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "#EF4444" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, letterSpacing: "0.1em", marginBottom: 16 }}>{error}</div>
          <button onClick={fetchOrders} style={{ background: "#F59E0B", color: "#1C1917", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.35s ease" }}>
      <div style={{ background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "32px 40px 0" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.03em", color: "#F5F5F4" }}>Order Management</h1></div>
            <div style={{ display: "flex", gap: 10 }}><button onClick={handleRefresh} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#78716C", padding: "9px 16px", borderRadius: 10 }}><span style={{ animation: refreshing ? "spin 1s linear infinite" : "none", display: "inline-block" }}><MdRefresh /></span> {refreshing ? "Refreshing…" : "Refresh"}</button></div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16 }}><StatPill status="all" count={counts.all} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />{Object.keys(STATUS_CFG).map(s => (<StatPill key={s} status={s} count={counts[s] || 0} active={statusFilter === s} onClick={() => setStatusFilter(s)} />))}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 40px 60px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}><div style={{ position: "relative", flex: 1 }}><span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}><MdSearch /></span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" style={{ width: "100%", padding: "10px 12px 10px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#F5F5F4", outline: "none" }} /></div><select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#78716C" }}><option value="newest">Newest</option><option value="highest">Highest</option></select></div>
        {selectedIds.size > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}><span style={{ color: "#F59E0B" }}>{selectedIds.size} selected</span><div style={{ width: 1, height: 16, background: "rgba(245,158,11,0.2)" }} />{["preparing", "on_the_way", "delivered", "cancelled"].map(s => (<button key={s} onClick={() => bulkUpdate(s)} style={{ color: STATUS_CFG[s].color, background: STATUS_CFG[s].bg, border: `1px solid ${STATUS_CFG[s].border}`, padding: "4px 10px", borderRadius: 999 }}>{STATUS_CFG[s].label}</button>))}<button onClick={() => setSelectedIds(new Set())} style={{ marginLeft: "auto", background: "none", border: "none", color: "#44403C" }}>✕</button></div>)}
        <div style={{ background: "#0F0D0B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 140px 1fr 70px 100px 120px 90px 110px", padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", gap: 8 }}><div onClick={toggleAll} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}><div style={{ width: 16, height: 16, borderRadius: 4, background: selectedIds.size === filtered.length && filtered.length > 0 ? "#F59E0B" : "transparent", border: "2px solid rgba(255,255,255,0.15)" }} /></div>{["Order ID", "Customer", "Items", "Total", "Status", "Payment", "Actions"].map(h => (<span key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3D3632" }}>{h}</span>))}</div>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#57534E" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, letterSpacing: "0.1em" }}>No orders found</div>
            </div>
          ) : (
            filtered.map((order, i) => (<div key={order.id} style={{ display: "grid", gridTemplateColumns: "40px 140px 1fr 70px 100px 120px 90px 110px", padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 8, background: selectedIds.has(order.id) ? "rgba(245,158,11,0.04)" : "transparent" }}><div onClick={() => toggleSelect(order.id)} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}><div style={{ width: 16, height: 16, borderRadius: 4, background: selectedIds.has(order.id) ? "#F59E0B" : "transparent", border: "2px solid rgba(255,255,255,0.12)" }} /></div><div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4" }}>{order.order_number}</div><div style={{ color: "#3D3632", fontSize: 11 }}>{timeAgo(order.created_at)}</div></div><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar initials={order.customer.avatar} size={28} /><div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#D6D3D1" }}>{order.customer.name}</div><div style={{ color: "#3D3632", fontSize: 11 }}>{order.customer.email}</div></div></div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#57534E" }}>{order.items.length}</div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#F59E0B" }}>${order.total.toFixed(2)}</div><StatusBadge status={order.status} /><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 15 }}>{PAYMENT_CFG[order.payment]?.icon}</span><span style={{ fontSize: 11, color: "#44403C" }}>{PAYMENT_CFG[order.payment]?.label}</span></div><div style={{ display: "flex", gap: 6, alignItems: "center" }}><button onClick={() => setDrawerOrder(order)} style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", color: "#44403C", display: "flex", alignItems: "center", justifyContent: "center" }}><MdVisibility /></button><StatusSelect value={order.status} onChange={(s) => updateStatus(order.id, s)} /></div></div>))
          )}
        </div>
      </div>
      <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} onStatusChange={(id, s) => { updateStatus(id, s); setDrawerOrder(prev => prev ? { ...prev, status: s } : null); }} />
    </div>
  );
}
