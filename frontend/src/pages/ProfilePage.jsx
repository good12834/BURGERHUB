
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />
  </>
);

/* ─── Mock user ──────────────────────────────────────────────────────── */
const MOCK_USER = {
  name: "Alex Johnson",
  email: "alex@burgerhub.com",
  phone: "+972-50-555-1234",
  address: "14 Jaffa Road, Jerusalem, 9423117",
  joined: "March 2024",
  initials: "AJ",
  totalOrders: 31,
  totalSpent: 724.50,
  favoriteItem: "Truffle Royale",
};

const MOCK_ORDERS = [
  {
    id: "BH-20482", date: "Mar 6, 2026", items: 3, total: 47.97, status: "delivered",
    orderItems: [
      { id: 1, name: "Classic Cheeseburger", price: 12.99, quantity: 2 },
      { id: 5, name: "Loaded Fries", price: 7.99, quantity: 1 },
      { id: 12, name: "Chocolate Shake", price: 4.99, quantity: 1 }
    ]
  },
  {
    id: "BH-20471", date: "Feb 28, 2026", items: 4, total: 59.96, status: "delivered",
    orderItems: [
      { id: 2, name: "Double Smash Burger", price: 14.99, quantity: 2 },
      { id: 6, name: "Truffle Fries", price: 8.99, quantity: 2 }
    ]
  },
  {
    id: "BH-20459", date: "Feb 19, 2026", items: 2, total: 22.98, status: "delivered",
    orderItems: [
      { id: 1, name: "Classic Cheeseburger", price: 12.99, quantity: 1 },
      { id: 7, name: "Onion Rings", price: 5.99, quantity: 1 }
    ]
  },
  {
    id: "BH-20441", date: "Feb 10, 2026", items: 1, total: 16.99, status: "delivered",
    orderItems: [
      { id: 3, name: "Bacon BBQ Burger", price: 15.99, quantity: 1 }
    ]
  },
  {
    id: "BH-20430", date: "Feb 1, 2026", items: 3, total: 38.97, status: "cancelled",
    orderItems: [
      { id: 4, name: "Mushroom Swiss", price: 13.99, quantity: 2 },
      { id: 8, name: "Caesar Salad", price: 7.99, quantity: 1 }
    ]
  },
];

const SAVED_ADDRESSES = [
  { id: 1, label: "🏠 Home", line: "14 Jaffa Road, Jerusalem, 9423117", default: true },
  { id: 2, label: "💼 Work", line: "3 Herzl St, Tel Aviv, 6578901", default: false },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const statusCfg = {
  delivered: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Delivered" },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Cancelled" },
  on_the_way: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", label: "On the Way" },
  preparing: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Preparing" },
};

/* ─── Reusable field ─────────────────────────────────────────────────── */
const Field = ({ label, value, onChange, disabled, type = "text", placeholder, rows, locked, error }) => {
  const [focused, setFocused] = useState(false);
  const Tag = rows ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: disabled ? "#2D2926" : focused ? "#F59E0B" : "#44403C", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        {locked && <span style={{ fontSize: 10, opacity: 0.4 }}>🔒</span>}
      </label>
      <Tag type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", padding: "11px 14px", background: disabled ? "rgba(255,255,255,0.02)" : focused ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${error ? "#EF4444" : disabled ? "rgba(255,255,255,0.05)" : focused ? "#F59E0B" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: disabled ? "#44403C" : "#F5F5F4", fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: "none", transition: "all 0.2s", resize: rows ? "vertical" : undefined, boxSizing: "border-box", minHeight: rows ? rows * 28 : undefined, cursor: disabled ? "not-allowed" : undefined }}
      />
      {error && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#EF4444" }}>⚠ {error}</span>}
    </div>
  );
};

/* ─── Section card ───────────────────────────────────────────────────── */
const Section = ({ children, style = {} }) => (
  <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "26px 28px", ...style }}>
    {children}
  </div>
);

const SectionHead = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
    <div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1.1 }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#3D3632", marginTop: 4 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

/* ─── Tab nav ────────────────────────────────────────────────────────── */
const TABS = [
  { key: "profile", icon: "👤", label: "Profile" },
  { key: "orders", icon: "🧾", label: "Orders" },
  { key: "addresses", icon: "📍", label: "Addresses" },
  { key: "security", icon: "🔐", label: "Security" },
];

