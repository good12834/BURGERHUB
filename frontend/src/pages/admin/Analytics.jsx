import React from 'react';

const Analytics = () => {
  return (
    <div style={{ padding: "40px", animation: "fadeIn 0.35s ease" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: "#F5F5F4", marginBottom: "8px" }}>Analytics</h1>
      <p style={{ fontFamily: "'Barlow', sans-serif", color: "#44403C", letterSpacing: "0.02em" }}>Detailed data insights and performance metrics coming soon to your control room.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "32px" }}>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#2D2926", fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px" }}>Revenue Growth Chart</span>
        </div>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#2D2926", fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px" }}>Customer Retention</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
