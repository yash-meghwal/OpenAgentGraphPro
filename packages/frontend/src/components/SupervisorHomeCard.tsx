import { useMemo, useState } from "react";
import type {
  AgentPlanProposalRecord,
  DashboardOverview,
  DashboardRunSummary,
  GraphFrontierNodeSummary,
} from "@openagentgraph/shared";
import { sanitizeOperationalText } from "@openagentgraph/shared";
import { EXECUTION_STATUS_COLORS } from "../lib/productCopy.js";
import {
  buildApprovalQueue,
  buildMiniGraphPreview,
  buildSupervisorNextAction,
  buildSupervisorProjectStatus,
  type ApprovalQueueItem,
  type SupervisorNextActionKind,
} from "../lib/supervisorHome.js";

type FrontierSummary = {
  readyCount: number;
  runningCount: number;
  blockedCount: number;
  openProposalCount: number;
};

const nextActionTone: Record<SupervisorNextActionKind, { border: string; accent: string; background: string }> = {
  approval: { border: "#9b2c2c", accent: "#feb2b2", background: "rgba(155, 44, 44, 0.18)" },
  review: { border: "#c05621", accent: "#fbd38d", background: "rgba(192, 86, 33, 0.18)" },
  blocked: { border: "#975a16", accent: "#faf089", background: "rgba(151, 90, 22, 0.18)" },
  proposal: { border: "#2c5282", accent: "#90cdf4", background: "rgba(44, 82, 130, 0.18)" },
  catch_up: { border: "#2b6cb0", accent: "#bee3f8", background: "rgba(43, 108, 176, 0.18)" },
  monitor: { border: "#276749", accent: "#9ae6b4", background: "rgba(39, 103, 73, 0.18)" },
  all_clear: { border: "#374151", accent: "#cbd5e1", background: "rgba(55, 65, 81, 0.25)" },
};

function safeDisplayText(value: string | undefined, maxLength = 500) {
  return sanitizeOperationalText(value ?? "", { maxLength });
}

function queueKindLabel(kind: ApprovalQueueItem["kind"], uiMode: "default" | "developer") {
  if (uiMode === "developer") {
    return kind === "proposal" ? "Proposal" : kind === "approval" ? "Approval" : "Review";
  }
  return kind === "proposal" ? "Suggestion" : kind === "approval" ? "Approval" : "Review";
}

