import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard,
  MdReceipt,
  MdRestaurantMenu,
  MdPeople,
  MdLocalShipping,
  MdLocalOffer,
  MdAnalytics,
  MdSettings
} from 'react-icons/md';

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

const NAV_ITEMS = [
  { key: "overview", icon: <MdDashboard />, label: "Overview", path: "/admin" },
  { key: "orders", icon: <MdReceipt />, label: "Orders", path: "/admin/orders" },
  { key: "menu", icon: <MdRestaurantMenu />, label: "Menu Items", path: "/admin/products" },
  { key: "customers", icon: <MdPeople />, label: "Customers", path: "/admin/customers" },
  { key: "drivers", icon: <MdLocalShipping />, label: "Drivers", path: "/admin/drivers" },
  { key: "deals", icon: <MdLocalOffer />, label: "Deals", path: "/admin/deals" },
  { key: "analytics", icon: <MdAnalytics />, label: "Analytics", path: "/admin/analytics" },
  { key: "settings", icon: <MdSettings />, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const currentNavItem = NAV_ITEMS.find(item =>
      item.path === location.pathname ||
      (item.path !== "/admin" && location.pathname.startsWith(item.path))
    );
    if (currentNavItem) {
      setPageTitle(currentNavItem.label);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080705; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2D2926; border-radius: 2px; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        
        @media (max-width: 768px) {
          .sidebar-full { width: 60px !important; }
          .nav-label { display: none !important; }
          .main-content { margin-left: 60px !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#080705", color: "#F5F5F4", fontFamily: "'Barlow', sans-serif" }}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar-full" style={{
          width: sidebarCollapsed ? 64 : 220,
          background: "#0C0A09",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{
            padding: sidebarCollapsed ? "20px 0" : "20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            minHeight: 64,
          }}>
            {!sidebarCollapsed && (
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.06em", color: "#F5F5F4" }}>
                <MdRestaurantMenu style={{ color: '#F59E0B', fontSize: 22, verticalAlign: 'middle', marginRight: 4 }} />
                BURGER<span style={{ color: "#F59E0B" }}>HUB</span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(c => !c)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#44403C", fontSize: 16, padding: 4,
              flexShrink: 0,
            }}>
              {sidebarCollapsed ? "→" : "←"}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <Link key={item.key} to={item.path} style={{
                  display: "flex", alignItems: "center",
                  gap: sidebarCollapsed ? 0 : 12,
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  padding: sidebarCollapsed ? "10px" : "10px 12px",
                  borderRadius: 10,
                  background: active ? "rgba(245,158,11,0.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(245,158,11,0.25)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  width: "100%",
                  textDecoration: "none",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0, color: active ? "#F59E0B" : "#78716C" }}>{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="nav-label" style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, fontSize: 13, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: active ? "#F59E0B" : "#57534E",
                      whiteSpace: "nowrap",
                    }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin user */}
          <div style={{ padding: "16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#F59E0B,#D97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#1C1917",
              flexShrink: 0,
            }}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            {!sidebarCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4", truncate: "true" }}>{user?.name || 'Admin'}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, color: "#3D3632", truncate: "true", opacity: 0.8 }}>{user?.email}</div>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content" style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? 64 : 220,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Topbar */}
          <div style={{
            background: "#0C0A09",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 32px",
            height: 64, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0, zIndex: 90,
          }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#3D3632", textTransform: "uppercase" }}>
                BurgerHub Admin
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1.1 }}>
                {pageTitle}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Live indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#44403C", textTransform: "uppercase" }}>Live</span>
              </div>
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8, padding: "6px 12px",
                  cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#EF4444",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ padding: "0", position: "relative" }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
