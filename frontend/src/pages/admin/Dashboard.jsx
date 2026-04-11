import { useState, useEffect } from "react";
import {
  MdReceipt,
  MdAttachMoney,
  MdPeople,
  MdAccessTime,
  MdFastfood,
  MdRestaurant,
  MdLocalFireDepartment,
  MdGrass,
  MdCookie
} from "react-icons/md";

/* ─── Mock Data ──────────────────────────────────────────────────────── */
const WEEKLY_REVENUE = [1200, 1900, 1400, 2100, 2800, 3500, 3100];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ORDER_STATUSES = [
  { label: "Delivered", count: 84, color: "#22C55E" },
  { label: "Preparing", count: 23, color: "#F59E0B" },
  { label: "On the Way", count: 12, color: "#60A5FA" },
  { label: "Pending", count: 8, color: "#F97316" },
  { label: "Cancelled", count: 4, color: "#EF4444" },
];

const TOP_PRODUCTS = [
  { name: "Truffle Royale", sold: 312, revenue: 5311.88, icon: <MdFastfood />, trend: +14 },
  { name: "Bacon Overload", sold: 287, revenue: 4013.13, icon: <MdRestaurant />, trend: +8 },
  { name: "OG Classic", sold: 241, revenue: 2165.59, icon: <MdFastfood />, trend: +3 },
  { name: "Truffle Fries", sold: 198, revenue: 1384.02, icon: <MdLocalFireDepartment />, trend: -2 },
  { name: "Inferno BBQ", sold: 176, revenue: 2286.24, icon: <MdLocalFireDepartment />, trend: +19 },
];

const RECENT_ORDERS = [
  { id: "BH-20482", customer: "Alex R.", items: 3, total: 47.97, status: "delivered", time: "2 min ago" },
  { id: "BH-20481", customer: "Lena K.", items: 2, total: 29.98, status: "on_the_way", time: "8 min ago" },
  { id: "BH-20480", customer: "Omar S.", items: 4, total: 61.96, status: "preparing", time: "14 min ago" },
  { id: "BH-20479", customer: "Dana M.", items: 1, total: 16.99, status: "pending", time: "19 min ago" },
  { id: "BH-20478", customer: "Tom H.", items: 2, total: 22.98, status: "delivered", time: "24 min ago" },
  { id: "BH-20477", customer: "Sara L.", items: 5, total: 74.95, status: "cancelled", time: "31 min ago" },
];

/* ─── Components ─────────────────────────────────────────────────────── */
function useCounter(target, run, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * p * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [run, target, duration]);
  return val;
}

