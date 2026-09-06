import { readFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { reviewRelease } from "./release-evidence.mjs";

export async function checkReleaseFile(input, options = {}) {
  const root = await realpath(dirname(resolve(input)));
  const packet = JSON.parse(await readFile(input, "utf8"));
  const result = reviewRelease(packet, options);
  const fail = (code, path) => {
    result.eligible = false; result.reviewState = "needs-review";
    result.findings.push({ code, path, action: "Supply the matching original artifact inside the release packet directory.", blocking: true });
  };
  const sources = [
    ...(packet?.requirements ?? []).map(r => ({ id: r.id, artifact: { path: r.sourcePath, sha256: r.digest } })),
    ...[...(packet?.designs ?? []), ...(packet?.cases ?? [])].filter(item => item.oracle?.sourcePath)
      .map(item => ({ id: item.id, artifact: { path: item.oracle.sourcePath, sha256: item.oracle.sourceDigest } })),
  ];
  for (const run of [...sources, ...(Array.isArray(packet?.runs) ? packet.runs : [])]) {
    try {
      const target = await realpath(resolve(root, run.artifact.path));
      const child = relative(root, target);
      if (child.startsWith("..") || isAbsolute(child)) throw new Error("ARTIFACT_OUTSIDE_PACKET");
      const digest = createHash("sha256").update(await readFile(target)).digest("hex");
      if (digest !== run.artifact.sha256) throw new Error("ARTIFACT_HASH_MISMATCH");
    } catch { fail("ARTIFACT_UNVERIFIED", run?.id ?? "runs"); }
  }
  return { packet, result };
}

export async function checkRegistryRelease(entry, registryPath, snapshot, options = {}) {
  if (!entry.releaseEvidence || !entry.authority) return { eligible: false, codes: ["RELEASE_EVIDENCE_REQUIRED"] };
  const root = dirname(registryPath);
  const authority = JSON.parse(await readFile(resolve(root, entry.authority), "utf8"));
  const previous = entry.previousReleaseEvidence ? JSON.parse(await readFile(resolve(root, entry.previousReleaseEvidence), "utf8")) : undefined;
  const { packet, result } = await checkReleaseFile(resolve(root, entry.releaseEvidence), { ...options, authority, previous });
  const codes = result.findings.filter(f => f.blocking).map(f => f.code);
  if (packet.classification !== "real") codes.push("SYNTHETIC_NOT_RELEASE_EVIDENCE");
  if (packet.subject.repository !== snapshot.repository.url || packet.subject.sha !== snapshot.repository.fullSha
      || packet.subject.environment !== snapshot.environment || packet.review?.decision !== "Go"
      || packet.review?.decidedAt !== snapshot.releaseAssessment.decidedAt
      || packet.review?.expiresAt !== snapshot.releaseAssessment.expiresAt
      || packet.review?.decisionOwner !== snapshot.releaseAssessment.decisionOwner
      || packet.review?.reviewer !== snapshot.releaseAssessment.reviewer) codes.push("SNAPSHOT_REVIEW_MISMATCH");
  return { eligible: !codes.length, codes, policyVersion: result.policyVersion, inputDigest: result.inputDigest,
    sourceSha: packet.subject.sha, expiresAt: packet.review?.expiresAt ?? null };
}
