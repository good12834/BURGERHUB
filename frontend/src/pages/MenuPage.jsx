import { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { useCart } from "../context/CartContext";
import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
import {
  MdFastfood,
  MdLunchDining,
  MdLocalDrink,
  MdSetMeal,
  MdBakeryDining,
  MdSearch,
  MdClose,
  MdRemove,
  MdAdd,
  MdShoppingCart,
  MdArrowForward,
  MdSentimentVeryDissatisfied,
  MdSettings
} from "react-icons/md";

/* ─── Product Image Mapping ─────────────────────────────────────────── */
const productImageMap = {

  'grilled-chicken': 'https://plus.unsplash.com/premium_photo-1722988828777-965588034b66?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'sweet-potato-fries': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&auto=format&fit=crop',
  'fresh-lemonade': 'https://images.unsplash.com/photo-1651993737174-6890c1daef5b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnJlc2gtbGVtb25hZGV8ZW58MHx8MHx8fDA%3D',
  'chocolate-brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  'classic-cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
  'double-burger': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop',
  'bacon-deluxe': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop',
  'crispy-chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop',
  'veggie-delight': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop',
  'mushroom-swiss': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop',
  'french-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop',
  'onion-rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&auto=format&fit=crop',
  'soft-drink': 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=800&auto=format&fit=crop',
  'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop',
  'apple-pie': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&auto=format&fit=crop',
  // By lowercase name (fallback)
  'grilled chicken': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop',
  'sweet potato fries': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&auto=format&fit=crop',
  'fresh lemonade': 'https://images.unsplash.com/photo-1568051243958-9c23f06117ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZnJlc2gtbGVtb25hZGV8ZW58MHx8MHx8fDA%3D',
  'chocolate brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  // By filename from database
  'lemonade': 'https://images.unsplash.com/photo-1651993737174-6890c1daef5b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnJlc2gtbGVtb25hZGV8ZW58MHx8MHx8fDA%3D',
  'brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
};

// Helper: normalize keys (lowercase, trim, replace spaces/underscores with hyphens)
const normalizeKey = (s) => {
  if (!s) return '';
  return s.toString().toLowerCase().trim().replace(/\s+/g, ' ').replace(/[_\s]+/g, '-');
};

// Helper function to get product image
const getProductImage = (item) => {
  const fallback = productImageMap['classic-cheeseburger'];
  if (!item || !item.image_url) return fallback;

  // If the image_url is an absolute URL, prefer a mapped image for known names/slugs,
  // otherwise use the absolute URL directly
  if (typeof item.image_url === 'string' && item.image_url.startsWith('http')) {
    const preferredKey = normalizeKey(item.slug || item.name);
    if (preferredKey && productImageMap[preferredKey]) return productImageMap[preferredKey];
    return item.image_url;
  }

  // If it's a local image path (starts with /images), try several lookup strategies
  if (typeof item.image_url === 'string' && item.image_url.startsWith('/images')) {
    const candidates = new Set();

    // slug (if provided)
    if (item.slug) candidates.add(normalizeKey(item.slug));

    // name variants: lower, normalized, hyphenated
    if (item.name) {
      candidates.add(normalizeKey(item.name));
      candidates.add(normalizeKey(item.name).replace(/\s+/g, '-'));
    }

    // filename without extension
    const filenameWithExt = item.image_url.split('/').pop();
    if (filenameWithExt) {
      const filename = filenameWithExt.replace(/\.[a-zA-Z0-9]+$/, '');
      candidates.add(normalizeKey(filename));
    }

    // Try each candidate against the productImageMap
    for (const c of candidates) {
      if (c && productImageMap[c]) return productImageMap[c];
    }

    // As a last resort, try known short names (e.g., "brownie", "lemonade")
    const shortName = (filenameWithExt || '').split('.')[0];
    if (shortName && productImageMap[normalizeKey(shortName)]) return productImageMap[normalizeKey(shortName)];

    return fallback;
  }

  return fallback;
};

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);


