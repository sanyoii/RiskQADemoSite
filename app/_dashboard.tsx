"use client";

import { useEffect, useState } from "react";
import { decisionView, safeEvidenceUrl, coverageLevels, POLICY_VERSION } from "../lib/decision-policy.mjs";
import { dashboardData, statusLabels } from "./dashboard-data";
import { T } from "./_i18n";
import { siteHref } from "./_site";

function Label({ value }: { value: string }) {
  return <T {...(statusLabels[value] ?? { en: value, zh: value })} />;
}
function EvidenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return safeEvidenceUrl(href) ? <a href={href.startsWith("/") ? siteHref(href) : href}>{children}</a> : <span><T en="Link withheld" zh="連結已隱藏" /></span>;
}

export function DecisionDashboard() {
  const [clock, setClock] = useState<number | null>(null);
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
  const ready = entries.filter(entry => entry.current.status === "ready").length;
  return <section className="decision-dashboard" aria-labelledby="repo-quality-title">
    <header className="decision-heading">
      <div><p className="eyebrow">Policy {POLICY_VERSION}</p><h2 id="repo-quality-title">Repository Quality Dashboard</h2></div>
      <p className="decision-count"><T en={`${ready} / ${entries.length} currently ready`} zh={`目前 ${ready} / ${entries.length} 個就緒`} /></p>
    </header>
    <p className="decision-clock"><T en="Clock rechecked every 30 seconds and when returning to this page. Browser time is advisory; the CLI release gate is authoritative." zh="每 30 秒及返回頁面時重新檢查時間。瀏覽器時間僅供參考；發布時以 CLI gate 為準。" /></p>
    <noscript><p><T en="JavaScript is disabled. Current release readiness is Unknown; historical records remain available." zh="JavaScript 已停用。目前發布就緒度為 Unknown；仍可查看歷史記錄。" /></p></noscript>
    <div className="decision-repositories">
      {entries.map(({ snapshot, snapshotDigest, current }) => <article className="decision-repo" key={snapshot.repository.url}>
        <div className="decision-repo-top">
          <div><p className="eyebrow">{snapshot.objective}</p><h3><EvidenceLink href={snapshot.repository.url}>{snapshot.repository.name}</EvidenceLink></h3>
            <p className="decision-version">{snapshot.repository.branch} · {snapshot.repository.releaseTarget} · <code>{snapshot.repository.fullSha.slice(0, 7)}</code></p></div>
          <div className="decision-current" data-status={current.status}><small><T en="Current decision" zh="目前判定" /></small><strong><Label value={current.status} /></strong><span><T en="Evidence" zh="證據" />: <Label value={current.dataStatus} /></span></div>
        </div>
        <section className="decision-actions" aria-label="Required actions" data-aria-label-en="Required actions" data-aria-label-zh="必要行動">
          <h4><T en="What prevents a current Go?" zh="目前為什麼不能 Go？" /></h4>
          {current.reasons.length ? <ul>{current.reasons.map(reason => <li key={`${reason.code}-${reason.path}`}><strong><T {...reason.title} /></strong><span><T {...reason.action} /></span><small>{reason.code} · {reason.path} · <T en="Owner" zh="負責人" />: {reason.owner}</small></li>)}</ul>
            : <p>{current.status === "ready" ? <T en="No blocking finding in the current evidence scope. This is not a zero-defect guarantee." zh="目前證據範圍內沒有阻擋項目；不代表零缺陷保證。" /> : <T en="The recorded decision is not Go. Ask the decision owner to resolve the recorded rationale." zh="記錄的決定不是 Go；請決策負責人處理記錄中的原因。" />}</p>}
        </section>
        <details className="decision-details">
          <summary><T en="Evidence, scope and historical decision" zh="證據、範圍與歷史決定" /></summary>
          <div className="decision-detail-body">
            <h4><T en="Historical decision replay — recorded events only" zh="歷史決定回放 — 只呈現已有記錄" /></h4>
            <ol className="decision-timeline">
              {snapshot.runs.map(run => <li key={run.runId}><time>{run.executedAt}</time><EvidenceLink href={run.evidenceUrl}>{run.runId}</EvidenceLink></li>)}
              <li><time>{snapshot.releaseAssessment.decidedAt}</time><span><T en="Recorded assessment" zh="當時記錄的評估" />: <Label value={current.historicalStatus} /></span><p lang="en">{snapshot.releaseAssessment.rationale}</p></li>
              <li><time>{snapshot.releaseAssessment.expiresAt}</time><T en="Original validity boundary — not renewed by a later site build" zh="原有效期限 — 網站重新建置不會延長" /></li>
              <li><T en="Now — no later verified approval is inferred" zh="現在 — 不推定存在更晚的有效核准" /><strong><Label value={current.status} /></strong></li>
            </ol>
            <p className="source-note"><T en="Original source wording is retained below; changing language does not rewrite historical claims." zh="以下保留來源原文；切換語言不會改寫歷史主張。" /></p>
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
            <ul className="historical-gates">{snapshot.gates.map(gate => <li key={gate.id}><code>{gate.id}</code> · {gate.state} · {gate.title} · {gate.note}</li>)}</ul>
            <details><summary><T en="Provenance and integrity" zh="來源與完整性" /></summary><dl className="decision-facts">
              <dt>Snapshot ID</dt><dd>{snapshot.snapshotId}</dd><dt>Source SHA</dt><dd><code>{snapshot.repository.fullSha}</code></dd><dt>SHA-256</dt><dd><code>{snapshotDigest}</code></dd>
              <dt><T en="Synced at" zh="同步時間" /></dt><dd>{snapshot.provenance.syncedAt}</dd><dt><T en="Clock checked" zh="時間檢查" /></dt><dd>{current.checkedAt ?? "Unknown"}</dd>
            </dl></details>
          </div>
        </details>
      </article>)}
    </div>
  </section>;
}
