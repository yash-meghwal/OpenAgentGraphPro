export type ProjectTemplate = {
  id: string;
  title: string;
  goal: string;
  detail: string;
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "review-folder",
    title: "Review this folder",
    goal:
      "Review the files in my project folder and summarize what the codebase does, what looks incomplete, and what I should focus on next.",
    detail: "Good when you want a guided read-through before changing anything.",
  },
  {
    id: "track-goal",
    title: "Track a goal",
    goal:
      "Break my goal into clear steps on the graph, execute them one at a time, and keep me informed so I can approve along the way.",
    detail: "Good for ongoing work you want to supervise step by step.",
  },
  {
    id: "fix-bug",
    title: "Fix a bug",
    goal:
      "Investigate the reported issue, propose a fix plan as graph steps, implement with evidence, and stop for my approval before risky changes.",
    detail: "Good when something is broken and you want a careful fix path.",
  },
];

export function findProjectTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((template) => template.id === id);
}