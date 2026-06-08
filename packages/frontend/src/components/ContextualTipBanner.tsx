import { useEffect, useState } from "react";
import {
  CONTEXTUAL_TIPS,
  dismissContextualTip,
  isContextualTipDismissed,
  type ContextualTipId,
} from "../lib/contextualTips.js";

export function ContextualTipBanner(props: {
  tipId: ContextualTipId;
  visible: boolean;
}) {
  const [dismissed, setDismissed] = useState(() => isContextualTipDismissed(props.tipId));

  useEffect(() => {
    setDismissed(isContextualTipDismissed(props.tipId));
  }, [props.tipId]);

  if (!props.visible || dismissed) return null;

  const copy = CONTEXTUAL_TIPS[props.tipId];

  return (
    <div
      role="note"
      aria-label={copy.title}
      style={{
        background: "rgba(37, 99, 235, 0.14)",
        border: "1px solid #2563eb",
        borderRadius: 10,
        color: "#dbeafe",
        fontSize: 12,
        lineHeight: 1.45,
        padding: "10px 12px",
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div style={{ fontWeight: 800, color: "#eff6ff" }}>{copy.title}</div>
        <button
          type="button"
          onClick={() => {
            dismissContextualTip(props.tipId);
            setDismissed(true);
          }}
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
          Dismiss
        </button>
      </div>
      <div>{copy.body}</div>
    </div>
  );
}