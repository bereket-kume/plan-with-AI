import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, style, ...rest }: InputProps) {
  const inputId = id ?? (label ? label.toString().replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "0.5rem",
          padding: "0.45rem 0.75rem",
          fontSize: "0.9rem",
          outline: "none",
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}
