import React from 'react';

const Drivers = () => {
  return (
    <div style={{ padding: "40px", animation: "fadeIn 0.35s ease" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: "#F5F5F4", marginBottom: "8px" }}>Driver Management</h1>
      <p style={{ fontFamily: "'Barlow', sans-serif", color: "#44403C", letterSpacing: "0.02em" }}>Track and manage your delivery fleet in real-time.</p>
      
      <div style={{ marginTop: "32px", background: "#0F0D0B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "60px", textAlign: "center", color: "#3D3632" }}>
           <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛵</div>
           <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px" }}>No Drivers Active</div>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
