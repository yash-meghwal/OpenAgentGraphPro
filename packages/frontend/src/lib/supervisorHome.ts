import type {
  AgentPlanProposalRecord,
  DashboardOverview,
  DashboardRunSummary,
  GraphFrontierNodeSummary,
  NodeStatus,
} from "@openagentgraph/shared";
import { getSimpleNodeStatusLabel } from "./activeTaskGuide.js";
import {
  formatAttentionLabel,
  formatFrontierStatusLabel,
  formatGraphStatusLabel,
  formatRunControlStateLabel,
} from "./productCopy.js";

export type SupervisorNextActionKind =
  | "approval"
  | "review"
  | "blocked"
  | "proposal"
  | "catch_up"
  | "monitor"
  | "all_clear";

export type SupervisorNextAction = {
  kind: SupervisorNextActionKind;
  title: string;
  detail: string;
  actionLabel: string;
  graphId: string;
};

export type MiniGraphPreviewNode = {
  nodeId: string;
  title: string;
  status: NodeStatus;
  statusLabel: string;
};

export type ApprovalQueueItemKind = "approval" | "review" | "proposal";

export type ApprovalQueueItem = {
  id: string;
  kind: ApprovalQueueItemKind;
  title: string;
  detail: string;
  graphId: string;
  proposalId?: string;
};

export type SupervisorProjectStatus = {
  projectTitle: string;
  headline: string;
  lines: string[];
};

type FrontierSummary = {
  readyCount: number;
  runningCount: number;
  blockedCount: number;
  openProposalCount: number;
};

function formatStepStatusLabel(status: NodeStatus, uiMode: "default" | "developer"): string {
  return uiMode === "developer" ? status : getSimpleNodeStatusLabel({ status });
}

export function buildSupervisorNextAction(input: {
  focusRun: DashboardRunSummary;
  openProposalCount: number;
  uiMode: "default" | "developer";
}): SupervisorNextAction {
  const { focusRun, openProposalCount, uiMode } = input;
  const projectName = focusRun.goalTitle;

  if (focusRun.waitingForApproval) {
    return {
      kind: "approval",
      title: uiMode === "developer" ? "Approval waiting" : "A step needs your approval",
      detail:
        focusRun.latestDecisionSummary ||
        focusRun.latestNotificationSummary ||
        `Open ${projectName} to review and approve the next step.`,
      actionLabel: uiMode === "developer" ? "Open run for approval" : "Review and approve",
      graphId: focusRun.graphId,
    };
  }

  if (focusRun.needsHumanReview) {
    return {
      kind: "review",
      title: uiMode === "developer" ? "Human review required" : "Something needs your review",
      detail:
        focusRun.humanReviewReason ||
        focusRun.latestNotificationSummary ||
        `Open ${projectName} to review flagged work.`,
      actionLabel: uiMode === "developer" ? "Open run for review" : "Review now",
      graphId: focusRun.graphId,
    };
  }

  if (focusRun.frontierStatus === "blocked") {
    return {
      kind: "blocked",
      title: uiMode === "developer" ? "Run blocked" : "This project is stuck",
      detail:
        focusRun.latestNotificationSummary ||
        `Open ${projectName} to see what is blocking progress.`,
      actionLabel: uiMode === "developer" ? "Open blocked run" : "See what is stuck",
      graphId: focusRun.graphId,
    };
  }

  if (openProposalCount > 0) {
    return {
      kind: "proposal",
      title: uiMode === "developer" ? "Open agent proposals" : "Suggestions waiting for you",
      detail:
        uiMode === "developer"
          ? `${openProposalCount} open proposal${openProposalCount === 1 ? "" : "s"} on ${projectName}.`
          : `${openProposalCount} suggestion${openProposalCount === 1 ? "" : "s"} to review on ${projectName}.`,
      actionLabel: uiMode === "developer" ? "Review proposals" : "Review suggestions",
      graphId: focusRun.graphId,
    };
  }

  const newEvents = focusRun.changesSinceLastViewed?.newEventCount ?? 0;
  if (newEvents > 0) {
    return {
      kind: "catch_up",
      title: uiMode === "developer" ? "New run activity" : "Catch up on updates",
      detail:
        focusRun.changesSinceLastViewed?.changesSinceLastViewedSummary ||
        `${newEvents} new update${newEvents === 1 ? "" : "s"} on ${projectName}.`,
      actionLabel: uiMode === "developer" ? "Open run updates" : "See what changed",
      graphId: focusRun.graphId,
    };
  }

  if (focusRun.runControlState === "running" || focusRun.graphStatus === "running") {
    return {
      kind: "monitor",
      title: uiMode === "developer" ? "Run in progress" : "Work is moving along",
      detail:
        focusRun.latestCompletedNodeSummary ||
        focusRun.latestNotificationSummary ||
        `${projectName} is running. Open it to watch progress.`,
      actionLabel: uiMode === "developer" ? "Open active run" : "Open project",
      graphId: focusRun.graphId,
    };
  }

  return {
    kind: "all_clear",
    title: uiMode === "developer" ? "No urgent supervisor action" : "You are caught up",
    detail:
      focusRun.latestNotificationSummary ||
      `${projectName} has no urgent approvals or reviews right now.`,
    actionLabel: uiMode === "developer" ? "Open focus run" : "Open project",
    graphId: focusRun.graphId,
  };
}

