import React from 'react';

const Settings = () => {
  return (
    <div style={{ padding: "40px", animation: "fadeIn 0.35s ease" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: "#F5F5F4", marginBottom: "8px" }}>Settings</h1>
      <p style={{ fontFamily: "'Barlow', sans-serif", color: "#44403C", letterSpacing: "0.02em" }}>Configure your restaurant and control room preferences.</p>
      
      <div style={{ maxWidth: "600px", marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "14px", color: "#F59E0B", textTransform: "uppercase", marginBottom: "16px" }}>Store Configuration</h3>
          <div style={{ color: "#78716C", fontSize: "13px" }}>Coming soon...</div>
        </div>
        <div style={{ background: "#131110", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "14px", color: "#F59E0B", textTransform: "uppercase", marginBottom: "16px" }}>Admin Accounts</h3>
          <div style={{ color: "#78716C", fontSize: "13px" }}>Coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
