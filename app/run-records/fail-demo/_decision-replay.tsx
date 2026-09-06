"use client";
import { useState } from "react";
import { T } from "../../_i18n";
import { replayDecision } from "../../../lib/replay-policy.mjs";

const steps = [
  { id: "failed", en: "1 · Failure", zh: "1 · 失敗" },
  { id: "fix-proposed", en: "2 · Proposed fix", zh: "2 · 提出修正" },
  { id: "rerun-passed", en: "3 · Passing rerun?", zh: "3 · 重跑通過？" },
];
export function DecisionReplay() {
  const [stage, setStage] = useState("failed");
  const result = replayDecision(stage);
  return <section className="section" aria-labelledby="replay-title">
    <p className="eyebrow"><T en="Synthetic teaching scenario · counterfactual steps" zh="合成教學情境 · 後續步驟為假設" /></p>
    <h2 id="replay-title"><T en="Decision replay" zh="決定回放" /></h2>
    <p><T en="A failure, its fix and a passing test answer different questions. Explore the decision boundary without changing real records." zh="失敗、修正與測試通過，回答的是不同問題。探索決策邊界，不會改動真實記錄。" /></p>
    <div className="replay-controls">{steps.map(step => <button type="button" key={step.id} aria-pressed={stage === step.id} onClick={() => setStage(step.id)}><T en={step.en} zh={step.zh} /></button>)}</div>
    <div className="replay-stage" aria-live="polite" aria-atomic="true"><strong><T {...result.title} /> · {result.decision}</strong><p><T {...result.action} /></p><code>{result.evidence}</code></div>
  </section>;
}
