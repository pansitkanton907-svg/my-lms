import React from "react";

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = "default" }) => {
  const map = {
    default: ["#f1f5f9", "#475569"], success: ["#d1fae5", "#065f46"],
    warning: ["#fef3c7", "#92400e"], danger:  ["#fee2e2", "#991b1b"],
    info:    ["#dbeafe", "#1e40af"], purple:  ["#ede9fe", "#5b21b6"],
    amber:   ["#fef3c7", "#b45309"],
  };
  const [bg, txt] = map[color] || map.default;
  return (
    <span style={{ background: bg, color: txt, padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = (props) => (
  <input
    {...props}
    style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "#1e293b", outline: "none", background: "#fff", width: "100%", ...props.style }}
    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
    onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
  />
);

// ─── Sel ──────────────────────────────────────────────────────────────────────
export const Sel = ({ children, ...props }) => (
  <select
    {...props}
    style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "#1e293b", outline: "none", background: "#fff", width: "100%", cursor: "pointer", ...props.style }}
    onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
    onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; }}
  >
    {children}
  </select>
);

// ─── Btn ──────────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = "primary", size = "md", style: sx, ...rest }) => {
  const vs = {
    primary:   { background: "#4f46e5", color: "#fff",    border: "none" },
    secondary: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
    danger:    { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" },
    success:   { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" },
    ghost:     { background: "transparent", color: "#4f46e5", border: "none" },
  };
  const ps = { sm: "5px 10px", md: "8px 16px", lg: "10px 22px" };
  return (
    <button
      {...rest}
      style={{ ...vs[variant] || vs.primary, padding: ps[size] || ps.md, borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity .15s, transform .1s", ...sx }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      onMouseDown={e  => e.currentTarget.style.transform = "scale(0.97)"}
      onMouseUp={e    => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
};

// ─── FF (Form Field) ──────────────────────────────────────────────────────────
export const FF = ({ label, required, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: "#ef4444" }}>{error}</span>}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style: sx }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, ...sx }}>
    {children}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ msg }) => msg ? (
  <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "9px 14px", color: "#065f46", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
    ✓ {msg}
  </div>
) : null;