/* ─── Menu Categories ────────────────────────────────────────────── */
const CATEGORIES = [
  { key: "burgers", label: "Burgers", icon: <MdFastfood />, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop" },
  { key: "sides", label: "Sides", icon: <MdLunchDining />, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1200&auto=format&fit=crop" },
  { key: "drinks", label: "Drinks", icon: <MdLocalDrink />, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop" },
  { key: "combos", label: "Combos", icon: <MdSetMeal />, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop" },
  { key: "desserts", label: "Desserts", icon: <MdBakeryDining />, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=1200&auto=format&fit=crop" },
];

const ADDONS = [
  { id: "bc", label: "Extra Bacon", price: 1.50 },
  { id: "ch", label: "Extra Cheese", price: 0.75 },
  { id: "av", label: "Avocado", price: 1.50 },
  { id: "ja", label: "Jalapeños", price: 0.50 },
];

/* ─── Component: Product Card ─────────────────────────────────────── */
const ProductCard = ({ item, delay, onAddToCart, onOpenModal }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#131110",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: 0,
        animation: `slideUp 0.5s ease forwards ${delay}ms`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px)" : "none",
        borderColor: hovered ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.4), 0 0 15px rgba(245,158,11,0.1)" : "none",
        cursor: "pointer"
      }}
      onClick={() => onOpenModal(item)}
    >
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img src={getProductImage(item)} alt={item.name}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productImageMap['classic-cheeseburger']; }}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(19,17,16,0.9) 100%)"
        }} />
        <div style={{
          position: "absolute", bottom: 12, left: 14,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#F59E0B"
        }}>
          ${Number(item.price).toFixed(2)}
        </div>
      </div>
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F5F5F4",
          letterSpacing: "0.02em", marginBottom: 6, lineHeight: 1
        }}>
          {item.name}
        </h3>
        <p style={{
          fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#57534E",
          lineHeight: 1.5, marginBottom: 16, flex: 1
        }}>
          {item.description || item.desc || "Deliciously crafted with fresh ingredients."}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenModal(item); }}
          style={{
            width: "100%", padding: "10px", borderRadius: 12,
            background: hovered ? "linear-gradient(135deg,#F59E0B,#D97706)" : "rgba(255,255,255,0.05)",
            border: "none", color: hovered ? "#1C1917" : "#A8A29E",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
            transition: "all 0.2s", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
        >
          Customize <MdArrowForward size={16} />
        </button>
      </div>
    </div>
  );
};