export function SupervisorHomeCard({
  focusRun,
  allRuns,
  frontier,
  frontierSummary,
  proposals,
  dashboardSummary,
  uiMode,
  canManage,
  loading,
  onOpenGraph,
  onAcceptProposal,
  onDismissProposal,
}: {
  focusRun: DashboardRunSummary;
  allRuns: DashboardRunSummary[];
  frontier: GraphFrontierNodeSummary[];
  frontierSummary: FrontierSummary | null;
  proposals: AgentPlanProposalRecord[];
  dashboardSummary: DashboardOverview["summary"];
  uiMode: "default" | "developer";
  canManage: boolean;
  loading: boolean;
  onOpenGraph: (graphId: string) => Promise<void>;
  onAcceptProposal: (graphId: string, proposalId: string) => Promise<void>;
  onDismissProposal: (graphId: string, proposalId: string, reason?: string) => Promise<void>;
}) {
  const [dismissReasons, setDismissReasons] = useState<Record<string, string>>({});
  const openProposalCount = frontierSummary?.openProposalCount ?? proposals.length;

  const nextAction = useMemo(
    () =>
      buildSupervisorNextAction({
        focusRun,
        openProposalCount,
        uiMode,
      }),
    [focusRun, openProposalCount, uiMode]
  );

  const previewNodes = useMemo(
    () =>
      buildMiniGraphPreview({
        focusRun,
        frontier,
        uiMode,
      }),
    [focusRun, frontier, uiMode]
  );

  const queueItems = useMemo(
    () =>
      buildApprovalQueue({
        focusRun,
        proposals,
        allRuns,
        uiMode,
      }),
    [allRuns, focusRun, proposals, uiMode]
  );

  const projectStatus = useMemo(
    () =>
      buildSupervisorProjectStatus({
        focusRun,
        frontierSummary,
        dashboardSummary,
        uiMode,
      }),
    [dashboardSummary, focusRun, frontierSummary, uiMode]
  );

  const tone = nextActionTone[nextAction.kind];

  return (
    <section
      aria-label={uiMode === "developer" ? "Supervisor home" : "What needs you now"}
      style={{
        background: "#0b1220",
        border: "1px solid #1e3a5f",
        borderRadius: 18,
        padding: 16,
        display: "grid",
        gap: 14,
        boxShadow: "0 16px 36px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ color: "#63b3ed", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {uiMode === "developer" ? "Supervisor home" : "Home"}
          </div>
          <div style={{ color: "#f8fafc", fontSize: 20, fontWeight: 900 }}>
            {uiMode === "developer" ? "What needs supervision now" : "What needs you now?"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onOpenGraph(focusRun.graphId)}
          style={{
            background: "#1d4ed8",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {uiMode === "developer" ? "Open focus run" : "Open this project"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            background: tone.background,
            border: `1px solid ${tone.border}`,
            borderRadius: 14,
            padding: 14,
            display: "grid",
            gap: 10,
            alignContent: "start",
          }}
        >
          <div style={{ color: tone.accent, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
            {uiMode === "developer" ? "Next action" : "Your next step"}
          </div>
          <div style={{ color: "#f8fafc", fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{nextAction.title}</div>
          <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.45 }}>{safeDisplayText(nextAction.detail, 320)}</div>
          <button
            type="button"
            onClick={() => void onOpenGraph(nextAction.graphId)}
            style={{
              justifySelf: "start",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {nextAction.actionLabel}
          </button>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #263244",
            borderRadius: 14,
            padding: 14,
            display: "grid",
            gap: 8,
            alignContent: "start",
          }}
        >
          <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 800 }}>
            {uiMode === "developer" ? "Approvals and suggestions queue" : "Waiting for you"}
          </div>
          {queueItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #263244",
                borderRadius: 10,
                padding: 10,
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
                <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}>
                  {safeDisplayText(item.title, 160)}
                </div>
                <span
                  style={{
                    color: "#93c5fd",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {queueKindLabel(item.kind, uiMode)}
                </span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.4 }}>{safeDisplayText(item.detail, 280)}</div>
              {item.kind === "proposal" && item.proposalId ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={!canManage || loading}
                    onClick={() => void onAcceptProposal(item.graphId, item.proposalId!)}
                    style={{
                      background: canManage && !loading ? "#065f46" : "#1f2937",
                      color: "#f8fafc",
                      border: "1px solid #276749",
                      borderRadius: 8,
                      padding: "6px 9px",
                      cursor: canManage && !loading ? "pointer" : "not-allowed",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {uiMode === "developer" ? "Accept" : "Accept suggestion"}
                  </button>
                  <button
                    type="button"
                    disabled={!canManage || loading}
                    onClick={() =>
                      void onDismissProposal(item.graphId, item.proposalId!, dismissReasons[item.proposalId!])
                    }
                    style={{
                      background: "#0f172a",
                      color: "#cbd5e1",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      padding: "6px 9px",
                      cursor: canManage && !loading ? "pointer" : "not-allowed",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ) : item.kind !== "review" || !item.id.startsWith("clear:") ? (
                <button
                  type="button"
                  onClick={() => void onOpenGraph(item.graphId)}
                  style={{
                    justifySelf: "start",
                    background: "#1f2937",
                    color: "#e2e8f0",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    padding: "6px 9px",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {uiMode === "developer" ? "Open run" : "Open project"}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#111827",
          border: "1px solid #263244",
          borderRadius: 14,
          padding: 14,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 800 }}>
          {uiMode === "developer" ? "Mini graph preview" : "Steps on this project"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {previewNodes.map((node) => {
            const previewTitle = safeDisplayText(node.title, 80);
            return (
            <div
              key={node.nodeId}
              title={`${previewTitle} · ${node.statusLabel}`}
              style={{
                minWidth: 120,
                maxWidth: 220,
                flex: "1 1 120px",
                background: "#0f172a",
                border: `1px solid ${EXECUTION_STATUS_COLORS[node.status] ?? "#334155"}`,
                borderRadius: 10,
                padding: "8px 10px",
                display: "grid",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: EXECUTION_STATUS_COLORS[node.status] ?? "#64748b",
                }}
              />
              <div style={{ color: "#e2e8f0", fontSize: 11, fontWeight: 800, lineHeight: 1.3 }}>
                {previewTitle}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700 }}>{node.statusLabel}</div>
            </div>
          );
          })}
        </div>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #263244",
          borderRadius: 14,
          padding: 14,
          display: "grid",
          gap: 6,
        }}
      >
        <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
          {uiMode === "developer" ? "Current project status" : "Project status"}
        </div>
        <div style={{ color: "#f8fafc", fontSize: 15, fontWeight: 800 }}>{projectStatus.headline}</div>
        {projectStatus.lines.map((line) => (
          <div key={line} style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.45 }}>
            {safeDisplayText(line, 320)}
          </div>
        ))}
      </div>
    </section>
  );
}