# Decision workflow implementation · QA-Lite brief

Status: implementation verification; human acceptance and release decision pending.

## Requirement REQ-DESK-001

Current Ready must require coherent, fresh evidence and an explicitly reviewed release packet for the exact repository/SHA/environment. A historical approval is retained but cannot become current merely by rebuilding the site. Missing required gate, incomplete execution, unmet coverage, unsafe link, stale evidence, changed subject or unreviewed packet must not produce Ready.

## Requirement REQ-CHAIN-001

The filled requirement/risk/design/case/run/review chain uses stable IDs. Required unresolved oracle or absent evidence blocks a Go unless a valid, case-scoped, accountable exception applies. Artifact and source files must match their hashes. Every earlier failed/blocked attempt is retained and linked; changing review input invalidates the prior review. Optional uncertainty is visible without blocking unrelated required scope.

## Requirement REQ-UX-001

The bilingual interface explains current status, missing evidence, owner and next action. Language preference survives reload and interactive updates. Historical replay and synthetic teaching scenarios stay explicitly separate; a proposed fix or hypothetical Pass never creates Go. All six existing routes remain usable, and 375px and desktop layouts retain legible text and keyboard-accessible controls.

## Requirement REQ-DELIVERY-001

Software/archive checks are separate from release authorization. Export never recursively deletes an existing caller-supplied directory. Historical evidence and prior attempts remain recoverable. Old sample dashboards are retired without breaking their URLs. Cloudflare/Sites remain until their local runtime consumers can be migrated and validated; removing them is not part of this release.

## Design and acceptance

- RISK-FALSE-GO → DESIGN-POLICY: decision-table counterexamples and expiry boundaries (just before / at / after), unknown clocks and semantic contradictions.
- RISK-BROKEN-CHAIN → DESIGN-CHAIN: orphan IDs, digest/subject/environment mutations, optional versus required uncertainty, scoped expiry, Fail→Pass and history deletion.
- RISK-MISLEADING-UI → DESIGN-UX: rendered routes plus visible EN/ZH, persisted state, dynamic replay, keyboard and narrow/desktop geometry.
- RISK-UNSAFE-DELIVERY → DESIGN-EXPORT: archive/current gate split, immutable sync and failed-sync last-known-good, refusal of an existing export target, production Pages build.

Oracle provenance: this brief formalizes the user's requested implementation. It is not a separate approved product specification or human acceptance receipt. Oracle status remains `assumption` until the designated owner reviews the stated behavior.

Excluded: new CEX live/manual testing, new Portfolio approval, independent human review, a new user's timed 30-second comprehension test, server-side monitoring, cryptographic identity verification, CI/branch-protection administration and deployment. Actual local software execution cannot close these exclusions.

Subject note: execution is against an uncommitted worktree. Base commit SHA alone is not an exact claim of tested bytes; the verification receipt includes a digest of relevant source files. Commit/review changes require a fresh bound assessment.
