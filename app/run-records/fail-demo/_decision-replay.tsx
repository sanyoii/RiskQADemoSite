"use client";
import { useState } from "react";
import { T } from "../../_i18n";
import { replayDecision } from "../../../lib/replay-policy.mjs";

const steps = [
  { id: "failed", en: "1 · Failure", zh: "1 · 失敗", badge: "NO-GO" },
  { id: "fix-proposed", en: "2 · Proposed fix", zh: "2 · 提出修正", badge: "HOLD" },
  { id: "rerun-passed", en: "3 · Passing rerun?", zh: "3 · 重跑通過？", badge: "HOLD" },
];

export function DecisionReplay() {
  const [stage, setStage] = useState("failed");
  const result = replayDecision(stage);
  return (
    <section className="section ct-dark-section ct-replay-section" aria-labelledby="replay-title">
      <div className="ct-replay-head">
        <div>
          <p className="eyebrow"><T en="Synthetic teaching scenario · counterfactual steps" zh="合成教學情境 · 後續步驟為假設" /></p>
          <h2 id="replay-title"><T en="Decision replay" zh="決定回放" /></h2>
          <p><T en="A failure, its fix and a passing test answer different questions. Explore the decision boundary without changing real records." zh="失敗、修正與測試通過，回答的是不同問題。探索決策邊界，不會改動真實記錄。" /></p>
        </div>
        <code className="ct-badge-hold">3-STEP GATE STATE MACHINE</code>
      </div>
      <div className="replay-controls ct-replay-stepper">
        {steps.map(step => (
          <button
            type="button"
            key={step.id}
            className={`ct-replay-btn ${stage === step.id ? "is-active" : ""}`}
            aria-pressed={stage === step.id}
            onClick={() => setStage(step.id)}
          >
            <span><T en={step.en} zh={step.zh} /></span>
            <code className="ct-badge-hold">{step.badge}</code>
          </button>
        ))}
      </div>
      <div className="replay-stage ct-replay-stage" aria-live="polite" aria-atomic="true">
        <div className="ct-replay-verdict-row">
          <strong><T {...result.title} /> · {result.decision}</strong>
          <code className="ct-badge-hold">{result.decision}</code>
        </div>
        <p><T {...result.action} /></p>
        <code>{result.evidence}</code>
      </div>
    </section>
  );
}
