import { describe, expect, it } from "vitest";
import type { AgentPlanProposalRecord, DashboardRunSummary } from "@openagentgraph/shared";
import {
  buildApprovalQueue,
  buildMiniGraphPreview,
  buildSupervisorNextAction,
  buildSupervisorProjectStatus,
} from "./supervisorHome.js";

function makeRun(overrides: Partial<DashboardRunSummary> = {}): DashboardRunSummary {
  return {
    graphId: "graph-1",
    goalTitle: "Ship onboarding",
    lifecycleBucket: "active",
    graphStatus: "running",
    runControlState: "running",
    frontierStatus: "on_track",
    needsHumanReview: false,
    approvalState: "not_requested",
    waitingForApproval: false,
    alertCount: 0,
    completedNodeCount: 1,
    plannedNodeCount: 4,
    passRate: 1,
    revisionRate: 0,
    evidenceCoverageRate: 0.5,
    lastEventAt: "2026-06-04T00:00:00.000Z",
    lastEventSequence: 2,
    attentionScore: 40,
    attentionLabel: "medium",
    ...overrides,
  };
}

const proposal: AgentPlanProposalRecord = {
  proposalId: "proposal-1",
  graphId: "graph-1",
  createdAt: "2026-06-04T00:02:00.000Z",
  agent: { agentId: "gemini", displayName: "Gemini", kind: "gemini" },
  title: "Add welcome checklist",
  summary: "Propose a short checklist for first-time users.",
  nodes: [{ title: "Write checklist", intent: "Cover the first-run path." }],
};

describe("supervisor home helpers", () => {
  it("prioritizes approval over proposals and monitoring", () => {
    const action = buildSupervisorNextAction({
      focusRun: makeRun({
        waitingForApproval: true,
        latestDecisionSummary: "Approve the deployment step.",
      }),
      openProposalCount: 2,
      uiMode: "default",
    });

    expect(action.kind).toBe("approval");
    expect(action.actionLabel).toBe("Review and approve");
    expect(action.detail).toContain("Approve the deployment step");
  });

  it("falls back to suggestions when no urgent run flags exist", () => {
    const action = buildSupervisorNextAction({
      focusRun: makeRun(),
      openProposalCount: 1,
      uiMode: "default",
    });

    expect(action.kind).toBe("proposal");
    expect(action.title).toBe("Suggestions waiting for you");
  });

  it("builds frontier-based mini graph preview nodes", () => {
    const preview = buildMiniGraphPreview({
      focusRun: makeRun(),
      frontier: [
        {
          nodeId: "node-1",
          title: "Draft copy",
          kind: "work",
          status: "running",
          humanSummary: "Write welcome text.",
          dependsOnNodeIds: [],
          updatedAt: "2026-06-04T00:00:00.000Z",
        },
      ],
      uiMode: "default",
    });

    expect(preview).toHaveLength(1);
    expect(preview[0]?.title).toBe("Draft copy");
    expect(preview[0]?.statusLabel).toBe("Running");
  });

  it("builds placeholder preview steps from run progress when frontier is empty", () => {
    const preview = buildMiniGraphPreview({
      focusRun: makeRun({ completedNodeCount: 2, plannedNodeCount: 4 }),
      frontier: [],
      uiMode: "default",
      maxNodes: 4,
    });

    expect(preview.map((node) => node.status)).toEqual(["completed", "completed", "ready", "pending"]);
  });

  it("orders the approval queue with proposals and run-level flags", () => {
    const queue = buildApprovalQueue({
      focusRun: makeRun({ graphId: "graph-1" }),
      proposals: [proposal],
      allRuns: [
        makeRun({ graphId: "graph-1", waitingForApproval: true, goalTitle: "Ship onboarding" }),
        makeRun({
          graphId: "graph-2",
          goalTitle: "Fix checkout",
          needsHumanReview: true,
          humanReviewReason: "Evidence looks thin.",
        }),
      ],
      uiMode: "default",
    });

    expect(queue.map((item) => item.kind)).toEqual(["proposal", "approval", "review"]);
    expect(queue[0]?.proposalId).toBe("proposal-1");
  });

  it("summarizes current project status for simple mode", () => {
    const status = buildSupervisorProjectStatus({
      focusRun: makeRun({ latestNotificationSummary: "Step two finished cleanly." }),
      frontierSummary: {
        readyCount: 1,
        runningCount: 1,
        blockedCount: 0,
        openProposalCount: 1,
      },
      dashboardSummary: {
        urgentRunCount: 1,
        needsReviewCount: 0,
        blockedRunCount: 0,
        activeRunCount: 2,
        archivedRunCount: 0,
      },
      uiMode: "default",
    });

    expect(status.headline).toContain("Ship onboarding");
    expect(status.lines.some((line) => line.includes("1/4 steps"))).toBe(true);
    expect(status.lines.some((line) => line.includes("1 suggestion"))).toBe(true);
    expect(status.lines).toContain("Step two finished cleanly.");
  });
});