/* ─── Component: Modal ────────────────────────────────────────────── */
const Modal = ({ item, onClose, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("single");
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const addonPrices = { single: 0, double: 2.5, triple: 4.5 };
  const addonTotal = selectedAddons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0), 0);
  const totalPrice = (Number(item.price) + addonPrices[size] + addonTotal) * qty;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 800,
        background: "#131110", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", flexDirection: "row", overflow: "hidden", animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        {/* Left: Image */}
        <div style={{ width: "40%", background: "#0C0A09", position: "relative" }}>
          <img src={getProductImage(item)} alt={item.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = productImageMap['classic-cheeseburger']; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(19,17,16,1) 98%)" }} />
        </div>

        {/* Right: Options */}
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: "#F5F5F4", letterSpacing: "0.03em" }}>{item.name}</h2>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#57534E", marginTop: 4 }}>{item.description || "Freshly made just for you."}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#A8A29E", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdClose size={20} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 32 }}>
            {/* Size */}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", color: "#44403C", textTransform: "uppercase", marginBottom: 12 }}>Choose Size</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["single", "double", "triple"].map(s => (
                  <button
                    key={s} onClick={() => setSize(s)}
                    style={{
                      padding: "10px 14px", borderRadius: 12, textAlign: "left",
                      background: size === s ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${size === s ? "#F59E0B" : "rgba(255,255,255,0.07)"}`,
                      color: size === s ? "#F5F5F4" : "#57534E", cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'Barlow', sans-serif", textTransform: "capitalize", fontSize: 14, fontWeight: size === s ? 700 : 400
                    }}
                  >
                    {s} {addonPrices[s] > 0 && <span style={{ float: "right", color: "#F59E0B" }}>+${addonPrices[s].toFixed(2)}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Addons */}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", color: "#44403C", textTransform: "uppercase", marginBottom: 12 }}>Add-ons</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ADDONS.map(addon => (
                  <button
                    key={addon.id} onClick={() => toggleAddon(addon.id)}
                    style={{
                      padding: "10px 14px", borderRadius: 12, textAlign: "left",
                      background: selectedAddons.includes(addon.id) ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${selectedAddons.includes(addon.id) ? "#F59E0B" : "rgba(255,255,255,0.07)"}`,
                      color: selectedAddons.includes(addon.id) ? "#F5F5F4" : "#57534E", cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'Barlow', sans-serif", fontSize: 14
                    }}
                  >
                    {addon.label} <span style={{ float: "right", color: "#F59E0B" }}>+${addon.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "4px" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 32, height: 32, background: "none", border: "none", color: "#F5F5F4", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MdRemove />
                </button>
                <span style={{ width: 30, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 32, height: 32, background: "none", border: "none", color: "#F5F5F4", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MdAdd />
                </button>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#F59E0B" }}>
                ${totalPrice.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => { onAddToCart(item, qty, { addons: selectedAddons, size }); onClose(); }}
              style={{
                padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#F59E0B,#D97706)",
                border: "none", color: "#1C1917", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 8px 24px rgba(245,158,11,0.3)", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Component: Cart Sidebar ─────────────────────────────────────── */
const CartSidebar = ({ items, onRemove, onClear }) => {
  const total = items.reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div style={{
      width: 340, background: "#131110", borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.07)", height: "calc(100vh - 120px)",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#F5F5F4", letterSpacing: "0.04em" }}>My Order</h2>
        {items.length > 0 && <button onClick={onClear} style={{ background: "none", border: "none", color: "#44403C", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>CLEAR ALL</button>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
            <MdShoppingCart size={48} />
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, marginTop: 8 }}>Empty cart</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} style={{
              display: "flex", gap: 12, padding: "12px", background: "rgba(255,255,255,0.02)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)"
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 10, background: "#0C0A09", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#F59E0B" }}>
                {item.category?.name?.toLowerCase().includes('burger') ? <MdFastfood /> : <MdLunchDining />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#F5F5F4", fontSize: 14 }}>{item.quantity}× {item.name}</h4>
                  <button onClick={() => onRemove(idx)} style={{ background: "none", border: "none", color: "#44403C", cursor: "pointer", display: "flex" }}>
                    <MdClose size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#44403C", fontFamily: "'Barlow', sans-serif" }}>
                    {item.customizations?.size} {item.customizations?.addons?.length > 0 && `· ${item.customizations.addons.join(", ")}`}
                  </span>
                  <span style={{ fontSize: 14, fontFamily: "'Bebas Neue', sans-serif", color: "#F59E0B" }}>${Number(item.lineTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "24px", background: "#0C0A09", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: "#57534E", textTransform: "uppercase" }}>Total</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#F59E0B" }}>${Number(total).toFixed(2)}</span>
        </div>
        <button
          disabled={items.length === 0}
          onClick={() => window.location.href = "/checkout"}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            background: items.length === 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#22C55E,#16A34A)",
            color: items.length === 0 ? "#3D3632" : "#1C1917",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase",
            border: "none", cursor: items.length === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s", boxShadow: items.length === 0 ? "none" : "0 8px 20px rgba(34,197,94,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
        >
          Checkout <MdArrowForward size={20} />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("burgers");
  const [search, setSearch] = useState("");
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const [modalItem, setModalItem] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const { data: menuData, isLoading, error } = useQuery('products', async () => {
    const response = await axios.get(`${API_BASE}/api/products`);
    return response.data;
  });

  // Group products by category (mocking the structure if backend returns flat list)
  // Backend server.js currently returns hardcoded 3 products in a flat list: 
  // { success: true, data: [ {id:1, name:'Classic Cheeseburger', description:'...', price:9.99, image_url:'...'}, ... ] }
  // I will transform this into the MENU structure expected by the component.


  const menu = {
    burgers: (menuData?.data || []).filter(item => item.category?.name?.toLowerCase().includes('burger')),
    sides: (menuData?.data || []).filter(item => item.category?.name?.toLowerCase().includes('side')),
    drinks: (menuData?.data || []).filter(item => item.category?.name?.toLowerCase().includes('beverage') || item.category?.name?.toLowerCase().includes('drink')),
    combos: (menuData?.data || []).filter(item => item.category?.name?.toLowerCase().includes('combo')),
    desserts: (menuData?.data || []).filter(item => item.category?.name?.toLowerCase().includes('dessert')),
  };

  // If a category has no products, show all products as fallback
  const allItems = menu[activeCategory]?.length > 0 ? menu[activeCategory] : (menuData?.data || []);
  const filtered = search.trim()
    ? (menuData?.data || []).filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.description || "").toLowerCase().includes(search.toLowerCase()))
    : allItems;

  if (isLoading) return <div style={{ color: 'white', textAlign: 'center', padding: '100px' }}>Loading deliciousness...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '100px' }}>Error loading menu: {error.message}</div>;

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3D3632; border-radius: 2px; }
        input[type=text]:focus { outline: none; }
        @media (max-width: 900px) {
          .desktop-cart { display: none !important; }
          .mobile-cart-btn { display: flex !important; }
          .page-layout { flex-direction: column !important; }
        }
        @media (min-width: 901px) {
          .mobile-cart-btn { display: none !important; }
        }
        @media (max-width: 640px) {
          .items-grid { grid-template-columns: 1fr !important; }
          .cats-scroll { overflow-x: auto; }
        }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* ── Page Header ── */}
        <div style={{
          background: "linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 40px 0",
        }}>
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "#F59E0B", textTransform: "uppercase", marginBottom: 10 }}>
              Hand-Crafted Daily
            </div>
            {/* Cinematic Split Hero (450px) */}
            {!search && (
              <div style={{
                width: "100%", height: 450, borderRadius: 32, overflow: "hidden",
                position: "relative", background: "linear-gradient(135deg, #1C0E00 0%, #0C0A09 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                marginBottom: 32, display: "flex", alignItems: "center",
                padding: "0 60px", gap: 40, animation: "fadeIn 0.8s ease-out"
              }}>
                {/* Left: Typography */}
                <div style={{ flex: 1.2, zIndex: 2 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 12, letterSpacing: "0.4em", color: "#F59E0B",
                    background: "rgba(245,158,11,0.1)", padding: "6px 14px",
                    borderRadius: 99, marginBottom: 20, textTransform: "uppercase"
                  }}>
                    <span style={{ fontSize: 20 }}>{CATEGORIES.find(c => c.key === activeCategory)?.icon}</span>
                    Signature {activeCategory}
                  </div>

                  <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(60px, 8vw, 110px)",
                    letterSpacing: "0.02em", color: "#FFFFFF", lineHeight: 0.85,
                    margin: "12px 0", animation: "slideUp 0.6s 0.2s ease-out fill-backwards"
                  }}>
                    THE ULTIMATE<br />
                    <span style={{ color: "#F59E0B" }}>{activeCategory.toUpperCase()}</span>
                  </h1>

                  <p style={{
                    fontFamily: "'Barlow', sans-serif", fontSize: 18, color: "#D6D3D1",
                    lineHeight: 1.5, maxWidth: 480, marginTop: 16,
                    animation: "slideUp 0.6s 0.4s ease-out fill-backwards"
                  }}>
                    Explore our hand-crafted {activeCategory} menu, prepared with locally sourced ingredients and our signature secret sauces.
                  </p>
                </div>

                {/* Right: Floating Image */}
                <div style={{
                  flex: 1, height: "100%", position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {/* Decorative Glow */}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                    width: "120%", height: "120%",
                    background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
                    zIndex: 0, pointerEvents: "none"
                  }} />

                  <div style={{
                    width: "100%", height: "100%", position: "relative", zIndex: 1,
                    animation: "float 6s ease-in-out infinite"
                  }}>
                    <img
                      src={CATEGORIES.find(c => c.key === activeCategory)?.image}
                      alt={activeCategory}
                      key={activeCategory}
                      style={{
                        width: "100%", height: "100%", objectFit: "contain",
                        filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.8))",
                        animation: "slowZoom 20s linear infinite"
                      }}
                    />
                  </div>
                </div>

                {/* Subtle Overlays */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(12,10,9,0.3) 0%, transparent 40%)", pointerEvents: "none" }} />
              </div>
            )}

            {search && (
              <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: "#F5F5F4", letterSpacing: "0.03em" }}>
                  Search Results
                </h1>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 18, color: "#57534E" }}>
                  Showing items matching "{search}"
                </p>
              </div>
            )}

            {/* Featured Special Banner */}
            {!search && (
              <div style={{
                width: "100%", borderRadius: 24, overflow: "hidden", marginBottom: 40,
                background: "linear-gradient(90deg, #1C1917 0%, transparent 60%), url('https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=1600&auto=format&fit=crop')",
                backgroundSize: "cover", backgroundPosition: "center 30%",
                padding: "40px 50px", border: "1px solid rgba(245,158,11,0.2)",
                position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <div style={{ position: "relative", zIndex: 2, maxWidth: 500 }}>
                  <span style={{
                    background: "#F59E0B", color: "#1C1917", padding: "4px 12px",
                    borderRadius: 6, fontWeight: 900, fontSize: 12, letterSpacing: "0.1em",
                    fontFamily: "'Barlow Condensed', sans-serif"
                  }}>LIMITED TIME</span>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 50, color: "white",
                    marginTop: 15, lineHeight: 0.9, letterSpacing: "0.02em"
                  }}>THE SMOKY<br /><span style={{ color: "#F59E0B" }}>BRISKEST BROS.</span></h2>
                  <p style={{
                    fontFamily: "'Barlow', sans-serif", fontSize: 16, color: "#D6D3D1",
                    marginTop: 15, lineHeight: 1.4
                  }}>Slow-smoked brisket, double wagyu patty, and our signature maple-bourbon glaze. Order now and get a free drink.</p>
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ position: "relative", maxWidth: 420, marginBottom: 28 }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none", color: "#57534E", display: "flex" }}>
                <MdSearch />
              </span>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search burgers, sides, drinks..."
                style={{
                  width: "100%", padding: "12px 16px 12px 44px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 999, color: "#F5F5F4",
                  fontFamily: "'Barlow', sans-serif", fontSize: 14,
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#57534E", cursor: "pointer", fontSize: 18, display: "flex" }}>
                  <MdClose />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            {!search && (
              <div className="cats-scroll" style={{ display: "flex", gap: 4 }}>
                {CATEGORIES.map(cat => {
                  const active = activeCategory === cat.key;
                  return (
                    <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, fontSize: 14, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "12px 20px",
                      border: "none", background: "transparent", cursor: "pointer",
                      color: active ? "#F59E0B" : "#57534E",
                      borderBottom: `3px solid ${active ? "#F59E0B" : "transparent"}`,
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 7,
                    }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#A8A29E"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#57534E"; }}
                    >
                      <span style={{ fontSize: 18, display: "flex" }}>{cat.icon}</span> {cat.label}
                      <span style={{
                        background: active ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                        color: active ? "#F59E0B" : "#44403C",
                        fontSize: 10, fontWeight: 800,
                        padding: "1px 6px", borderRadius: 999,
                        transition: "all 0.2s",
                      }}>
                        {menu[cat.key].length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="page-layout" style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 40px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {search && (
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 14, color: "#57534E", letterSpacing: "0.08em", marginBottom: 20, textTransform: "uppercase" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16, color: "#3D3632", display: "flex", justifyContent: "center" }}>
                  <MdSentimentVeryDissatisfied />
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#57534E", letterSpacing: "0.05em" }}>Nothing found</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#3D3632", marginTop: 6 }}>Try a different search term</p>
              </div>
            ) : (
              <div className="items-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                {filtered.map((item, i) => (
                  <ProductCard key={item.id} item={item} delay={i * 60} onAddToCart={addToCart} onOpenModal={setModalItem} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Cart */}
          <div className="desktop-cart">
            <CartSidebar
              items={cartItems.map(i => ({ ...i, lineTotal: i.price * i.quantity }))}
              onRemove={(idx) => {
                const item = cartItems[idx];
                removeFromCart(item.id, item.customizations);
              }}
              onClear={clearCart}
            />
          </div>
        </div>

        {/* Mobile cart FAB */}
        <button
          className="mobile-cart-btn"
          onClick={() => setMobileCartOpen(true)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 900,
            background: "linear-gradient(135deg,#F59E0B,#D97706)",
            color: "#1C1917", border: "none", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 15, letterSpacing: "0.08em",
            padding: "13px 22px", borderRadius: 999,
            boxShadow: "0 6px 24px rgba(245,158,11,0.4)",
            alignItems: "center", gap: 8,
            display: "none",
          }}
        >
          <MdShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
          {cartCount > 0 && <span style={{ background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 999 }}>${cartTotal.toFixed(2)}</span>}
        </button>

        {/* Mobile cart drawer */}
        {mobileCartOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1800, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }} onClick={() => setMobileCartOpen(false)}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1C1917", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80vh", overflow: "hidden", animation: "slideUp 0.25s" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "12px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "#3D3632" }} />
              </div>
              <CartSidebar
                items={cartItems.map(i => ({ ...i, lineTotal: i.price * i.quantity }))}
                onRemove={(idx) => {
                  const item = cartItems[idx];
                  removeFromCart(item.id, item.customizations);
                }}
                onClear={clearCart}
              />
            </div>
          </div>
        )}

        {/* Customization Modal */}
        {modalItem && (
          <Modal item={modalItem} onClose={() => setModalItem(null)} onAddToCart={addToCart} />
        )}
      </div>
    </>
  );
}
