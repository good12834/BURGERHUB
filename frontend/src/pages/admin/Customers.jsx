import { useState, useEffect } from "react";

/* ─── Mock Data (Enhanced) ───────────────────────────────────────────── */
const MOCK_CUSTOMERS = [
  { id: 1, name: "Alex Richardson", email: "alex.r@gmail.com", phone: "+972 54-123-4567", orders: 12, total_spent: 452.88, status: "active", avatar: "AR", joined: "2025-08-12", last_order: "2 mins ago" },
  { id: 2, name: "Lena Kowalski", email: "l.kowalski@outlook.com", phone: "+972 52-888-1122", orders: 5, total_spent: 129.50, status: "new", avatar: "LK", joined: "2026-02-15", last_order: "8 mins ago" },
  { id: 3, name: "Omar Suleiman", email: "omar_s@hotmial.com", phone: "+972 50-777-3344", orders: 28, total_spent: 1240.20, status: "vip", avatar: "OS", joined: "2024-11-05", last_order: "14 mins ago" },
  { id: 4, name: "Dana Miller", email: "dana.m@yahoo.com", phone: "+972 53-999-0011", orders: 1, total_spent: 16.99, status: "new", avatar: "DM", joined: "2026-03-01", last_order: "24 mins ago" },
  { id: 5, name: "Tom Hollander", email: "tom.h@gmail.com", phone: "+972 54-555-6677", orders: 15, total_spent: 312.45, status: "active", avatar: "TH", joined: "2025-10-20", last_order: "32 mins ago" },
  { id: 6, name: "Sara Levy", email: "sara.l@protonmail.com", phone: "+972 58-444-2211", orders: 0, total_spent: 0.00, status: "registered", avatar: "SL", joined: "2026-02-28", last_order: "Never" },
  { id: 7, name: "James Potter", email: "j.potter@hogwarts.edu", phone: "+972 50-111-2233", orders: 42, total_spent: 2150.12, status: "vip", avatar: "JP", joined: "2024-05-12", last_order: "1 hr ago" },
  { id: 8, name: "Nina Kraviz", email: "nina.k@techno.de", phone: "+972 52-333-4455", orders: 6, total_spent: 98.40, status: "active", avatar: "NK", joined: "2026-01-10", last_order: "3 hrs ago" },
];

const STATUS_CFG = {
  vip:        { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", label: "VIP ✨" },
  active:     { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",  label: "Active" },
  new:        { color: "#60A5FA", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)", label: "New Member" },
  registered: { color: "#A8A29E", bg: "rgba(168,162,158,0.1)", border: "rgba(168,162,158,0.25)", label: "Registered" },
};

/* ─── Components ─────────────────────────────────────────────────────── */
const Avatar = ({ initials, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))",
    border: "1px solid rgba(245,158,11,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: size * 0.38,
    color: "#F59E0B", flexShrink: 0,
    letterSpacing: "0.04em",
  }}>{initials}</div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.registered;
  return (
    <span style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{cfg.label}</span>
  );
};

/* ─── Drawer ─────────────────────────────────────────────────────────── */
const CustomerDrawer = ({ customer, onClose }) => {
  if (!customer) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 201, width: 440, background: "#131110", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", animation: "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#131110", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar initials={customer.avatar} size={52} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#F59E0B", textTransform: "uppercase" }}>Customer Profile</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F5F5F4", letterSpacing: "0.04em", marginTop: -2 }}>{customer.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", color: "#78716C", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#44403C", letterSpacing: "0.15em", textTransform: "uppercase" }}>Total Orders</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#F5F5F4", marginTop: 2 }}>{customer.orders}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#44403C", letterSpacing: "0.15em", textTransform: "uppercase" }}>Total Spent</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#22C55E", marginTop: 2 }}>${customer.total_spent.toFixed(0)}</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "#3D3632", textTransform: "uppercase", marginBottom: 12 }}>Contact Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 18, width: 20, textAlign: "center" }}>📧</span><span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#A8A29E" }}>{customer.email}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 18, width: 20, textAlign: "center" }}>📞</span><span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#A8A29E" }}>{customer.phone}</span></div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "#3D3632", textTransform: "uppercase", marginBottom: 12 }}>Recent Order History</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10 }}>
                  <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: "#F5F5F4" }}>#BH-204{82 - i}</div><div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: "#44403C" }}>{i + 1} days ago · 3 items</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#F5F5F4" }}>$34.9{i}</div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, color: "#22C55E", textTransform: "uppercase" }}>Delivered</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 12 }}><button style={{ flex: 1, padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#EF4444", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Restrict</button><button style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#F59E0B,#D97706)", border: "none", borderRadius: 10, color: "#1C1917", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Send Coupon</button></div>
      </div>
    </>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function Customers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [drawerUser, setDrawerUser] = useState(null);

  const filtered = MOCK_CUSTOMERS.filter(c =>
    (filter === "all" || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ animation: "fadeIn 0.35s ease" }}>
      <div style={{
        background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "36px 40px 24px",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95 }}>
                Customer Base
              </h1>
            </div>
            
            <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
              <div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#F5F5F4" }}>842</div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#3D3632", letterSpacing: "0.15em", textTransform: "uppercase" }}>Total Users</div></div>
              <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
              <div><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#22C55E" }}>12</div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#3D3632", letterSpacing: "0.15em", textTransform: "uppercase" }}>Joined Today</div></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.4 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                style={{ width: "100%", padding: "10px 12px 10px 38px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#F5F5F4", fontFamily: "'Barlow', sans-serif", fontSize: 13, outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "vip", "active", "new"].map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 10, cursor: "pointer", border: "1px solid", background: filter === t ? "rgba(245,158,11,0.12)" : "transparent", borderColor: filter === t ? "#F59E0B" : "rgba(255,255,255,0.09)", color: filter === t ? "#F59E0B" : "#57534E", transition: "all 0.2s" }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 40px 60px" }}>
        <div style={{ background: "#0F0D0B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 100px 110px 110px 100px 80px", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", gap: 12, alignItems: "center" }}>
            {["Customer", "Contact", "Orders", "Spent", "Last Active", "Status", "Actions"].map(h => (
              <span key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#3D3632" }}>{h}</span>
            ))}
          </div>
          {filtered.map((user, i) => (
            <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1fr 180px 100px 110px 110px 100px 80px", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 12, transition: "background 0.2s", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={() => setDrawerUser(user)}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar initials={user.avatar} size={36} /><div style={{ minWidth: 0 }}><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "#F5F5F4", letterSpacing: "0.03em" }}>{user.name}</div><div style={{ fontSize: 11, color: "#3D3632" }}>Joined {new Date(user.joined).getFullYear()}</div></div></div>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, color: "#A8A29E", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div><div style={{ fontSize: 11, color: "#3D3632" }}>{user.phone}</div></div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#A8A29E" }}>{user.orders}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#22C55E" }}>${user.total_spent.toFixed(0)}</div>
              <div style={{ fontSize: 12, color: "#57534E" }}>{user.last_order}</div>
              <StatusBadge status={user.status} />
              <div style={{ display: "flex", gap: 6 }}><button style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", color: "#44403C", display: "flex", alignItems: "center", justifyContent: "center" }}>👁</button></div>
            </div>
          ))}
        </div>
      </div>
      <CustomerDrawer customer={drawerUser} onClose={() => setDrawerUser(null)} />
    </div>
  );
}
