import { useState, useEffect, useRef } from "react";
import { MdFavorite, MdFavoriteBorder, MdShoppingCart, MdDelete, MdArrowBack, MdCheck, MdGridView, MdList, MdAdd, MdKeyboardArrowLeft } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
);

/* ─── Mock data ──────────────────────────────────────────────────────── */
const MOCK_FAVOURITES = [
  { id: 1, product: { id: 1, image: "🍔", name: "Truffle Royale", category: "Burgers", price: 16.99, description: "Wagyu beef, truffle aioli, gold-dusted bun, aged cheddar", rating: 4.9, orders: 312 }, savedAt: new Date(Date.now() - 2 * 86400000) },
  { id: 2, product: { id: 2, image: "🥓", name: "Bacon Overload", category: "Burgers", price: 13.99, description: "Triple smoked bacon, BBQ glaze, crispy onions, smoky sauce", rating: 4.8, orders: 287 }, savedAt: new Date(Date.now() - 5 * 86400000) },
  { id: 3, product: { id: 7, image: "🍟", name: "Truffle Fries", category: "Sides", price: 6.99, description: "Crispy shoestring fries, truffle oil, parmesan, fresh herbs", rating: 4.7, orders: 198 }, savedAt: new Date(Date.now() - 8 * 86400000) },
  { id: 4, product: { id: 4, image: "🌶️", name: "Inferno BBQ", category: "Burgers", price: 12.99, description: "Ghost pepper patty, jalapeños, sriracha slaw, habanero ketchup", rating: 4.6, orders: 176 }, savedAt: new Date(Date.now() - 11 * 86400000) },
  { id: 5, product: { id: 10, image: "🥤", name: "Chocolate Shake", category: "Drinks", price: 5.99, description: "Thick Belgian chocolate milkshake with whipped cream", rating: 4.8, orders: 156 }, savedAt: new Date(Date.now() - 14 * 86400000) },
  { id: 6, product: { id: 6, image: "✨", name: "Double Smash", category: "Burgers", price: 14.99, description: "Two smashed patties, American singles, caramelized onions, pickles", rating: 4.7, orders: 203 }, savedAt: new Date(Date.now() - 20 * 86400000) },
  { id: 7, product: { id: 12, image: "🍫", name: "Lava Brownie", category: "Desserts", price: 6.99, description: "Warm chocolate lava brownie with vanilla ice cream scoop", rating: 4.9, orders: 112 }, savedAt: new Date(Date.now() - 25 * 86400000) },
  { id: 8, product: { id: 8, image: "🧅", name: "Onion Rings", category: "Sides", price: 5.49, description: "Beer-battered thick-cut onion rings with chipotle dip", rating: 4.5, orders: 134 }, savedAt: new Date(Date.now() - 30 * 86400000) },
];

const MOCK_RECOMMENDED = [
  { id: 4, image: "🌶️", name: "Inferno BBQ", price: 12.99, rating: 4.6 },
  { id: 6, image: "✨", name: "Double Smash", price: 14.99, rating: 4.7 },
  { id: 13, image: "🍩", name: "Churros", price: 4.99, rating: 4.4 },
];

const CAT_COLORS = {
  Burgers: "#F59E0B",
  Sides: "#60A5FA",
  Drinks: "#A78BFA",
  Desserts: "#F472B6",
};

// Product image mapping
const productImageMap = {
  'Truffle Royale': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
  'Bacon Overload': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop',
  'Truffle Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop',
  'Inferno BBQ': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop',
  'Chocolate Shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop',
  'Double Smash': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop',
  'Lava Brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  'Onion Rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&auto=format&fit=crop',
};

/* ─── useInView hook ─────────────────────────────────────────────────── */
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

