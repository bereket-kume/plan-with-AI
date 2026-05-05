import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, children, style }: CardProps) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        padding: "1rem 1.25rem",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {title && (
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem", fontWeight: 600 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