const StatCard = ({ icon, label, value, prefix = "", suffix = "", trend, color, run, delay }) => {
  const num = useCounter(typeof value === "number" ? value : 0, run);
  return (
    <div style={{
      background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 24px",
      display: "flex", flexDirection: "column", gap: 12, opacity: run ? 1 : 0,
      transform: run ? "translateY(0)" : "translateY(16px)", transition: `all 0.5s ease ${delay}ms`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}15`, pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: trend >= 0 ? "#22C55E" : "#EF4444", background: trend >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${trend >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, padding: "2px 8px", borderRadius: 999 }}>{trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.15em", color: "#44403C", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#F5F5F4", letterSpacing: "0.03em", lineHeight: 1 }}>{prefix}{typeof value === "number" ? num.toLocaleString() : value}{suffix}</div>
      </div>
    </div>
  );
};

const SparklineChart = ({ data, days }) => {
  const W = 500, H = 140, PAD = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const areaD = `${pathD} L ${PAD + W - PAD * 2},${H - PAD} L ${PAD},${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140, overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" /><stop offset="100%" stopColor="#F59E0B" stopOpacity="0" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0.25, 0.5, 0.75].map((r, i) => <line key={i} x1={PAD} y1={PAD + r * (H - PAD * 2)} x2={W - PAD} y2={PAD + r * (H - PAD * 2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
      <path d={areaD} fill="url(#areaGrad)" /><path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      {data.map((v, i) => {
        const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#F59E0B" stroke="#0C0A09" strokeWidth={2} />
            <text x={x} y={H} textAnchor="middle" fontSize={10} fontFamily="'Barlow Condensed', sans-serif" fill="#44403C" letterSpacing="1">{days[i]}</text>
            <text x={x} y={y - 10} textAnchor="middle" fontSize={9} fontFamily="'Barlow Condensed', sans-serif" fill="#78716C">${(v / 1000).toFixed(1)}k</text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const R = 60, CX = 80, CY = 80, STROKE = 18;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={160} height={160} viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        {data.map((d, i) => {
          const dashLen = (d.count / total) * circ;
          const seg = <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={d.color} strokeWidth={STROKE} strokeDasharray={`${dashLen} ${circ - dashLen}`} strokeDashoffset={-offset} strokeLinecap="butt" style={{ transform: "rotate(-90deg)", transformOrigin: `${CX}px ${CY}px`, transition: "stroke-dasharray 1s ease" }} />;
          offset += dashLen; return seg;
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={20} fontFamily="'Bebas Neue', sans-serif" fill="#F5F5F4" letterSpacing="1">{total}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fontFamily="'Barlow Condensed', sans-serif" fill="#44403C" letterSpacing="2">ORDERS</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#78716C" }}>{d.label}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: "#A8A29E", marginLeft: "auto" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = { delivered: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Delivered" }, on_the_way: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)", label: "On the Way" }, preparing: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Preparing" }, pending: { color: "#F97316", bg: "rgba(249,115,22,0.1)", label: "Pending" }, cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Cancelled" } }[status] || { color: "#78716C", bg: "rgba(120,113,108,0.1)", label: status };
  return <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{cfg.label}</span>;
};

const SH = ({ title, action }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#F5F5F4", letterSpacing: "0.04em" }}>{title}</div>
    {action && <button onClick={action.fn} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", background: "none", border: "none", cursor: "pointer" }}>{action.label}</button>}
  </div>
);

const Card = ({ children, style = {} }) => <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 24px", ...style }}>{children}</div>;

/* ─── Main Admin Dash (Overview Content Only) ────────────────────────── */
export default function AdminDashboard() {
  const [run, setRun] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRun(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ padding: "28px 32px 48px", animation: "fadeIn 0.35s ease", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { icon: <MdReceipt />, label: "Orders Today", value: 124, trend: +12, color: "#60A5FA", delay: 0 },
            { icon: <MdAttachMoney />, label: "Revenue Today", value: 3100, prefix: "$", trend: +8, color: "#22C55E", delay: 80 },
            { icon: <MdPeople />, label: "Active Customers", value: 2341, trend: +15, color: "#A78BFA", delay: 160 },
            { icon: <MdAccessTime />, label: "Pending Orders", value: 8, color: "#F97316", delay: 240 },
          ].map(s => <StatCard key={s.label} {...s} run={run} />)}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, flexWrap: "wrap" }}>
          <Card><SH title="Weekly Revenue" /><SparklineChart data={WEEKLY_REVENUE} days={DAYS} /></Card>
          <Card><SH title="Order Status" /><DonutChart data={ORDER_STATUSES} /></Card>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Top products */}
          <Card>
            <SH title="Top Selling" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "#F59E0B", flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 18, flexShrink: 0, color: "#F59E0B" }}>{p.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#44403C" }}>{p.sold} sold</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#A8A29E" }}>${p.revenue.toFixed(0)}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: p.trend >= 0 ? "#22C55E" : "#EF4444" }}>{p.trend >= 0 ? "↑" : "↓"}{Math.abs(p.trend)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent orders */}
          <Card>
            <SH title="Recent Orders" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {RECENT_ORDERS.map(order => (
                <div key={order.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4", letterSpacing: "0.04em" }}>{order.id}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#57534E" }}>{order.customer} · {order.time}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <StatusBadge status={order.status} /><span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#F59E0B", letterSpacing: "0.03em" }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}