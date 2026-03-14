import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MdPerson, 
  MdShoppingBag, 
  MdFavorite, 
  MdLogout, 
  MdFastfood,
  MdShoppingCart,
  MdMenu,
  MdClose,
  MdKeyboardArrowDown
} from "react-icons/md";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// ─── SVG Icons ────────────────────────────────────────────────────────
const BurgerIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="18" fill="#F59E0B" />
    <rect x="8" y="13" width="20" height="3" rx="1.5" fill="#92400E" />
    <rect x="8" y="17" width="20" height="3" rx="1.5" fill="#78350F" />
    <rect x="8" y="21" width="20" height="3" rx="1.5" fill="#92400E" />
    <path d="M8 13.5 Q18 9 28 13.5" stroke="#FDE68A" strokeWidth="2" fill="none" />
  </svg>
);

const CartIcon = ({ count }) => (
  <div style={{ position: "relative", display: "inline-flex" }}>
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M3 3h2l2.5 12h11l2-8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
    {count > 0 && (
      <span style={{
        position: "absolute", top: -6, right: -6,
        background: "#EF4444", color: "#fff",
        fontSize: 10, fontWeight: 800,
        width: 18, height: 18, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: 0,
        boxShadow: "0 0 0 2px #1C1917",
        animation: "cartPop 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {count}
      </span>
    )}
  </div>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MenuHamburger = ({ open }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y={open ? "11" : "5"} width="18" height="2" rx="1" fill="currentColor"
      style={{ transition: "all 0.3s", transform: open ? "rotate(45deg)" : "none", transformOrigin: "center" }} />
    <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"
      style={{ opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
    <rect x="3" y={open ? "11" : "17"} width="18" height="2" rx="1" fill="currentColor"
      style={{ transition: "all 0.3s", transform: open ? "rotate(-45deg)" : "none", transformOrigin: "center" }} />
  </svg>
);

// ─── Nav Link ─────────────────────────────────────────────────────────
const NavLink = ({ href = "#", children, badge }) => {
  const [hovered, setHovered] = useState(false);
  const isExternal = href.startsWith("http");

  const baseStyle = {
    position: "relative",
    color: hovered ? "#F59E0B" : "#D6D3D1",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: "4px 0",
    transition: "color 0.2s",
    display: "flex", alignItems: "center", gap: 6,
  };

  const linkContent = (
    <>
      {children}
      {badge && (
        <span style={{
          background: "#EF4444", color: "#fff",
          fontSize: 9, fontWeight: 800, padding: "1px 5px",
          borderRadius: 999, letterSpacing: "0.05em",
        }}>
          {badge}
        </span>
      )}
      <span style={{
        position: "absolute", bottom: -2, left: 0,
        height: 2, background: "#F59E0B", borderRadius: 1,
        width: hovered ? "100%" : "0%",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={baseStyle}
      >
        {linkContent}
      </a>
    );
  }

  return (
    <Link
      to={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={baseStyle}
    >
      {linkContent}
    </Link>
  );
};

// ─── Dropdown Menu ────────────────────────────────────────────────────
const UserDropdown = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: open ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)",
          border: "1px solid",
          borderColor: open ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)",
          color: "#F5F5F4",
          padding: "7px 14px",
          borderRadius: 999,
          cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600, fontSize: 14, letterSpacing: "0.06em",
          transition: "all 0.2s",
        }}
      >
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "linear-gradient(135deg,#F59E0B,#D97706)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "#1C1917",
        }}>
          {user.name[0].toUpperCase()}
        </span>
        {user.name}
        <span style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", display: "flex" }}>
          <MdKeyboardArrowDown size={18} />
        </span>
      </button>

      <div style={{
        position: "absolute", top: "calc(100% + 10px)", right: 0,
        background: "#1C1917",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 12,
        minWidth: 190,
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        overflow: "hidden",
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
        pointerEvents: open ? "all" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {[
          { label: "Profile", href: "/profile", icon: <MdPerson size={18} /> },
          { label: "My Orders", href: "/orders", icon: <MdShoppingBag size={18} /> },
          { label: "Favourites", href: "/favourites", icon: <MdFavorite size={18} /> },
        ].map(({ label, href, icon }) => (
          <Link key={href} to={href} style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 18px",
            color: "#D6D3D1",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 500, fontSize: 14, letterSpacing: "0.04em",
            textDecoration: "none",
            transition: "background 0.15s, color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#F59E0B"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#D6D3D1"; }}
          >
            <span style={{ display: "flex", opacity: 0.7 }}>{icon}</span>
            {label}
          </Link>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "4px 0" }} />
        <button onClick={logout} style={{
          display: "flex", width: "100%", textAlign: "left", alignItems: "center", gap: 12,
          padding: "12px 18px", cursor: "pointer",
          color: "#FCA5A5", background: "transparent", border: "none",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600, fontSize: 14, letterSpacing: "0.04em",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ display: "flex", opacity: 0.8 }}><MdLogout size={18} /></span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Deals", href: "/deals", badge: "HOT" },
    { label: "Track Order", href: "/track" },
    ...(isAdmin ? [{ label: "Dashboard", href: "/admin" }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        @keyframes cartPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-cart-btn:hover { color: #F59E0B !important; }
        .nav-order-btn:hover {
          background: #FBBF24 !important;
          box-shadow: 0 0 20px rgba(245,158,11,0.5) !important;
          transform: translateY(-1px) !important;
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled
          ? "rgba(17,12,10,0.97)"
          : "rgba(28,25,23,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(245,158,11,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Main bar */}
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 24px",
          height: 68,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}>
            <BurgerIcon />
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 26,
                letterSpacing: "0.05em",
                color: "#F5F5F4",
                lineHeight: 1,
              }}>
                BURGER<span style={{ color: "#F59E0B" }}>HUB</span>
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 9, letterSpacing: "0.25em",
                color: "#78716C", textTransform: "uppercase",
                lineHeight: 1, marginTop: 1,
              }}>
                Seriously Good Burgers
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{
            display: "flex", alignItems: "center", gap: 32,
            marginLeft: 48,
            flex: 1,
          }}
            className="desktop-links"
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  position: "relative",
                  color: "#D6D3D1",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "4px 0",
                  transition: "color 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#F59E0B"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#D6D3D1"}
              >
                {link.label}
                {link.badge && (
                  <span style={{
                    background: "#EF4444", color: "#fff",
                    fontSize: 9, fontWeight: 800, padding: "1px 5px",
                    borderRadius: 999, letterSpacing: "0.05em",
                  }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>

            {/* Cart */}
            <Link to="/cart"
              className="nav-cart-btn"
              style={{
                color: "#A8A29E",
                transition: "color 0.2s",
                display: "flex", alignItems: "center",
                padding: "6px",
              }}>
              <CartIcon count={cartCount} />
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/login" style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600, fontSize: 14, letterSpacing: "0.06em",
                  color: "#A8A29E", textDecoration: "none",
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; e.currentTarget.style.color = "#F59E0B"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#A8A29E"; }}
                >
                  Login
                </Link>
                <Link to="/register" style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 14, letterSpacing: "0.06em",
                  color: "#1C1917", textDecoration: "none",
                  padding: "8px 18px",
                  background: "#F59E0B",
                  borderRadius: 999,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FBBF24"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F59E0B"; }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Order Now CTA */}
            <Link to="/menu"
              className="nav-order-btn"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 15, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#1C1917", textDecoration: "none",
                padding: "9px 22px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                borderRadius: 999,
                boxShadow: "0 0 12px rgba(245,158,11,0.3)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                display: "none",
                alignItems: "center",
                gap: 8
              }}
              id="order-cta"
            >
              Order Now
              <MdFastfood size={18} />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#A8A29E", padding: 6,
                display: "none",
              }}
              id="mobile-toggle"
            >
              <MenuHamburger open={mobileOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div style={{
          overflow: "hidden",
          maxHeight: mobileOpen ? 400 : 0,
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
          borderTop: mobileOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}>
          <div style={{ padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} style={{
                padding: "12px 0",
                color: "#D6D3D1",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600, fontSize: 18, letterSpacing: "0.08em",
                textTransform: "uppercase", textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                {link.label}
                {link.badge && (
                  <span style={{
                    background: "#EF4444", color: "#fff",
                    fontSize: 9, fontWeight: 800, padding: "2px 7px",
                    borderRadius: 999,
                  }}>{link.badge}</span>
                )}
              </Link>
            ))}
            <Link to="/menu" style={{
              marginTop: 12,
              padding: "13px 0",
              textAlign: "center",
              background: "linear-gradient(135deg,#F59E0B,#D97706)",
              color: "#1C1917",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 16, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}>
              <MdFastfood size={20} />
              Order Now
            </Link>
          </div>
        </div>

        {/* Responsive CSS */}
        <style>{`
          @media (min-width: 900px) {
            #order-cta { display: block !important; }
          }
          @media (max-width: 899px) {
            .desktop-links { display: none !important; }
            #mobile-toggle { display: block !important; }
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;