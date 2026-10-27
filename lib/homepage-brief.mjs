// Homepage summary math. The page renders these results; it does not invent a second verdict.

export function comparisonTone(zh) {
  if (typeof zh !== "string" || zh.length === 0) return "unknown";
  if (/過期|未通過|變少/.test(zh)) return "bad";
  if (/待確認|未知|未變/.test(zh)) return "unknown";
  if (/暫緩|注意|已變/.test(zh)) return "warning";
  if (/相同|仍通過|仍在效期|追加重測/.test(zh)) return "good";
  return "unknown";
}

function phrase(en, zh) {
  return { label: { en, zh }, tone: comparisonTone(zh) };
}

export function comparisonRows(previous, current, now = new Date()) {
  const rows = [];
  const prevExpiry = Date.parse(previous?.review?.expiresAt);
  const nextExpiry = Date.parse(current?.review?.expiresAt);
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (Number.isFinite(prevExpiry) && Number.isFinite(nextExpiry)) {
    const postponed = nextExpiry > prevExpiry;
    const expired = Number.isFinite(nowMs) && nextExpiry <= nowMs;
    const expiry = postponed && expired
      ? phrase("↑ Postponed, but already expired", "↑ 延後，但已過期")
      : postponed
        ? phrase("↑ Postponed, still within its validity period", "↑ 延後，仍在效期內")
        : expired
          ? phrase("✕ Already expired", "✕ 已過期")
          : phrase("— Still within its validity period", "— 仍在效期內");
    rows.push({ id: "expiry", field: { en: "Approval expiry", zh: "核准到期" }, ...expiry });
  }

  const prevSha = previous?.subject?.sha ?? "";
  const nextSha = current?.subject?.sha ?? "";
  const revision = prevSha !== "" && prevSha === nextSha
    ? phrase("— Same revision", "— 版本相同")
    : phrase("↑ Revision changed", "↑ 版本已變");
  rows.push({ id: "revision", field: { en: "Tested revision", zh: "受測版本" }, ...revision });

  const prevRuns = Array.isArray(previous?.runs) ? previous.runs : [];
  const nextRuns = Array.isArray(current?.runs) ? current.runs : [];
  const runs = nextRuns.length > prevRuns.length
    ? phrase("↑ Retest runs were appended", "↑ 已追加重測")
    : nextRuns.length === prevRuns.length
      ? phrase("? Run count unchanged", "? 執行筆數未變")
      : phrase("↓ Fewer recorded runs", "↓ 執行筆數變少");
  rows.push({ id: "runs", field: { en: "Recorded runs", zh: "執行紀錄" }, ...runs });

  const passing = nextRuns.length > 0 && nextRuns.every((run) => run?.status === "Pass");
  const results = passing
    ? phrase("— Still passing", "— 仍通過")
    : phrase("✕ A run is not passing", "✕ 有執行未通過");
  rows.push({ id: "results", field: { en: "Run results", zh: "執行結果" }, ...results });
  return rows;
}

export function previousComparisonUrls(registry) {
  const entries = Array.isArray(registry?.repositories) ? registry.repositories : [];
  return entries
    .filter((entry) => typeof entry?.previousReleaseEvidence === "string" && entry.previousReleaseEvidence.length > 0)
    .map((entry) => entry.url);
}

export function summarizeExitCriteria(repositories) {
  const rows = [];
  for (const repo of repositories ?? []) {
    for (const item of repo?.exitCriteria ?? []) {
      rows.push({
        id: item.id,
        title: item.title,
        result: item.result,
        repository: repo.repository,
      });
    }
  }
  const count = (result) => rows.filter((row) => row.result === result).length;
  const byId = ["EC-1", "EC-2", "EC-3", "EC-4"].map((id) => {
    const group = rows.filter((row) => row.id === id);
    return {
      id,
      title: group[0]?.title ?? { en: id, zh: id },
      met: group.filter((row) => row.result === "met").length,
      notMet: group.filter((row) => row.result === "not-met").length,
      unknown: group.filter((row) => row.result === "unknown").length,
    };
  });
  return {
    counts: { met: count("met"), notMet: count("not-met"), unknown: count("unknown") },
    byId,
    unmet: rows.filter((row) => row.result === "not-met"),
  };
}

export function summarizeRisks(risks) {
  const list = Array.isArray(risks) ? risks : [];
  const s1 = list.filter((risk) => risk?.severity === "S1");
  return { s1, otherCount: list.length - s1.length, total: list.length };
}

export function boardQualityTone(tone) {
  if (tone === "good") return "good";
  if (tone === "warn" || tone === "warning") return "warning";
  if (tone === "bad") return "bad";
  return "unknown";
}
