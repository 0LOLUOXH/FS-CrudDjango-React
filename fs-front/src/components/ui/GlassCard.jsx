import React from "react";

export function GlassCard({
  children,
  className = "",
  stagger = false,
  style = {},
  ...props
}) {
  return (
    <div
      className={`glass-card ${stagger ? "stagger-item" : ""} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
