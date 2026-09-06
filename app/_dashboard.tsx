"use client";

import { useEffect, useState } from "react";
import { decisionView, safeEvidenceUrl, coverageLevels, POLICY_VERSION } from "../lib/decision-policy.mjs";
import { dashboardData, statusLabels } from "./dashboard-data";
import { T } from "./_i18n";
import { siteHref } from "./_site";
import { suggestedAction } from "../lib/decision-actions.mjs";

const verdicts = {
  ready: { en: "Ready", zh: "可發布", icon: "✓" },
  "at-risk": { en: "At Risk", zh: "有風險", icon: "!" },
  blocked: { en: "No-Go", zh: "不可發布", icon: "×" },
  unknown: { en: "Unknown", zh: "待確認", icon: "?" },
};
type Verdict = keyof typeof verdicts;

// Translate exact recorded wording only; snapshots and their integrity digests stay unchanged.
const historicalGateEnglish: Record<string, string> = {
  "範圍已鎖定": "Scope locked",
  "測試已通過": "Tests passed",
  "3 類測試完成": "3 test categories completed",
  "外部檢視完成": "External review completed",
  "回饋已取得": "Feedback received",
  "正式 Go 紀錄完成": "Formal Go record completed",
  "測試範圍已定義": "Test scope defined",
};

function HistoricalGateText({ value }: { value: string }) {
  return <T en={historicalGateEnglish[value] ?? value} zh={value} />;
}

function Label({ value }: { value: string }) {
  return <T {...(statusLabels[value] ?? { en: value, zh: value })} />;
}
function EvidenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return safeEvidenceUrl(href) ? <a href={href.startsWith("/") ? siteHref(href) : href}>{children}</a> : <span><T en="Link withheld" zh="連結已隱藏" /></span>;
}

