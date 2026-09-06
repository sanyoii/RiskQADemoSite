// Presentation guidance only. Never changes a verdict or approves a release.
export function suggestedAction(current) {
  if (current.status === "ready") return null;
  const reasons = current.reasons ?? [];
  const has = code => reasons.some(reason => reason.code === code);
  const freshness = has("EVIDENCE_STALE") || has("DATA_NOT_FRESH");
  const review = has("RELEASE_EVIDENCE_REQUIRED") || has("RELEASE_REVIEW_INVALID");
  const correction = reasons.find(reason => !["CLOCK_UNCONFIRMED", "EVIDENCE_STALE", "DATA_NOT_FRESH", "RELEASE_EVIDENCE_REQUIRED", "RELEASE_REVIEW_INVALID"].includes(reason.code));
  if (correction) return correction.action;
  if (current.dataStatus === "unreachable") return { en: "Restore the evidence source, verify the retrieved version, then reassess.", zh: "恢復證據來源、核對取得的版本後，再重新評估。" };
  if (freshness && review) return { en: "Refresh evidence for this version, then complete the owner review.", zh: "更新此版本的證據，再完成負責人審查。" };
  if (freshness) return { en: "Rerun time-sensitive checks and request a new decision; keep historical results.", zh: "重跑有時效性的檢查並重新決定；保留歷史結果。" };
  if (review) return { en: "Link the evidence packet and complete the owner review; disclose self-review if applicable.", zh: "連結證據包並完成負責人審查；自我審查須揭露角色重疊。" };
  if (current.status === "blocked") return { en: "Resolve the recorded release blockers, rerun affected checks, then reassess.", zh: "處理已記錄的發布阻擋問題、重跑受影響檢查，再重新評估。" };
  if (current.status === "at-risk") return { en: "Review the remaining risk and record mitigation or a scoped owner acceptance.", zh: "確認剩餘風險，記錄改善措施或負責人限定範圍的風險接受。" };
  return { en: "Verify the current version and evidence before making a release decision.", zh: "先核對目前版本與證據，再作出發布決定。" };
}
