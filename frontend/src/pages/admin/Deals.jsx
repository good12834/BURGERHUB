import React from 'react';

const AdminDeals = () => {
  return (
    <div style={{ padding: "40px", animation: "fadeIn 0.35s ease" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: "#F5F5F4", marginBottom: "8px" }}>Deals & Coupons</h1>
      <p style={{ fontFamily: "'Barlow', sans-serif", color: "#44403C", letterSpacing: "0.02em" }}>Create and manage promotional offers to boost your restaurant sales.</p>
      
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "60px", height: "60px", background: "rgba(245,158,11,0.1)", borderRadius: "50%" }} />
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#F5F5F4" }}>FLASH DEALS</h3>
          <p style={{ color: "#78716C", fontSize: "12px", marginTop: "4px" }}>Manage time-limited offers.</p>
        </div>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#F5F5F4" }}>COUPON CODES</h3>
          <p style={{ color: "#78716C", fontSize: "12px", marginTop: "4px" }}>Generate promo codes for loyal customers.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDeals;