export function DecisionDashboard() {
  const [clock, setClock] = useState<number | null>(null);
  const [filter, setFilter] = useState<Verdict | null>(null);
  useEffect(() => {
    const refresh = () => setClock(Date.now());
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const entries = dashboardData.repositories.map(entry => ({ ...entry, current: decisionView(entry.snapshot, {
    now: new Date(clock ?? 0), clockConfirmed: clock !== null, enforceReview: true, releaseReview: entry.releaseReview,
  }) }));
  const visible = entries.filter(entry => !filter || entry.current.status === filter);
  return <section className="decision-dashboard" aria-labelledby="repo-quality-title">
    <header className="decision-heading">
      <h2 id="repo-quality-title"><T en="Release overview" zh="目前發布狀態" /></h2>
      <p className="decision-count"><T en={`${entries.length} repositories · Not live`} zh={`${entries.length} 個 Repo · 非即時`} /></p>
    </header>
    <div className="decision-summary" role="group" aria-label="Filter by current decision" data-aria-label-en="Filter by current decision" data-aria-label-zh="依目前判定篩選">
      {(Object.keys(verdicts) as Verdict[]).map(status => <button type="button" key={status} data-status={status} aria-pressed={filter === status} onClick={() => setFilter(filter === status ? null : status)}>
        <span><i aria-hidden="true">{verdicts[status].icon}</i><T {...verdicts[status]} /></span><strong>{entries.filter(entry => entry.current.status === status).length}</strong>
      </button>)}
    </div>
    <div className="decision-reading-hint"><span><T en="Unknown ≠ failed tests" zh="待確認 ≠ 測試失敗" /></span>{filter ? <button type="button" onClick={() => setFilter(null)}><T en="Show all repositories" zh="顯示全部 Repo" /></button> : <span><T en="Select a status to filter" zh="點選狀態可篩選" /></span>}</div>
    <noscript><p><T en="JavaScript is disabled. Current release readiness is Unknown; historical records remain available." zh="JavaScript 已停用。目前發布就緒度為 Unknown；仍可查看歷史記錄。" /></p></noscript>
    <div className="decision-repositories">
      {visible.map(({ snapshot, snapshotDigest, current }) => {
        const verdict = verdicts[current.status as Verdict] ?? verdicts.unknown;
        const nextAction = suggestedAction(current);
        const lastRun = [...snapshot.runs].filter(run => Number.isFinite(Date.parse(run.executedAt))).sort((a, b) => Date.parse(b.executedAt) - Date.parse(a.executedAt))[0];
        const shortReasons = [];
        if (current.dataStatus === "stale" || snapshot.dataStatus === "stale") shortReasons.push({ en: "Evidence not updated", zh: "證據未更新" });
        if (current.reasons.some(reason => ["RELEASE_EVIDENCE_REQUIRED", "RELEASE_REVIEW_INVALID"].includes(reason.code))) shortReasons.push({ en: "Approval pending", zh: "核准待完成" });
        if (!shortReasons.length) shortReasons.push(current.reasons[0]?.title ?? ({ ready: { en: "Evidence and approval complete", zh: "證據與核准齊全" }, "at-risk": { en: "Known risk remains", zh: "仍有已知風險" }, blocked: { en: "Release blocked", zh: "發布受到阻擋" }, unknown: { en: "Current decision unconfirmed", zh: "目前判定尚待確認" } }[current.status as Verdict] ?? { en: "Review required", zh: "需要審查" }));
        return <article className="decision-repo" data-status={current.status} key={snapshot.repository.url}>
        <div className="decision-repo-top">
          <div><p className="eyebrow">{snapshot.objective}</p><h3><EvidenceLink href={snapshot.repository.url}>{snapshot.repository.name}</EvidenceLink></h3>
            <p className="decision-version">{snapshot.repository.branch} · {snapshot.repository.releaseTarget} · <code>{snapshot.repository.fullSha.slice(0, 7)}</code></p></div>
          <div className="decision-current" data-status={current.status}><span className="decision-status-icon" aria-hidden="true">{verdict.icon}</span><div><strong><T {...verdict} /></strong><p className="decision-short-reason">{shortReasons.map(reason => <T key={reason.en} {...reason} />)}</p></div></div>
          <p className="decision-last-test"><T en="Last recorded test" zh="最後記錄的測試" /> · {lastRun ? <time dateTime={lastRun.executedAt} title={lastRun.executedAt}>{new Date(lastRun.executedAt).toISOString().slice(0, 10)}</time> : <T en="No record" zh="尚無記錄" />}</p>
          <p className="decision-last-test"><T en="Assessment expires" zh="評估到期" /> · <time dateTime={snapshot.releaseAssessment.expiresAt}>{snapshot.releaseAssessment.expiresAt.replace("T", " ")}</time></p>
          {nextAction && <p className="decision-next-action"><strong><T en="Next step" zh="建議處理" /></strong><T {...nextAction} /></p>}
        </div>
        <details className="decision-details">
          <summary><T en="View evidence and details" zh="查看證據與細節" /></summary>
          <div className="decision-detail-body">
          <section className="decision-actions" aria-label="Required actions" data-aria-label-en="Required actions" data-aria-label-zh="必要行動">
          <h4>{current.status === "ready" ? <T en="Current decision" zh="目前決定" /> : <T en="What prevents a current Go?" zh="目前為什麼不能 Go？" />}</h4>
          {current.reasons.length ? <ul>{current.reasons.map(reason => <li key={`${reason.code}-${reason.path}`}><strong><T {...reason.title} /></strong><span><T {...reason.action} /></span><small>{reason.code} · {reason.path} · <T en="Owner" zh="負責人" />: {reason.owner}</small></li>)}</ul>
            : <p>{current.status === "ready" ? <T en="No blocking finding in the current evidence scope. This is not a zero-defect guarantee." zh="目前證據範圍內沒有阻擋項目；不代表零缺陷保證。" /> : <T en="The recorded decision is not Go. Ask the decision owner to resolve the recorded rationale." zh="記錄的決定不是 Go；請決策負責人處理記錄中的原因。" />}</p>}
        </section>
            <p className="source-note"><T en="Evidence state" zh="證據狀態" />: <Label value={current.dataStatus} /></p>
            <h4><T en="Historical decision replay — recorded events only" zh="歷史決定回放 — 只呈現已有記錄" /></h4>
            <ol className="decision-timeline">
              {snapshot.runs.map(run => <li key={run.runId}><time>{run.executedAt}</time><EvidenceLink href={run.evidenceUrl}>{run.runId}</EvidenceLink></li>)}
              <li><time>{snapshot.releaseAssessment.decidedAt}</time><span><T en="Recorded assessment" zh="當時記錄的評估" />: <Label value={current.historicalStatus} /></span><p lang="en">{snapshot.releaseAssessment.rationale}</p></li>
              <li><time>{snapshot.releaseAssessment.expiresAt}</time><T en="Original validity boundary — not renewed by a later site build" zh="原有效期限 — 網站重新建置不會延長" /></li>
              <li><T en="Now — no later verified approval is inferred" zh="現在 — 不推定存在更晚的有效核准" /><strong><Label value={current.status} /></strong></li>
            </ol>
            <p className="source-note"><T en="Chinese gate wording is translated for reading; original snapshots and historical claims are unchanged." zh="中文 Gate 內容提供英文翻譯；原始快照與歷史主張維持不變。" /></p>
            <dl className="decision-facts">
              <dt><T en="Environment" zh="環境" /></dt><dd>{snapshot.environment}</dd>
              <dt><T en="In scope" zh="測試範圍" /></dt><dd>{snapshot.testedScope.join(" · ")}</dd>
              <dt><T en="Excluded" zh="排除範圍" /></dt><dd>{snapshot.excludedScope.join(" · ")}</dd>
              <dt><T en="QA / Reviewer / Decision owner" zh="QA／審查者／決策負責人" /></dt><dd>{snapshot.releaseAssessment.qaOwner} / {snapshot.releaseAssessment.reviewer} / {snapshot.releaseAssessment.decisionOwner}</dd>
              <dt><T en="Role boundary" zh="角色邊界" /></dt><dd><T en="Recorded names are not verified identities or proof of independent review." zh="記錄姓名不等於已驗證身分，也不等於獨立審查證明。" /></dd>
            </dl>
            <h4><T en="Historical coverage and execution" zh="歷史覆蓋與執行" /></h4>
            <div className="decision-area-list">{snapshot.productAreas.map(area => <article key={area.id}>
              <h5>{area.name}</h5><p>{area.executionState} · {area.quality} · <T en="Effort" zh="測試力度" />: {area.effortLevel}</p>
              <div className="coverage-track" role="img" aria-label={`Coverage ${area.coverage}; target ${area.targetCoverage}`} data-aria-label-en={`Coverage ${area.coverage}; target ${area.targetCoverage}`} data-aria-label-zh={`覆蓋 ${area.coverage}；目標 ${area.targetCoverage}`}>
                {coverageLevels.map(level => <span key={level} data-covered={coverageLevels.indexOf(level) <= coverageLevels.indexOf(area.coverage)} data-current={level === area.coverage}>{level}</span>)}
              </div><p><T en="Target" zh="目標" />: {area.targetCoverage} · {area.comment}</p>
              {area.evidenceLinks.map((url, i) => <EvidenceLink key={url} href={url}><T en={`Evidence ${i + 1}`} zh={`證據 ${i + 1}`} /></EvidenceLink>)}
            </article>)}</div>
            <h4><T en="Gates as recorded at the historical decision" zh="歷史決定當時記錄的 Gates" /></h4>
            <ul className="historical-gates">{snapshot.gates.map(gate => <li key={gate.id}><code>{gate.id}</code> · {gate.state} · <HistoricalGateText value={gate.title} /> · <HistoricalGateText value={gate.note} /></li>)}</ul>
            <details><summary><T en="Provenance and integrity" zh="來源與完整性" /></summary><dl className="decision-facts">
              <dt>Snapshot ID</dt><dd>{snapshot.snapshotId}</dd><dt>Source SHA</dt><dd><code>{snapshot.repository.fullSha}</code></dd><dt>SHA-256</dt><dd><code>{snapshotDigest}</code></dd>
              <dt><T en="Synced at" zh="同步時間" /></dt><dd>{snapshot.provenance.syncedAt}</dd><dt><T en="Clock checked" zh="時間檢查" /></dt><dd>{current.checkedAt ?? "Unknown"}</dd>
            </dl></details>
          </div>
        </details>
      </article>;})}
    </div>
    {!visible.length && <p className="decision-empty" role="status"><T en="No repositories in this state." zh="此狀態目前沒有 Repo。" /></p>}
    <details className="decision-policy-note"><summary><T en="How is status determined?" zh="狀態如何判定？" /></summary><p>Policy {POLICY_VERSION}</p><p className="decision-clock"><T en="Clock rechecked every 30 seconds and when returning to this page. Browser time is advisory; the CLI release gate is authoritative." zh="每 30 秒及返回頁面時重新檢查時間。瀏覽器時間僅供參考；發布時以 CLI gate 為準。" /></p></details>
  </section>;
}