export function buildMiniGraphPreview(input: {
  focusRun: DashboardRunSummary;
  frontier: GraphFrontierNodeSummary[];
  uiMode: "default" | "developer";
  maxNodes?: number;
}): MiniGraphPreviewNode[] {
  const maxNodes = input.maxNodes ?? 5;
  if (input.frontier.length > 0) {
    return input.frontier.slice(0, maxNodes).map((node) => ({
      nodeId: node.nodeId,
      title: node.title,
      status: node.status,
      statusLabel: formatStepStatusLabel(node.status, input.uiMode),
    }));
  }

  const planned = Math.max(input.focusRun.plannedNodeCount, 1);
  const completed = Math.min(input.focusRun.completedNodeCount, planned);
  const placeholders: MiniGraphPreviewNode[] = [];

  for (let index = 0; index < Math.min(planned, maxNodes); index += 1) {
    const status: NodeStatus = index < completed ? "completed" : index === completed ? "ready" : "pending";
    placeholders.push({
      nodeId: `placeholder-${index}`,
      title:
        index < completed
          ? input.uiMode === "developer"
            ? `Completed step ${index + 1}`
            : `Done step ${index + 1}`
          : index === completed
            ? input.uiMode === "developer"
              ? "Next runnable step"
              : "Next step"
            : input.uiMode === "developer"
              ? `Planned step ${index + 1}`
              : `Upcoming step ${index + 1}`,
      status,
      statusLabel: formatStepStatusLabel(status, input.uiMode),
    });
  }

  return placeholders;
}

export function buildApprovalQueue(input: {
  focusRun: DashboardRunSummary;
  proposals: AgentPlanProposalRecord[];
  allRuns: DashboardRunSummary[];
  uiMode: "default" | "developer";
  maxItems?: number;
}): ApprovalQueueItem[] {
  const maxItems = input.maxItems ?? 5;
  const items: ApprovalQueueItem[] = [];
  const seen = new Set<string>();

  const push = (item: ApprovalQueueItem) => {
    if (seen.has(item.id) || items.length >= maxItems) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const proposal of input.proposals) {
    push({
      id: `proposal:${proposal.proposalId}`,
      kind: "proposal",
      title: proposal.title,
      detail: proposal.summary,
      graphId: proposal.graphId,
      proposalId: proposal.proposalId,
    });
  }

  for (const run of input.allRuns) {
    if (!run.waitingForApproval) continue;
    push({
      id: `approval:${run.graphId}`,
      kind: "approval",
      title: run.goalTitle,
      detail:
        run.latestDecisionSummary ||
        run.latestNotificationSummary ||
        (input.uiMode === "developer" ? "Waiting for approval." : "A step is waiting for your approval."),
      graphId: run.graphId,
    });
  }

  for (const run of input.allRuns) {
    if (!run.needsHumanReview || run.waitingForApproval) continue;
    push({
      id: `review:${run.graphId}`,
      kind: "review",
      title: run.goalTitle,
      detail:
        run.humanReviewReason ||
        run.latestNotificationSummary ||
        (input.uiMode === "developer" ? "Needs human review." : "Needs your review."),
      graphId: run.graphId,
    });
  }

  if (items.length === 0 && input.focusRun.graphId) {
    push({
      id: `clear:${input.focusRun.graphId}`,
      kind: "review",
      title: input.uiMode === "developer" ? "Queue is clear" : "Nothing waiting right now",
      detail:
        input.uiMode === "developer"
          ? "No approvals, reviews, or open proposals on the current frontier."
          : "No approvals or suggestions need you on this project right now.",
      graphId: input.focusRun.graphId,
    });
  }

  return items;
}

export function buildSupervisorProjectStatus(input: {
  focusRun: DashboardRunSummary;
  frontierSummary: FrontierSummary | null;
  dashboardSummary: DashboardOverview["summary"];
  uiMode: "default" | "developer";
}): SupervisorProjectStatus {
  const { focusRun, frontierSummary, dashboardSummary, uiMode } = input;
  const progress =
    focusRun.plannedNodeCount > 0
      ? `${focusRun.completedNodeCount}/${focusRun.plannedNodeCount} steps`
      : `${focusRun.completedNodeCount} steps completed`;

  const headline =
    uiMode === "developer"
      ? `${focusRun.goalTitle} · ${formatAttentionLabel(focusRun.attentionLabel)}`
      : `${focusRun.goalTitle} · ${formatAttentionLabel(focusRun.attentionLabel)}`;

  const lines = [
    uiMode === "developer"
      ? `Status: ${focusRun.graphStatus} · Run: ${focusRun.runControlState}`
      : `Status: ${formatGraphStatusLabel(focusRun.graphStatus)} · ${formatRunControlStateLabel(focusRun.runControlState)}`,
    uiMode === "developer"
      ? `Progress: ${progress} · Frontier: ${focusRun.frontierStatus}`
      : `Progress: ${progress} · Health: ${formatFrontierStatusLabel(focusRun.frontierStatus)}`,
    uiMode === "developer"
      ? `Workspace: ${dashboardSummary.activeRunCount} active, ${dashboardSummary.urgentRunCount} urgent, ${dashboardSummary.needsReviewCount} need review`
      : `${dashboardSummary.activeRunCount} project${dashboardSummary.activeRunCount === 1 ? "" : "s"} in progress · ${dashboardSummary.urgentRunCount} need you now`,
  ];

  if (frontierSummary) {
    lines.push(
      uiMode === "developer"
        ? `Frontier load: ${frontierSummary.readyCount} ready, ${frontierSummary.runningCount} running, ${frontierSummary.blockedCount} blocked, ${frontierSummary.openProposalCount} proposals`
        : `${frontierSummary.runningCount} running now · ${frontierSummary.readyCount} ready · ${frontierSummary.openProposalCount} suggestion${frontierSummary.openProposalCount === 1 ? "" : "s"}`
    );
  }

  if (focusRun.latestNotificationSummary) {
    lines.push(focusRun.latestNotificationSummary);
  }

  return {
    projectTitle: focusRun.goalTitle,
    headline,
    lines,
  };
}