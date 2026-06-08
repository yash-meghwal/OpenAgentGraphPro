import { PROJECT_TEMPLATES } from "../lib/projectTemplates.js";

export function ProjectTemplatePicker(props: {
  selectedId: string | null;
  onSelect: (templateId: string | null, title: string, goal: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.45 }}>
        Start from a template, or write your own below.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {PROJECT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() =>
              props.onSelect(
                props.selectedId === template.id ? null : template.id,
                props.selectedId === template.id ? "" : template.title,
                props.selectedId === template.id ? "" : template.goal
              )
            }
            style={{
              textAlign: "left",
              background: props.selectedId === template.id ? "rgba(37, 99, 235, 0.18)" : "#0f172a",
              border: `1px solid ${props.selectedId === template.id ? "#2563eb" : "#374151"}`,
              borderRadius: 10,
              color: "#e2e8f0",
              cursor: "pointer",
              display: "grid",
              gap: 2,
              padding: "10px 12px",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800 }}>{template.title}</span>
            <span style={{ color: "#94a3b8", fontSize: 11 }}>{template.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}