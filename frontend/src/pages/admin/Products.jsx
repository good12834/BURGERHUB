
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/products`;

// Product image mapping for products with missing local images
const productImageMap = {
  // By slug
  'grilled-chicken': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop',
  'sweet-potato-fries': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&auto=format&fit=crop',
  'fresh-lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
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
  'fresh lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
  'chocolate brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  // By filename from database
  'lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
  'brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
};

// Helper function to get product image
const getProductImage = (product) => {
  if (!product.image_url || product.image_url.length === 0) {
    return productImageMap['classic-cheeseburger'];
  }
  if (product.image_url.startsWith('/images')) {
    // Try slug first
    let lookupKey = product.slug;
    // Then try lowercase name with trimmed whitespace
    if (!lookupKey && product.name) {
      lookupKey = product.name.toLowerCase().trim();
    }
    if (lookupKey && productImageMap[lookupKey]) {
      return productImageMap[lookupKey];
    }
    // Last resort: try mapping from image_url filename
    const filename = product.image_url.split('/').pop().replace('.jpg', '');
    if (productImageMap[filename]) {
      return productImageMap[filename];
    }
    return productImageMap['classic-cheeseburger'];
  }
  if (product.image_url.startsWith('http')) {
    return product.image_url;
  }
  return productImageMap['classic-cheeseburger'];
};

const STATUS_CFG = { active: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", label: "Active" }, low: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Low Stock" }, inactive: { color: "#44403C", bg: "rgba(68,64,60,0.15)", border: "rgba(68,64,60,0.3)", label: "Inactive" } };
const EMPTY_PRODUCT = { name: "", category: "Burgers", category_id: 1, price: "", description: "", status: "active", featured: false, image_url: "" };

const Field = ({ label, value, onChange, placeholder, type = "text", required, error, rows }) => {
  const [focused, setFocused] = useState(false);
  const Tag = rows ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: focused ? "#F59E0B" : "#44403C" }}>{label}</label>
      <Tag type={type} value={value} onChange={onChange} placeholder={placeholder} rows={rows} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1.5px solid ${error ? "#EF4444" : focused ? "#F59E0B" : "rgba(255,255,255,0.1)"}`, borderRadius: 9, color: "#F5F5F4", fontFamily: "'Barlow',sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box", minHeight: rows ? rows * 28 : undefined }} />
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete, delay }) => {
  const [hover, setHover] = useState(false);
  const imageSrc = getProductImage(product);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: hover ? "#1C1917" : "#131110", border: `1px solid ${hover ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, overflow: "hidden", transition: "all 0.25s", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 120, background: "linear-gradient(135deg,#18120A,#0E0B08)", overflow: "hidden" }}>
        <img
          src={imageSrc}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hover ? "scale(1.05)" : "scale(1)" }}
        />
        {product.is_featured && <div style={{ position: "absolute", top: 8, right: 8, background: "#F59E0B", color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>FEATURED</div>}
      </div>
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h3 style={{ color: "#F5F5F4", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.05em", margin: 0 }}>{product.name}</h3>
            <p style={{ color: "#78716C", fontSize: 11, margin: "4px 0 0 0" }}>{product.category?.name || product.category}</p>
          </div>
          <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 16 }}>${product.price}</span>
        </div>
        <p style={{ color: "#57534E", fontSize: 12, lineHeight: 1.5, flex: 1, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ ...STATUS_CFG[product.status], padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>{STATUS_CFG[product.status]?.label || "Active"}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onEdit(product)} style={{ background: "rgba(245,158,11,0.15)", border: "none", color: "#F59E0B", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
            <button onClick={() => onDelete(product.id)} style={{ background: "rgba(239,68,68,0.15)", border: "none", color: "#EF4444", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [error, setError] = useState("");
  const { data: productsData, isLoading, error: queryError } = useQuery("products", async () => { const res = await axios.get(`${API_URL}?includeUnavailable=true`); return res.data.data; }, { staleTime: 30000 });

  const categories = [
    { id: 1, name: "Burgers" },
    { id: 2, name: "Chicken" },
    { id: 3, name: "Veggie" },
    { id: 4, name: "Sides" },
    { id: 5, name: "Drinks" },
    { id: 6, name: "Desserts" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price) { setError("Name and price are required"); return; }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category_id: form.category_id || 1,
        image_url: form.image_url,
        is_featured: form.featured,
        is_available: form.status === "active"
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      if (editingProduct?.id) {
        await axios.put(`${API_URL}/admin/${editingProduct.id}`, payload, config);
      } else {
        await axios.post(`${API_URL}/admin`, payload, config);
      }
      queryClient.invalidateQueries("products");
      closeModal();
    } catch (err) { setError(err.response?.data?.message || "Failed to save product"); }
  };

  const openCreate = () => { setEditingProduct(null); setForm(EMPTY_PRODUCT); setIsModalOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setForm({ name: p.name, category: p.category?.name || p.category, category_id: p.category_id || 1, price: p.price, description: p.description || "", status: p.is_available ? "active" : "inactive", featured: p.is_featured || false, image_url: p.image_url || "" }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); setForm(EMPTY_PRODUCT); setError(""); };
  const handleDelete = async (id) => { if (window.confirm("Are you sure you want to delete this product?")) { try { const token = localStorage.getItem('token'); await axios.delete(`${API_URL}/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }); queryClient.invalidateQueries("products"); } catch (err) { alert("Failed to delete product"); } } };
  const set = (field) => ({ target: { value } }) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div style={{ minHeight: "100vh", background: "#0C0A09", color: "#F5F5F4", padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#F5F5F4", margin: 0, letterSpacing: "0.02em" }}>PRODUCTS</h1>
            <p style={{ color: "#78716C", margin: "4px 0 0 0", fontSize: 14 }}>Manage your menu items</p>
          </div>
          <button onClick={openCreate} style={{ background: "#F59E0B", color: "#000", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            + Add Product
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#78716C" }}>Loading...</div>
        ) : queryError ? (
          <div style={{ textAlign: "center", padding: 60, color: "#EF4444" }}>Error loading products: {queryError.message}</div>
        ) : !productsData || !Array.isArray(productsData) ? (
          <div style={{ textAlign: "center", padding: 60, color: "#F59E0B" }}>No products found or invalid data format</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {productsData.map((product, idx) => (
              <ProductCard key={product.id} product={product} onEdit={openEdit} onDelete={handleDelete} delay={idx * 50} />
            ))}
          </div>
        )}

      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={closeModal}>
          <div style={{ background: "#1C1917", borderRadius: 16, padding: 32, maxWidth: 500, width: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, margin: "0 0 24px 0", textAlign: "center" }}>{editingProduct ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Product Name" value={form.name} onChange={set("name")} placeholder="e.g., Classic Cheeseburger" required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Price ($)" type="number" step="0.01" value={form.price} onChange={set("price")} placeholder="9.99" required />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#44403C" }}>Category</label>
                  <select value={form.category_id} onChange={set("category_id")} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#F5F5F4", fontFamily: "'Barlow',sans-serif", fontSize: 13, outline: "none" }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Description" value={form.description} onChange={set("description")} placeholder="Product description..." rows={3} />
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "#F59E0B" }} />
                    <span style={{ color: "#F5F5F4", fontSize: 13 }}>Featured Product</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="radio" name="status" checked={form.status === "active"} onChange={() => setForm(p => ({ ...p, status: "active" }))} style={{ accentColor: "#22C55E" }} />
                    <span style={{ color: "#F5F5F4", fontSize: 13 }}>Active</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="radio" name="status" checked={form.status === "inactive"} onChange={() => setForm(p => ({ ...p, status: "inactive" }))} style={{ accentColor: "#44403C" }} />
                    <span style={{ color: "#F5F5F4", fontSize: 13 }}>Inactive</span>
                  </label>
                </div>
              </div>
              <div>
                <div style={{ position: "relative", height: 150, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {form.image_url ? (
                    <img src={getProductImage(form)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#57534E" }}>No image</div>
                  )}
                </div>
                <Field label="Image URL" value={form.image_url || ""} onChange={set("image_url")} placeholder="https://example.com/image.jpg" />
              </div>
              {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", padding: "12px", borderRadius: 8, fontSize: 13 }}>{error}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#F5F5F4", border: "none", padding: "14px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: "#F59E0B", color: "#000", border: "none", padding: "14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{editingProduct ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

};

export default Products;