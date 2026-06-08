export type ContextualTipId = "first_graph" | "first_approval" | "first_scan";

export const CONTEXTUAL_TIPS_STORAGE_KEY = "openagentgraph:dismissed-tips";

export type ContextualTipCopy = {
  title: string;
  body: string;
};

export const CONTEXTUAL_TIPS: Record<ContextualTipId, ContextualTipCopy> = {
  first_graph: {
    title: "Your graph is live",
    body: "When steps appear on the graph, click any step to read what it means. Use Step history below to rewind what happened.",
  },
  first_approval: {
    title: "Approval needed",
    body: "This run is waiting for you. Read the highlighted step, then approve or reject in the run controls.",
  },
  first_scan: {
    title: "Map your codebase",
    body: "On Product & code, scan your project to connect files and intent. It helps later runs stay grounded.",
  },
};

type TipStorage = Pick<Storage, "getItem" | "setItem">;

function readDismissedTips(storage: TipStorage = getDefaultTipStorage()): Set<ContextualTipId> {
  const raw = storage.getItem(CONTEXTUAL_TIPS_STORAGE_KEY);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value): value is ContextualTipId => value in CONTEXTUAL_TIPS));
  } catch {
    return new Set();
  }
}

function writeDismissedTips(ids: Set<ContextualTipId>, storage: TipStorage = getDefaultTipStorage()) {
  storage.setItem(CONTEXTUAL_TIPS_STORAGE_KEY, JSON.stringify([...ids]));
}

function getDefaultTipStorage(): TipStorage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
    };
  }
  return window.localStorage;
}

export function isContextualTipDismissed(
  id: ContextualTipId,
  storage: TipStorage = getDefaultTipStorage()
): boolean {
  return readDismissedTips(storage).has(id);
}

export function dismissContextualTip(
  id: ContextualTipId,
  storage: TipStorage = getDefaultTipStorage()
): void {
  const dismissed = readDismissedTips(storage);
  dismissed.add(id);
  writeDismissedTips(dismissed, storage);
}

export function shouldShowContextualTip(
  id: ContextualTipId,
  visible: boolean,
  storage: TipStorage = getDefaultTipStorage()
): boolean {
  return visible && !isContextualTipDismissed(id, storage);
}