/* ─── Toast ──────────────────────────────────────────────────────────── */
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  return [toast, show];
};

/* ─── Password strength ──────────────────────────────────────────────── */
const pwStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "#3D3632" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#60A5FA", "#22C55E"];
  return { score, label: labels[score], color: colors[score] };
};

/* ─── MAIN ───────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [tab, setTab] = useState("profile");
  const [pageIn, setPageIn] = useState(false);
  const [toast, showToast] = useToast();

  // Profile form
  const [user, setUser] = useState(MOCK_USER);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...MOCK_USER });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  // Addresses
  const [addresses, setAddresses] = useState(SAVED_ADDRESSES);

  // Preferences
  const [preferences, setPreferences] = useState({ emails: true, sms: true, promos: true });

  // Reorder - add items from a previous order to cart
  const handleReorder = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
        addToCart(
          { id: item.id, name: item.name, price: item.price, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
          item.quantity
        );
      });
      showToast(`${order.items} items added to cart!`);
      // Navigate to cart after a brief delay
      setTimeout(() => navigate('/cart'), 1000);
    }
  };

  useEffect(() => { const t = setTimeout(() => setPageIn(true), 80); return () => clearTimeout(t); }, []);

  const cancelEdit = () => { setForm({ ...user }); setEditMode(false); setFormErrors({}); };

  const validateProfile = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setFormErrors(e);
    return !Object.keys(e).length;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setUser({ ...form });
    setSaving(false);
    setEditMode(false);
    showToast("Profile updated successfully!");
  };

  const validatePassword = () => {
    const e = {};
    if (!pwForm.current) e.current = "Current password required";
    if (pwForm.next.length < 6) e.next = "At least 6 characters";
    if (pwForm.next !== pwForm.confirm) e.confirm = "Passwords don't match";
    setPwErrors(e);
    return !Object.keys(e).length;
  };

  const changePassword = async () => {
    if (!validatePassword()) return;
    setPwSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setPwSaving(false);
    setPwForm({ current: "", next: "", confirm: "" });
    showToast("Password changed successfully!");
  };

  const strength = pwStrength(pwForm.next);

  /* Tab views */
  const renderTab = () => {
    switch (tab) {
      /* ── PROFILE ── */
      case "profile": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Section>
            <SectionHead
              title="Personal Info"
              subtitle="Your name, phone, and delivery address"
              action={
                <button onClick={() => editMode ? cancelEdit() : setEditMode(true)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: editMode ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.1)", border: `1px solid ${editMode ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`, color: editMode ? "#EF4444" : "#F59E0B", cursor: "pointer", padding: "8px 16px", borderRadius: 9, transition: "all 0.2s" }}>
                  {editMode ? "✕ Cancel" : "✏️ Edit"}
                </button>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Full Name" value={editMode ? form.name : user.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editMode} error={formErrors.name} />
                <Field label="Email Address" value={user.email} disabled locked />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Phone Number" value={editMode ? form.phone : user.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editMode} placeholder="+972-50-000-0000" error={formErrors.phone} />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: "#2D2926", textTransform: "uppercase", marginBottom: 5 }}>Member Since</div>
                  <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.05)", borderRadius: 10, fontFamily: "'Barlow',sans-serif", fontSize: 14, color: "#44403C" }}>{user.joined}</div>
                </div>
              </div>
              <Field label="Default Address" value={editMode ? form.address : user.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} disabled={!editMode} rows={2} />
            </div>

            {editMode && (
              <div style={{ marginTop: 20, display: "flex", gap: 10, animation: "fadeIn 0.25s ease" }}>
                <button onClick={saveProfile} disabled={saving} style={{ flex: 2, padding: "12px", background: saving ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {saving ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Saving…</> : "✓ Save Changes"}
                </button>
                <button onClick={cancelEdit} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#78716C", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cancel</button>
              </div>
            )}
          </Section>

          {/* Preferences */}
          <Section>
            <SectionHead title="Preferences" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "emails", label: "📧 Order confirmation emails", sub: "Get notified when your order is confirmed" },
                { key: "sms", label: "💬 SMS delivery updates", sub: "Real-time texts as your order progresses" },
                { key: "promos", label: "🏷 Promotional offers & deals", sub: "Special deals and exclusive offers" },
              ].map(pref => {
                const isOn = preferences[pref.key];
                return (
                  <div key={pref.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: "#F5F5F4", letterSpacing: "0.04em" }}>{pref.label}</div>
                      <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#3D3632", marginTop: 2 }}>{pref.sub}</div>
                    </div>
                    <button onClick={() => setPreferences(p => ({ ...p, [pref.key]: !p[pref.key] }))} style={{ width: 44, height: 24, borderRadius: 999, background: isOn ? "#F59E0B" : "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: isOn ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      );

      /* ── ORDERS ── */
      case "orders": return (
        <Section>
          <SectionHead title="Order History" subtitle={`${user.totalOrders} orders · $${user.totalSpent.toFixed(2)} total spent`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_ORDERS.map((order, i) => {
              const cfg = statusCfg[order.status] || statusCfg.delivered;
              return (
                <div key={order.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, gap: 12, flexWrap: "wrap", animation: `rowIn 0.3s ease ${i * 50}ms both`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.035)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                >
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: "#F5F5F4", letterSpacing: "0.04em" }}>{order.id}</div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#3D3632", marginTop: 2 }}>{order.date} · {order.items} item{order.items !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F59E0B", letterSpacing: "0.03em" }}>${order.total.toFixed(2)}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, padding: "3px 9px", borderRadius: 999 }}>
                      {cfg.label}
                    </span>
                    {order.status === "delivered" && (
                      <button onClick={() => handleReorder(order)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", cursor: "pointer", padding: "5px 12px", borderRadius: 8, whiteSpace: "nowrap", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.15)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; }}
                      >Reorder</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      );

      /* ── ADDRESSES ── */
      case "addresses": return (
        <Section>
          <SectionHead title="Saved Addresses"
            action={
              <button style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 9 }}>
                + Add Address
              </button>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", background: addr.default ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${addr.default ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: "#F5F5F4", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}>
                    {addr.label}
                    {addr.default && <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#F59E0B", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", padding: "2px 7px", borderRadius: 999 }}>Default</span>}
                  </div>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#57534E", marginTop: 4 }}>{addr.line}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!addr.default && (
                    <button onClick={() => setAddresses(a => a.map(x => ({ ...x, default: x.id === addr.id })))} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#57534E", cursor: "pointer", padding: "5px 10px", borderRadius: 7, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#F59E0B"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#57534E"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
                    >Set Default</button>
                  )}
                  <button style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#57534E", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#F59E0B"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#57534E"; }}
                  >✏️</button>
                  <button onClick={() => setAddresses(a => a.filter(x => x.id !== addr.id))} style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#78716C", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#EF4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#78716C"; }}
                  >🗑</button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 12 }}>
                <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 8 }}>📍</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#3D3632" }}>No saved addresses</div>
              </div>
            )}
          </div>
        </Section>
      );

      /* ── SECURITY ── */
      case "security": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Password change */}
          <Section>
            <SectionHead title="Change Password" subtitle="Use a strong password you don't use elsewhere" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
              {[
                { key: "current", label: "Current Password" },
                { key: "next", label: "New Password" },
                { key: "confirm", label: "Confirm Password" },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: "#44403C", textTransform: "uppercase" }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[key] ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "11px 42px 11px 14px", background: "rgba(255,255,255,0.04)", border: `1.5px solid ${pwErrors[key] ? "#EF4444" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: "#F5F5F4", fontFamily: "'Barlow',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = pwErrors[key] ? "#EF4444" : "#F59E0B"}
                      onBlur={e => e.target.style.borderColor = pwErrors[key] ? "#EF4444" : "rgba(255,255,255,0.1)"}
                    />
                    <button onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#44403C", padding: 2, fontFamily: "'Material Symbols Outlined', sans-serif" }}>
                      {showPw[key] ? <span className="material-symbols-outlined">visibility_off</span> : <span className="material-symbols-outlined">visibility</span>}
                    </button>
                  </div>
                  {pwErrors[key] && <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#EF4444" }}>⚠ {pwErrors[key]}</span>}
                  {/* Strength bar (new password only) */}
                  {key === "next" && pwForm.next && (
                    <div style={{ animation: "fadeIn 0.2s" }}>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
                        <div style={{ height: "100%", width: `${(strength.score / 4) * 100}%`, background: strength.color, borderRadius: 2, transition: "all 0.4s ease" }} />
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: "0.12em", color: strength.color, marginTop: 3 }}>{strength.label}</div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={changePassword} disabled={pwSaving} style={{ padding: "13px", background: pwSaving ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", borderRadius: 10, cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {pwSaving ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Updating…</> : "🔐 Update Password"}
              </button>
            </div>
          </Section>

          {/* Security info */}
          <Section>
            <SectionHead title="Account Security" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✅", label: "Email verified", sub: "alex@burgerhub.com", positive: true },
                { icon: "✅", label: "Two-factor auth", sub: "Not enabled — consider enabling", positive: false },
                { icon: "🕒", label: "Last login", sub: "Today, from Jerusalem IL", positive: true },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4", letterSpacing: "0.04em" }}>{item.label}</div>
                    <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: item.positive ? "#57534E" : "#F59E0B", marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Danger zone */}
          <Section style={{ borderColor: "rgba(239,68,68,0.15)" }}>
            <SectionHead title="Danger Zone" subtitle="Irreversible account actions" />
            <button style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", cursor: "pointer", padding: "10px 20px", borderRadius: 9, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
            >
              🗑 Delete Account
            </button>
          </Section>
        </div>
      );
    }
  };

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        input::placeholder, textarea::placeholder { color: #3D3632; }
        input[type=password]::-ms-reveal { display: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2D2926; border-radius: 2px; }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rowIn    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes toastIn  { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 768px) {
          .profile-layout { flex-direction: column !important; }
          .profile-sidebar { width: 100% !important; flex-direction: row !important; align-items: center !important; }
          .tab-nav { flex-direction: row !important; overflow-x: auto; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 500, background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`, color: toast.type === "success" ? "#22C55E" : "#EF4444", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "toastIn 0.3s ease", whiteSpace: "nowrap" }}>
            ✓ {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "36px 40px 28px", opacity: pageIn ? 1 : 0, transform: pageIn ? "none" : "translateY(10px)", transition: "all 0.5s 0.1s" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 6 }}>Your Account</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(32px,5vw,52px)", letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95 }}>My Profile</h1>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px 60px" }}>
          <div className="profile-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

            {/* ── LEFT: Avatar + nav ── */}
            <div className="profile-sidebar" style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 84 }}>
              {/* Avatar card */}
              <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px", textAlign: "center", animation: "slideUp 0.4s ease 0.2s both" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#1C1917", letterSpacing: "0.04em", boxShadow: "0 0 24px rgba(245,158,11,0.3)" }}>
                  {user.initials}
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#F5F5F4", letterSpacing: "0.04em" }}>{user.name}</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#3D3632", marginTop: 2 }}>{user.email}</div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F59E0B" }}>{user.totalOrders}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#2D2926", textTransform: "uppercase" }}>Orders</div>
                  </div>
                  <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F59E0B" }}>${user.totalSpent.toFixed(0)}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, letterSpacing: "0.18em", color: "#2D2926", textTransform: "uppercase" }}>Spent</div>
                  </div>
                </div>
              </div>

              {/* Tab nav */}
              <div className="tab-nav" style={{ display: "flex", flexDirection: "column", gap: 3, background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 8, animation: "slideUp 0.4s ease 0.3s both" }}>
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: tab === t.key ? "rgba(245,158,11,0.1)" : "transparent", border: `1px solid ${tab === t.key ? "rgba(245,158,11,0.25)" : "transparent"}`, cursor: "pointer", transition: "all 0.15s", width: "100%", textAlign: "left" }}
                    onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: tab === t.key ? "#F59E0B" : "#44403C" }}>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Logout */}
              <button style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#57534E", cursor: "pointer", padding: "10px", borderRadius: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#57534E"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}
              >
                Sign Out →
              </button>
            </div>

            {/* ── RIGHT: Content ── */}
            <div style={{ flex: 1, minWidth: 0, animation: "fadeIn 0.4s ease 0.25s both" }} key={tab}>
              {renderTab()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}