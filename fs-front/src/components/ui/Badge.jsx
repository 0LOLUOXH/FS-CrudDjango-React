import React from "react";

export function Badge({ children, status, color, className = "", ...props }) {
  let badgeClass = "badge green";

  const s = String(status || color || "").toLowerCase();
  if (
    ["pending", "pendiente", "orange", "bajo stock", "critico", "baja"].some(
      (k) => s.includes(k)
    )
  ) {
    badgeClass = "badge orange";
  } else if (
    ["process", "proceso", "en proceso", "revision", "yellow", "medio"].some(
      (k) => s.includes(k)
    )
  ) {
    badgeClass = "badge yellow";
  } else if (
    [
      "completed",
      "completado",
      "activo",
      "finalizado",
      "disponible",
      "bueno",
      "green",
    ].some((k) => s.includes(k))
  ) {
    badgeClass = "badge green";
  } else if (
    ["danger", "cancelado", "rechazado", "red", "agotado", "dañado"].some(
      (k) => s.includes(k)
    )
  ) {
    badgeClass = "badge red";
  }

  return (
    <span className={`${badgeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