/* ─── Fav Card ───────────────────────────────────────────────────────── */
const FavCard = ({ fav, onRemove, onAddToCart, delay, viewMode }) => {
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [added, setAdded] = useState(false);
  const { product } = fav;
  const catColor = CAT_COLORS[product.category] || "#F59E0B";

  // Get image URL
  const getImageSrc = (prod) => {
    if (productImageMap[prod.name]) {
      return productImageMap[prod.name];
    }
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop';
  };

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(fav.id), 380);
  };

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (viewMode === "list") {
    return (
      <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: hover ? "#1C1917" : "#131110", border: `1px solid ${hover ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, opacity: removing ? 0 : inView ? 1 : 0, transform: removing ? "translateX(40px)" : inView ? "none" : "translateX(-12px)", transition: `all 0.35s ease ${removing ? 0 : delay}ms`, overflow: "hidden" }}>
        {/* Image */}
        <div style={{ width: 60, height: 60, borderRadius: 12, background: `linear-gradient(135deg,${catColor}18,${catColor}08)`, border: `1px solid ${catColor}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          <img src={getImageSrc(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, color: "#F5F5F4", letterSpacing: "0.04em" }}>{product.name}</div>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30`, padding: "2px 7px", borderRadius: 999 }}>{product.category}</span>
          </div>
          <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 12, color: "#3D3632", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>{product.description}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#44403C" }}><FaStar style={{ color: '#F59E0B', marginRight: 4 }} size={10} /> {product.rating} · {product.orders} orders</span>
          </div>
        </div>
        {/* Price + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#F59E0B", letterSpacing: "0.03em" }}>${product.price.toFixed(2)}</span>
          <button onClick={handleAdd} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: added ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: added ? "#22C55E" : "#1C1917", border: added ? "1px solid rgba(34,197,94,0.3)" : "none", cursor: "pointer", padding: "8px 14px", borderRadius: 9, transition: "all 0.25s", whiteSpace: "nowrap", display: 'flex', alignItems: 'center', gap: 6 }}>
            {added ? <MdCheck size={14} /> : <MdShoppingCart size={14} />}
            {added ? "Added" : "Add to Cart"}
          </button>
          <button onClick={handleRemove} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#57534E", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#57534E"; }}
          ><MdDelete size={16} /></button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#1C1917" : "#131110", border: `1px solid ${hover ? `${catColor}30` : "rgba(255,255,255,0.07)"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", opacity: removing ? 0 : inView ? 1 : 0, transform: removing ? "scale(0.9)" : inView ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.4s ease ${removing ? 0 : delay}ms, transform 0.4s ease ${removing ? 0 : delay}ms, border-color 0.2s, background 0.2s`, boxShadow: hover ? "0 8px 28px rgba(0,0,0,0.35)" : "none" }}>

      {/* Top: image */}
      <div style={{ height: 110, background: `linear-gradient(135deg,${catColor}12,rgba(0,0,0,0))`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 60%, ${catColor}${hover ? "18" : "08"},transparent 70%)`, transition: "opacity 0.3s" }} />
        <img src={getImageSrc(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hover ? "scale(1.08)" : "scale(1)", transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", zIndex: 1 }} />
        {/* Remove btn - appears on hover */}
        <button onClick={handleRemove} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 8, background: "rgba(15,13,11,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#57534E", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", opacity: hover ? 1 : 0, transform: hover ? "translateY(0)" : "translateY(-4px)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "#EF4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,13,11,0.8)"; e.currentTarget.style.color = "#57534E"; }}
        ><MdDelete size={16} /></button>
        {/* Category badge */}
        <span style={{ position: "absolute", bottom: 8, left: 10, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: catColor, background: `${catColor}18`, border: `1px solid ${catColor}30`, padding: "2px 7px", borderRadius: 999 }}>{product.category}</span>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#F5F5F4", letterSpacing: "0.04em", lineHeight: 1.1 }}>{product.name}</div>
        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: "#3D3632", lineHeight: 1.5, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#44403C" }}><FaStar style={{ color: '#F59E0B', marginRight: 4 }} size={10} /> {product.rating}</span>
          <span style={{ fontSize: 10, color: "#2D2926" }}>·</span>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "#44403C" }}>{product.orders} orders</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#F59E0B", letterSpacing: "0.03em" }}>${product.price.toFixed(2)}</span>
        <button onClick={handleAdd} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: added ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#F59E0B,#D97706)", color: added ? "#22C55E" : "#1C1917", border: added ? "1px solid rgba(34,197,94,0.3)" : "none", cursor: "pointer", padding: "8px 14px", borderRadius: 9, transition: "all 0.25s", boxShadow: added ? "none" : "0 0 12px rgba(245,158,11,0.25)", whiteSpace: "nowrap", display: 'flex', alignItems: 'center', gap: 6 }}>
          {added ? <MdCheck size={14} /> : <MdShoppingCart size={14} />}
          {added ? "Added!" : "Add"}
        </button>
      </div>
    </div>
  );
};

/* ─── Empty State ────────────────────────────────────────────────────── */
const EmptyState = () => (
  <div style={{ padding: "100px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeSlideUp 0.5s ease" }}>
    <div style={{ fontSize: 72, animation: "heartbeat 2s ease-in-out infinite" }}><MdFavoriteBorder size={72} color="#44403C" /></div>
    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: "#3D3632", letterSpacing: "0.04em" }}>No Favourites Yet</div>
    <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: "#2D2926", maxWidth: 320, lineHeight: 1.7 }}>
      Tap the heart on any menu item to save it here for quick re-ordering.
    </p>
    <a href="/menu" style={{ marginTop: 12, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", color: "#1C1917", background: "linear-gradient(135deg,#F59E0B,#D97706)", padding: "13px 32px", borderRadius: 999, boxShadow: "0 0 24px rgba(245,158,11,0.35)", transition: "all 0.2s", display: 'flex', alignItems: 'center', gap: 8 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    ><MdArrowBack /> Browse Menu</a>
    {/* Recommended strip */}
    <div style={{ marginTop: 48, width: "100%", maxWidth: 540 }}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", color: "#2D2926", textTransform: "uppercase", marginBottom: 14 }}>You Might Like</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {MOCK_RECOMMENDED.map(item => (
          <div key={item.id} style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.28)"; e.currentTarget.style.background = "#1C1917"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#131110"; }}
          >
            <span style={{ fontSize: 24 }}>{item.image}</span>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F5F4" }}>{item.name}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: "#F59E0B" }}>${item.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── MAIN PAGE ──────────────────────────────────────────────────────── */
export default function FavouritesPage() {
  const { addToCart: contextAddToCart, cartItems } = useCart();
  const [favourites, setFavourites] = useState(MOCK_FAVOURITES);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [catFilter, setCatFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [pageIn, setPageIn] = useState(false);
  const [clearModal, setClearModal] = useState(false);

  // Calculate cart count from real cart
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => { const t = setTimeout(() => setPageIn(true), 80); return () => clearTimeout(t); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const removeFavourite = (id) => {
    setFavourites(prev => prev.filter(f => f.id !== id));
    showToast("Removed from favourites", "remove");
  };

  const addToCartHandler = (product) => {
    // Transform product to match CartContext format
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image
    };
    contextAddToCart(cartProduct, 1);
    showToast(`${product.name} added to cart!`);
  };

  const clearAll = () => {
    setFavourites([]);
    setClearModal(false);
    showToast("All favourites cleared", "remove");
  };

  // Filter + sort
  const cats = ["all", ...new Set(MOCK_FAVOURITES.map(f => f.product.category))];
  const processed = favourites
    .filter(f => catFilter === "all" || f.product.category === catFilter)
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.savedAt) - new Date(a.savedAt);
      if (sortBy === "price_asc") return a.product.price - b.product.price;
      if (sortBy === "price_desc") return b.product.price - a.product.price;
      if (sortBy === "rating") return b.product.rating - a.product.rating;
      return 0;
    });

  // Category counts
  const catCounts = Object.fromEntries(cats.map(c => [c, c === "all" ? favourites.length : favourites.filter(f => f.product.category === c).length]));

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0A09; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2D2926; border-radius: 2px; }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartbeat   { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 70%{transform:scale(1)} }
        @keyframes toastIn     { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes popIn       { from{opacity:0;transform:translate(-50%,-50%) scale(0.92)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes floatHeart  { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-8px) rotate(4deg)} }
      `}</style>

      <div style={{ background: "#0C0A09", minHeight: "100vh", color: "#F5F5F4" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 400, background: toast.type === "success" ? "rgba(34,197,94,0.14)" : toast.type === "remove" ? "rgba(120,113,108,0.15)" : "rgba(245,158,11,0.14)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : toast.type === "remove" ? "rgba(120,113,108,0.25)" : "rgba(245,158,11,0.3)"}`, color: toast.type === "success" ? "#22C55E" : toast.type === "remove" ? "#78716C" : "#F59E0B", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", padding: "12px 24px", borderRadius: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "toastIn 0.3s ease", whiteSpace: "nowrap", zIndex: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            {toast.type === "success" ? <MdCheck size={16} /> : toast.type === "remove" ? <MdFavoriteBorder size={16} /> : <MdShoppingCart size={16} />} {toast.msg}
          </div>
        )}

        {/* Clear modal */}
        {clearModal && (
          <>
            <div onClick={() => setClearModal(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", zIndex: 301, background: "#1C1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 32px", width: 360, animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)", textAlign: "center" }}>
              <div style={{ marginBottom: 12 }}><MdFavoriteBorder size={40} color="#78716C" /></div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#F5F5F4", letterSpacing: "0.04em", marginBottom: 8 }}>Clear All Favourites?</div>
              <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#78716C", lineHeight: 1.6, marginBottom: 24 }}>This will remove all {favourites.length} saved items. You can always add them back from the menu.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setClearModal(false)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#78716C", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cancel</button>
                <button onClick={clearAll} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#EF4444", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Clear All</button>
              </div>
            </div>
          </>
        )}

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(180deg,#1C0A0A 0%,#0C0A09 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "40px 40px 0", opacity: pageIn ? 1 : 0, transform: pageIn ? "none" : "translateY(12px)", transition: "all 0.5s 0.1s" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Breadcrumb */}
            <a href="/menu" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#44403C", textDecoration: "none", marginBottom: 16, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F59E0B"}
              onMouseLeave={e => e.currentTarget.style.color = "#44403C"}
            ><MdKeyboardArrowLeft /> Back to Menu</a>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <div style={{ animation: "floatHeart 3s ease-in-out infinite", filter: "drop-shadow(0 0 12px rgba(239,68,68,0.3))" }}><MdFavorite size={48} color="#EF4444" /></div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.3em", color: "#EF4444", textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>Saved Items</div>
                  <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,6vw,60px)", letterSpacing: "0.03em", color: "#F5F5F4", lineHeight: 0.95 }}>
                    Favourites
                    <span style={{ color: "#F59E0B", marginLeft: 12, fontSize: "0.65em" }}>({favourites.length})</span>
                  </h1>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* Cart badge */}
                {cartCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 999 }}>
                    <MdShoppingCart size={14} color="#F59E0B" />
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, color: "#F59E0B" }}>{cartCount} added</span>
                  </div>
                )}
                {favourites.length > 0 && (
                  <button onClick={() => setClearModal(true)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#57534E", cursor: "pointer", padding: "8px 14px", borderRadius: 9, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.14)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#57534E"; e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
                  >Clear All</button>
                )}
                {/* View toggle */}
                <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: 3, gap: 2, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <button onClick={() => setViewMode("grid")} style={{ width: 32, height: 28, borderRadius: 7, background: viewMode === "grid" ? "rgba(245,158,11,0.15)" : "transparent", border: `1px solid ${viewMode === "grid" ? "rgba(245,158,11,0.3)" : "transparent"}`, cursor: "pointer", color: viewMode === "grid" ? "#F59E0B" : "#44403C", transition: "all 0.15s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdGridView size={16} /></button>
                  <button onClick={() => setViewMode("list")} style={{ width: 32, height: 28, borderRadius: 7, background: viewMode === "list" ? "rgba(245,158,11,0.15)" : "transparent", border: `1px solid ${viewMode === "list" ? "rgba(245,158,11,0.3)" : "transparent"}`, cursor: "pointer", color: viewMode === "list" ? "#F59E0B" : "#44403C", transition: "all 0.15s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdList size={16} /></button>
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
              {cats.filter(c => catCounts[c] > 0 || c === "all").map(cat => {
                const color = cat === "all" ? "#F59E0B" : (CAT_COLORS[cat] || "#F59E0B");
                const active = catFilter === cat;
                return (
                  <button key={cat} onClick={() => setCatFilter(cat)} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 18px", background: "none", border: "none", borderBottom: `2px solid ${active ? color : "transparent"}`, color: active ? color : "#44403C", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                    {cat === "all" ? "All" : cat}
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: active ? color : "#2D2926" }}>{catCounts[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 40px 60px" }}>
          {favourites.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#2D2926", textTransform: "uppercase" }}>
                  {processed.length} item{processed.length !== 1 ? "s" : ""}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, letterSpacing: "0.15em", color: "#3D3632", textTransform: "uppercase" }}>Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, color: "#78716C", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", outline: "none", cursor: "pointer" }}>
                    <option value="recent">Recently Saved</option>
                    <option value="rating">Top Rated</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                  {/* Add all to cart */}
                  <button onClick={() => { processed.forEach(f => addToCartHandler(f.product)); showToast(`${processed.length} items added to cart!`); }} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1C1917", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 9, whiteSpace: "nowrap", boxShadow: "0 0 14px rgba(245,158,11,0.2)", transition: "all 0.2s", display: 'flex', alignItems: 'center', gap: 6 }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 22px rgba(245,158,11,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 14px rgba(245,158,11,0.2)"}
                  ><MdShoppingCart size={14} /> Add All</button>
                </div>
              </div>

              {/* Grid / List */}
              {viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 16 }}>
                  {processed.map((fav, i) => (
                    <FavCard key={fav.id} fav={fav} onRemove={removeFavourite} onAddToCart={addToCartHandler} delay={i * 55} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {processed.map((fav, i) => (
                    <FavCard key={fav.id} fav={fav} onRemove={removeFavourite} onAddToCart={addToCartHandler} delay={i * 40} viewMode="list" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
