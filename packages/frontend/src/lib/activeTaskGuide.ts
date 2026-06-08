import type { Node, RunControlState } from "@openagentgraph/shared";

export type SimpleStepStatus = "pending" | "ready" | "running" | "completed" | "failed" | "blocked" | "superseded";

export const SIMPLE_GRAPH_LEGEND: Array<{
  status: SimpleStepStatus;
  label: string;
  description: string;
}> = [
  { status: "ready", label: "Ready", description: "Waiting to start" },
  { status: "running", label: "Running", description: "In progress now" },
  { status: "completed", label: "Done", description: "Finished successfully" },
  { status: "blocked", label: "Blocked", description: "Needs your attention" },
  { status: "pending", label: "Waiting", description: "Not started yet" },
];

export function getSimpleNodeStatusLabel(node: Pick<Node, "status">): string {
  switch (node.status) {
    case "running":
      return "Running";
    case "ready":
      return "Ready";
    case "completed":
      return "Done";
    case "failed":
    case "blocked":
      return "Blocked";
    case "superseded":
      return "Skipped";
    case "pending":
    default:
      return "Waiting";
  }
}

export function getActiveTaskGuideSteps(input: {
  workspaceRoot: string;
  runControlState: RunControlState;
  isRunning: boolean;
  completedNodeCount: number;
  selectedNodeId: string | null;
  nodeCount: number;
}) {
  const folderReady = Boolean(input.workspaceRoot.trim());
  const runStarted =
    input.isRunning ||
    input.runControlState === "running" ||
    input.runControlState === "paused" ||
    input.runControlState === "stopped" ||
    input.completedNodeCount > 0 ||
    input.nodeCount > 0;
  const exploring = Boolean(input.selectedNodeId) || input.completedNodeCount > 0;

  return [
    {
      id: "folder",
      title: "Set your project folder",
      detail: folderReady
        ? "Folder path is set in the top bar."
        : "Paste the folder path for this project in the top bar.",
      done: folderReady,
    },
    {
      id: "run",
      title: "Click Run",
      detail: runStarted
        ? "Work has started. Steps will appear on the graph."
        : "Run plans the work and fills in the graph step by step.",
      done: runStarted,
    },
    {
      id: "explore",
      title: "Click a step to read what it means",
      detail: exploring
        ? "Use the right panel to review the selected step."
        : "Select any glowing step on the graph to open its plain-English summary.",
      done: exploring,
    },
  ] as const;
}

export function shouldShowActiveTaskGuide(input: {
  activeGraphId: string | null;
  activeTaskGuideDismissed: boolean;
  runControlState: RunControlState;
  isRunning: boolean;
  completedNodeCount: number;
}): boolean {
  if (!input.activeGraphId || input.activeTaskGuideDismissed) return false;
  if (input.isRunning || input.runControlState === "running") return false;
  return input.completedNodeCount === 0;
}