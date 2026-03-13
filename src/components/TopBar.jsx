import React from "react";

export default function TopBar({ title, subtitle, actions }) {
  return (
    <div style={{ height: 54, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 22px", gap: 16, flexShrink: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}
