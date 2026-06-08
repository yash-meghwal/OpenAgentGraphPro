import type {
  AttentionLabel,
  DashboardLifecycleBucket,
  FrontierStatus,
  GraphStatus,
  RunControlState,
} from "@openagentgraph/shared";

export type RuntimeStatusView =
  | "connected"
  | "degraded"
  | "read_only"
  | "auth_required"
  | "unreachable";

export type SessionLifecycleView =
  | "signed_in"
  | "read_only"
  | "auth_required"
  | "invalid_session"
  | "expired_session";

export type OnboardingState = {
  title: string;
  body: string;
  nextSteps: string[];
  primaryActionLabel?: string;
};

export function formatRuntimeStatusLabel(status: RuntimeStatusView): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "degraded":
      return "Limited";
    case "read_only":
      return "View only";
    case "auth_required":
      return "Sign-in required";
    case "unreachable":
      return "Offline";
  }
}

export function formatSessionLifecycleLabel(sessionLifecycle: SessionLifecycleView): string {
  switch (sessionLifecycle) {
    case "signed_in":
      return "Signed in";
    case "expired_session":
      return "Session expired";
    case "invalid_session":
      return "Sign-in required";
    case "auth_required":
      return "Sign-in required";
    case "read_only":
    default:
      return "View only";
  }
}

export function formatFrontierStatusLabel(status: FrontierStatus | null | undefined): string {
  switch (status) {
    case "on_track":
      return "On track";
    case "exploring":
      return "Exploring";
    case "drifting":
      return "Needs attention";
    case "blocked":
      return "Stuck";
    default:
      return "On track";
  }
}

/** Shared execution-status colors aligned with the default graph theme. */
export const EXECUTION_STATUS_COLORS = {
  pending: "#64748b",
  ready: "#38bdf8",
  running: "#f59e0b",
  completed: "#34d399",
  failed: "#f87171",
  blocked: "#f87171",
  superseded: "#94a3b8",
} as const;

export function formatGraphStatusLabel(status: GraphStatus | string): string {
  switch (status) {
    case "running":
      return "In progress";
    case "completed":
      return "Done";
    case "failed":
      return "Failed";
    case "blocked":
      return "Stuck";
    case "stopped":
      return "Stopped";
    case "idle":
    default:
      return "Not started";
  }
}

export function formatRunControlStateLabel(state: RunControlState | string): string {
  switch (state) {
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "stopped":
      return "Stopped";
    case "idle":
    default:
      return "Ready to start";
  }
}

export function formatAttentionLabel(label: AttentionLabel | string): string {
  switch (label) {
    case "urgent":
      return "Needs you now";
    case "high":
      return "High priority";
    case "medium":
      return "Watch";
    case "low":
    default:
      return "On track";
  }
}

export function getAttentionLabelColor(label: AttentionLabel | string): string {
  switch (label) {
    case "urgent":
      return EXECUTION_STATUS_COLORS.failed;
    case "high":
      return EXECUTION_STATUS_COLORS.running;
    case "medium":
      return "#f6e05e";
    case "low":
    default:
      return EXECUTION_STATUS_COLORS.completed;
  }
}

export function formatLifecycleBucketLabel(bucket: DashboardLifecycleBucket | string): string {
  switch (bucket) {
    case "active":
      return "In progress";
    case "needs_attention":
      return "Needs attention";
    case "completed_recent":
      return "Recently finished";
    case "archived":
      return "Archived";
    default:
      return bucket.replace(/_/g, " ");
  }
}

export type DashboardMetricKey = "urgent" | "needsReview" | "blocked" | "active" | "archived";

export function getDashboardMetricLabel(
  key: DashboardMetricKey,
  uiMode: "default" | "developer"
): string {
  if (uiMode === "developer") {
    switch (key) {
      case "urgent":
        return "Urgent runs";
      case "needsReview":
        return "Needs review";
      case "blocked":
        return "Blocked";
      case "active":
        return "Active";
      case "archived":
        return "Archived";
    }
  }

  switch (key) {
    case "urgent":
      return "Needs you now";
    case "needsReview":
      return "Needs your review";
    case "blocked":
      return "Stuck";
    case "active":
      return "In progress";
    case "archived":
      return "Archived";
  }
}

export function formatAgentContextPackSummary(input: {
  stepCount: number;
  updateCount: number;
  proposalCount: number;
}): string {
  return `Context ready: ${input.stepCount} active steps, ${input.updateCount} recent updates, ${input.proposalCount} open suggestions.`;
}

export function getRuntimeBannerTone(status: RuntimeStatusView) {
  switch (status) {
    case "connected":
      return {
        background: "#10261d",
        border: "#1f4b37",
        accent: "#9ae6b4",
      };
    case "degraded":
      return {
        background: "#1c2432",
        border: "#31405a",
        accent: "#90cdf4",
      };
    case "auth_required":
      return {
        background: "#342816",
        border: "#6b4f1f",
        accent: "#f6ad55",
      };
    case "read_only":
      return {
        background: "#1c2432",
        border: "#31405a",
        accent: "#90cdf4",
      };
    case "unreachable":
    default:
      return {
        background: "#2d1b1b",
        border: "#5c2b2b",
        accent: "#fc8181",
      };
  }
}

export function getOnboardingState(input: {
  runtimeStatus: RuntimeStatusView;
  runtimeFallbackLikely: boolean;
  sessionLifecycle: SessionLifecycleView;
}): OnboardingState {
  if (input.runtimeStatus === "unreachable") {
    return {
      title: "Can't reach OpenAgentGraph",
      body: "The app couldn't connect to its server.",
      nextSteps: [
        "Make sure the app is running. If someone else set this up, ask them to start the server.",
        "Refresh this page once the connection is back.",
      ],
    };
  }

  if (input.runtimeStatus === "degraded") {
    return {
      title: "Connected with limits",
      body: input.runtimeFallbackLikely
        ? "You're connected, but AI assistance isn't fully set up yet."
        : "You're connected, but some features are limited right now.",
      nextSteps: [
        "You can still create projects and follow progress.",
        "Set up an AI assistant later if you want automated help.",
      ],
      primaryActionLabel: "Start your first project",
    };
  }

  if (input.sessionLifecycle === "expired_session") {
    return {
      title: "Session expired",
      body: "Your sign-in has expired.",
      nextSteps: [
        "You can still view existing projects.",
        "Use Sign in in the top bar to manage work again.",
      ],
    };
  }

  if (input.sessionLifecycle === "invalid_session") {
    return {
      title: "Sign-in required",
      body: "Your session isn't valid for making changes.",
      nextSteps: [
        "You can still view existing projects.",
        "Use Sign in in the top bar to continue.",
      ],
    };
  }

  if (input.sessionLifecycle === "read_only") {
    return {
      title: "View-only access",
      body: "You can look around, but starting or managing projects requires sign-in.",
      nextSteps: [
        "Projects appear here once someone creates them.",
        "Sign in when you want to start or manage a project.",
      ],
    };
  }

  return {
    title: "No projects yet",
    body: "Start your first project to supervise AI work step by step.",
    nextSteps: [
      "Click + New Project in the top bar.",
      "Describe what you want done in plain language.",
      "Open your project to watch progress and approve steps.",
    ],
    primaryActionLabel: "Start your first project",
  };
}