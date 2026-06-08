import { useState } from "react";
import { useStore } from "../lib/store.js";

type WizardStep = 1 | 2 | 3;

export function FirstRunWizard() {
  const {
    createGraph,
    fetchGraphs,
    openGraph,
    configureProvider,
    completeFirstRunWizard,
    setActiveTaskStartHint,
    setCreateDialogOpen,
    setCurrentView,
    providerConfigSaving,
    currentActor,
  } = useStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [aiChoice, setAiChoice] = useState<"openai" | "gemini" | "ollama" | "skip">("skip");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [createdGraphId, setCreatedGraphId] = useState<string | null>(null);

  const canManage = currentActor.role === "operator" || currentActor.role === "admin";

  async function handleCreateProject() {
    if (!title.trim() || !goal.trim()) {
      setMessage("Add a project name and a short description of what you want done.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const graph = await createGraph(title.trim(), goal.trim(), undefined, undefined, undefined, {
        navigateToGraph: false,
      });
      await fetchGraphs();
      setCreatedGraphId(graph.id);
      setStep(2);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the project.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAiStep() {
    setBusy(true);
    setMessage("");
    try {
      if (aiChoice !== "skip" && canManage) {
        if ((aiChoice === "openai" || aiChoice === "gemini") && !apiKey.trim()) {
          setMessage("Paste an API key, or choose Skip for now.");
          setBusy(false);
          return;
        }
        await configureProvider(
          aiChoice === "ollama"
            ? { provider: "ollama", model: "llama3.2" }
            : {
                provider: aiChoice,
                apiKey: apiKey.trim(),
                model: aiChoice === "openai" ? "gpt-4o" : "gemini-3.5-flash",
              }
        );
      }
      setStep(3);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI setup could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish() {
    completeFirstRunWizard();
    setActiveTaskStartHint(true);
    if (createdGraphId) {
      await openGraph(createdGraphId);
      setCurrentView("graph");
    }
  }

  function handleSkip() {
    completeFirstRunWizard();
    setCreateDialogOpen(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#111827",
          border: "1px solid #334155",
          borderRadius: 18,
          padding: 24,
          display: "grid",
          gap: 16,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Quick start
            </div>
            <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 800 }}>
              {step === 1 ? "What do you want to work on?" : step === 2 ? "Want AI to help? (optional)" : "You're ready"}
            </div>
          </div>
          <button
            onClick={handleSkip}
            style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Skip
          </button>
        </div>

        {step === 1 ? (
          <>
            <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
              Give your project a name and describe the outcome you want. You stay in control — approve each step as work progresses.
            </div>
            <label style={{ display: "grid", gap: 4, color: "#cbd5e0", fontSize: 11, fontWeight: 700 }}>
              Project name
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Website redesign"
                style={{
                  background: "#0f172a",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "10px 12px",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 4, color: "#cbd5e0", fontSize: 11, fontWeight: 700 }}>
              What should get done?
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Describe the goal in plain language..."
                rows={4}
                style={{
                  background: "#0f172a",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "10px 12px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
              AI help is optional. You can supervise manually, or connect an assistant for automated steps.
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(
                [
                  { id: "openai" as const, label: "Use ChatGPT", detail: "Needs an OpenAI API key" },
                  { id: "gemini" as const, label: "Use Gemini", detail: "Needs a Google AI API key" },
                  { id: "ollama" as const, label: "Use local AI", detail: "Runs on this computer via Ollama" },
                  { id: "skip" as const, label: "Skip for now", detail: "Supervise without AI automation" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAiChoice(option.id)}
                  style={{
                    textAlign: "left",
                    background: aiChoice === option.id ? "rgba(37, 99, 235, 0.18)" : "#0f172a",
                    border: `1px solid ${aiChoice === option.id ? "#2563eb" : "#374151"}`,
                    borderRadius: 10,
                    color: "#e2e8f0",
                    cursor: "pointer",
                    display: "grid",
                    gap: 2,
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{option.label}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>{option.detail}</span>
                </button>
              ))}
            </div>
            {aiChoice === "openai" || aiChoice === "gemini" ? (
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste API key"
                type="password"
                autoComplete="off"
                disabled={!canManage || providerConfigSaving}
                style={{
                  background: "#0f172a",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  fontSize: 12,
                  padding: "10px 12px",
                }}
              />
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <div style={{ color: "#cbd5e0", fontSize: 14, lineHeight: 1.55 }}>
            You are heading to <strong>Active task</strong>. Set your project folder if needed, click <strong>Run</strong>, then click steps on the graph to read what each one means.
          </div>
        ) : null}

        {message ? <div style={{ color: "#f6ad55", fontSize: 12, lineHeight: 1.45 }}>{message}</div> : null}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((current) => (current - 1) as WizardStep)}
              disabled={busy}
              style={{
                background: "#374151",
                color: "#e2e8f0",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          ) : null}
          {step === 1 ? (
            <button
              type="button"
              onClick={() => void handleCreateProject()}
              disabled={busy}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {busy ? "Creating..." : "Continue"}
            </button>
          ) : null}
          {step === 2 ? (
            <button
              type="button"
              onClick={() => void handleAiStep()}
              disabled={busy || providerConfigSaving}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {busy || providerConfigSaving ? "Saving..." : "Continue"}
            </button>
          ) : null}
          {step === 3 ? (
            <button
              type="button"
              onClick={() => void handleFinish()}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go to active task
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}