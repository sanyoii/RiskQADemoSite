// Teaching scenario only. No step creates evidence, approval or a product status.
export function replayDecision(stage) {
  if (stage === "failed") return { decision: "No-Go", evidence: "synthetic-failure", releaseAuthorized: false,
    title: { en: "Required case failed", zh: "必要案例失敗" },
    action: { en: "Fix the defect and perform a targeted rerun. The original failure remains in the ledger.", zh: "修正缺陷並做 targeted rerun；原失敗記錄保留在台帳。" } };
  if (stage === "fix-proposed") return { decision: "Hold", evidence: "no-rerun", releaseAuthorized: false,
    title: { en: "What if a fix is proposed?", zh: "假設已提出修正？" },
    action: { en: "A code change is not a passing run. Attach a new attempt for the changed subject and link the earlier failure.", zh: "程式修正不等於測試通過；需為新版本追加執行，並連回原失敗。" } };
  return { decision: "Hold", evidence: "no-owner-approval", releaseAuthorized: false,
    title: { en: "What if the rerun passes?", zh: "假設重跑通過？" },
    action: { en: "Pass is not Go. Review changed evidence, remaining risk, oracle and approval scope. This demo stops before any approval; no rerun result is claimed.", zh: "Pass 不等於 Go。仍需審查改變的證據、殘餘風險、oracle 與核准範圍。示範停在核准前，不聲稱已有重跑結果。" } };
}
