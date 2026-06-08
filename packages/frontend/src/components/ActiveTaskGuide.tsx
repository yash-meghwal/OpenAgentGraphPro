import { useMemo } from "react";
import { useStore } from "../lib/store.js";
import { getActiveTaskGuideSteps, shouldShowActiveTaskGuide } from "../lib/activeTaskGuide.js";

export function ActiveTaskGuide() {
  const {
    activeGraphId,
    activeTaskGuideDismissed,
    activeTaskStartHint,
    runWorkspaceRoot,
    runControlState,
    isRunning,
    completedNodeCount,
    selectedNodeId,
    nodes,
    dismissActiveTaskGuide,
    clearActiveTaskStartHint,
    graphs,
  } = useStore();

  const activeGraph = graphs.find((graph) => graph.id === activeGraphId) ?? null;
  const workspaceRoot = runWorkspaceRoot;

  const visible = shouldShowActiveTaskGuide({
    activeGraphId,
    activeTaskGuideDismissed,
    runControlState,
    isRunning,
    completedNodeCount,
  });

  const steps = useMemo(
    () =>
      getActiveTaskGuideSteps({
        workspaceRoot,
        runControlState,
        isRunning,
        completedNodeCount,
        selectedNodeId,
        nodeCount: nodes.length,
      }),
    [
      workspaceRoot,
      runControlState,
      isRunning,
      completedNodeCount,
      selectedNodeId,
      nodes.length,
    ]
  );

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Active task getting started guide"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: "min(360px, calc(100% - 32px))",
        background: "rgba(17, 24, 39, 0.96)",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 16,
        display: "grid",
        gap: 12,
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        zIndex: 20,
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Active task
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 800 }}>
            {activeGraph?.title ?? "Start this project"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            clearActiveTaskStartHint();
            dismissActiveTaskGuide();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Dismiss
        </button>
      </div>

      {activeTaskStartHint ? (
        <div
          style={{
            background: "rgba(37, 99, 235, 0.16)",
            border: "1px solid #2563eb",
            borderRadius: 10,
            color: "#dbeafe",
            fontSize: 13,
            lineHeight: 1.5,
            padding: "10px 12px",
            fontWeight: 700,
          }}
        >
          Your project is ready. Set your folder if needed, then click Run to start.
        </div>
      ) : (
        <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
          Follow these three steps to go from a new project to a living graph.
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr",
              gap: 10,
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: step.done ? "rgba(16, 185, 129, 0.2)" : "rgba(51, 65, 85, 0.5)",
                border: `1px solid ${step.done ? "#10b981" : "#475569"}`,
                color: step.done ? "#6ee7b7" : "#94a3b8",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {step.done ? "✓" : index + 1}
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 800 }}>{step.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.45 }}>{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}