import React from "react";

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fff", padding: "0 20px", flexShrink: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: active === t.id ? "#4f46e5" : "#64748b", borderBottom: `2px solid ${active === t.id ? "#4f46e5" : "transparent"}`, marginBottom: -1, transition: "color .15s", whiteSpace: "nowrap" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
