import React from "react";

export function FloatingInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  className = "",
  required = false,
  ...props
}) {
  const hasVal =
    value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className={`float-group ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className={hasVal ? "has-val" : ""}
        {...props}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

export function FloatingSelect({
  label,
  id,
  value,
  onChange,
  children,
  className = "",
  required = false,
  ...props
}) {
  const hasVal =
    value !== undefined && value !== null && String(value).trim().length > 0;

  return (
    <div className={`float-group ${className}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={hasVal ? "has-val" : ""}
        {...props}
      >
        {children}
      </select>
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

export default FloatingInput;
