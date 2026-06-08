import { useState, type ReactNode } from "react";

const SECTION_TITLE: React.CSSProperties = {
  color: "#718096",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
};

export function CollapsibleTechnicalSection(props: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  toggleLabel?: string;
}) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const toggleLabel = props.toggleLabel ?? "Show technical details";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: open ? 6 : 0 }}>
        <p style={{ ...SECTION_TITLE, marginBottom: 0 }}>{props.title}</p>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          style={{
            background: "transparent",
            border: "none",
            color: "#93c5fd",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            padding: 0,
            whiteSpace: "nowrap",
          }}
        >
          {open ? "Hide details" : toggleLabel}
        </button>
      </div>
      {open ? props.children : null}
    </div>
  );
}