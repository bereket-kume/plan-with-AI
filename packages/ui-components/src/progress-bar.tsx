export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string;
}

export function ProgressBar({ value, label, color = "#4f46e5" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            marginBottom: "0.25rem",
            color: "#64748b",
          }}
        >
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        style={{
          background: "#e2e8f0",
          borderRadius: "9999px",
          height: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            background: color,
            height: "100%",
            borderRadius: "9999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
