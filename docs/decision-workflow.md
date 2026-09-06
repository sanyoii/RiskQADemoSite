# Decision workflow · policy 2.0.0

## One maintained implementation

RiskQADemoSite owns the maintained policy, CLI and UI. The original TestDashboard pilot is an archived reference, not a second status publisher. Old pilot files and evidence are retained; do not run its sync path for current releases.

```text
versioned requirement → required risk → design + oracle → case
    → append-only execution attempts + artifacts → owner review
    → registry release gate → sanitized snapshot + integrity receipt
    → Dashboard: current verdict / missing evidence / owner / next action
```

`lib/decision-policy.mjs` is the browser-safe snapshot policy. `lib/release-evidence.mjs` owns the richer release-packet contract; `lib/release-files.mjs` verifies actual artifact files. UI presentation does not duplicate repository-specific pass counts, decision rationale or coverage claims. Snapshot wording remains its original language; bilingual interface labels never replace historical facts.

## Three records for QA-Lite

1. **Brief/design:** one release-specific document with requirement versions, risks, method, concrete parameters, coverage claim, exclusions and oracle provenance.
2. **Run ledger:** actual commands/procedures, environment, subject, every Pass/Fail/Blocked/Skipped, previous attempt links and artifact hashes. A later Pass does not erase a failure.
3. **Decision:** owner/reviewer, evidence digest, Go/No-Go/Hold, rationale, scope and expiry. Keep the decision separate from execution so a passing test cannot approve itself.

The nine templates remain an authoring library, not nine mandatory forms. Higher-risk changes still need their detailed cases, disposition and review; reducing paperwork does not waive those controls. The machine-readable packet projects these three records, not a tenth independent truth source.

## Release packet v1.0.0

The filled example for this change is [release-evidence.json](../test-records/decision-workflow/release-evidence.json), deliberately `needs-review`. It is **not** a fresh CEX or Portfolio approval.

| Field | Contract |
|---|---|
| `classification` | `real` or `synthetic`; synthetic fixtures can test logic, never pass the real release CLI |
| `subject` | repository URL, full commit SHA, environment, configuration digest; disclose dirty worktree evidence separately |
| `requirements` | stable ID, local `sourcePath` and SHA-256 `digest` of its versioned content |
| `risks` | stable ID, requirement IDs, explicit `required` boolean |
| `designs` | ID, risk IDs, method, parameters, coverage claim, exclusions, oracle |
| `oracle` | `approved`, `assumption`, `unknown` or `characterization`; approved source reference, local `sourcePath` and `sourceDigest` required for evidence-based Go |
| `cases` | ID, design ID, required boolean; may override inherited oracle |
| `runs` | ID, case ID, subject SHA, environment/config, kind, timestamp, result, previous attempt IDs, artifact path and SHA-256 |
| `waivers` | case-scoped only; reason, compensating control, owner acceptance and expiry; broader exceptions must enumerate affected cases |
| `events` | append-only ID/time/type/reason, earlier event IDs and supporting run IDs |
| `review` | status, Go/No-Go/Hold, owner/reviewer, input digest, subject SHA, environment, decided/expiry times, authority receipt reference, role overlap disclosure |

`reviewRelease` checks the filled relationships, not merely whether template headings exist. Required risk → design → required case must be complete. Required unresolved oracles or missing execution block release unless the explicitly scoped case disposition is valid. Optional unresolved oracle findings remain visible without blocking unrelated required scope. Invalid IDs, corrupted artifacts or rewritten history are integrity errors even in optional records.

Deterministic evidence is reusable only for the same subject, environment and config. Live/manual latest required evidence must also carry `validUntil`. Expired or mismatched older attempts remain historical; they do not permanently poison a legitimate rerun. All earlier Fail/Blocked attempts must be linked. Use `--previous` to compare the candidate against the retained prior packet; without the prior packet the tool cannot prove that omitted history ever existed.

```bash
npm run review:release -- path/to/release-evidence.json --design-only
npm run review:release -- path/to/release-evidence.json --previous path/to/prior.json --authority path/to/authority.json
```

`--design-only` checks structural readiness and exposes pending execution/oracle/human-review work; exit 0 is **not Go**. The normal command requires real evidence and approval. Every artifact is opened and hashed inside the packet directory, including realpath checks; paths that escape through `..` or symlinks are rejected.

Authority configuration is supplied separately: `{ "repository": "<URL>", "decisionOwners": ["<designated owner>"], "reviewers": ["<designated reviewer>"] }`. Keep it in a separately reviewed/controlled location; the packet cannot nominate its own authority. Registry entries reference `releaseEvidence` and `authority` paths relative to the registry. Roles are recorded, not authenticated by the tool. A typed name or a digest is **not** a signature, independent review, tamper-proof storage or SLSA attestation. Do not fabricate owner acceptance. CI protection and human authority remain external controls.

The registry gate also binds packet repository/SHA/environment/owner/reviewer/decision times to the public snapshot. A public snapshot alone is insufficient. Existing historical samples intentionally have no new packet/authority attached and stay Unknown in the Dashboard.

For subsequent releases, add `previousReleaseEvidence` to the separately controlled registry entry to enforce comparison against the retained prior packet. `subject.dirty: true` always blocks actual approval; a `workspaceDigest` identifies local tested source and each current required run must match it, but it is not a substitute for committing and reviewing the intended release subject.

## Software verification versus release authorization

| Command | Meaning |
|---|---|
| `npm test` | archive consistency, software contracts, playbooks, build and server-rendered pages |
| `npm run validate:archive` | historical snapshots remain structurally consistent; ignores only current clock/freshness, not contradictory gates or bad links |
| `npm run validate:data` | snapshot semantics and current freshness; **not** release authorization |
| `npm run gate:release` | current freshness + actual filled evidence packet + owner review and subject binding |
| `npm run lint` / `npx tsc --noEmit --incremental false` | static source checks |

A software-green archive site may accurately display expired evidence. Publishing that truthful archive and approving a product release are different decisions. This change does not authorize either publication or a new product Go.

The browser checks validity every 30 seconds and on focus/visibility change. Without JavaScript or a confirmed clock it shows Unknown, never build-time Ready. Browser time is advisory and can be wrong; run the CLI gate with the trusted execution clock immediately before an actual release. A built page is a snapshot, not a live poller of repositories.

## Snapshot activation and failure recovery

```bash
node scripts/sync-status.mjs --source source.json --output output.json --historical
```

- Validated content is written once to `snapshots/<sha256>.json`; a hash collision or edited existing blob fails.
- `<output>.manifest.json` is the canonical atomic pointer, containing policy version, artifact hash, snapshot ID and source SHA. It explicitly does not authorize release.
- `<output>` remains a compatibility copy, not an approval record.
- An unsuccessful attempt emits `<output>.failure.json` with a reason code and Unknown, retaining the canonical snapshot. Consumers must surface a newer failure and verify the manifest hash before using last-known-good content. Successful later receipt consumption must compare attempt times; never treat an old failure as a new failure.
- A lock serializes a single output writer. A crash can leave an owned lock; investigate before manual removal. Filesystem permissions and backups are still required; content hashes do not prevent malicious rewrites.

The Dashboard currently consumes the checked-in registry via generated `data/decision-index.json`; it is not a background sync consumer. `predev` and `prebuild` regenerate a sanitized index and exclude private packets/authority. Snapshot hashes in the UI identify this projection; sync receipts hash their exact output bytes (different serialization, different hash domain).

## Change impact and replay

`review:release --previous` outputs requirement deltas, `mustRun`, retained candidates and review invalidation. Subject/environment/config changes or risk/scope removals conservatively require all scoped cases. Requirement and design changes follow their ID edges. This is dependency advice, not proof of completeness: unmapped behavior changes need full scoped regression, and retained candidates still require freshness and human review.

The real Dashboard replay lists only recorded runs, the original decision and expiry, then current Unknown when unsupported. Fail Demo is explicitly synthetic: failure → proposed fix → hypothetical passing rerun stops at Hold before owner approval. No new real execution or Go is invented by clicking.

## Reduction and migration map

| Old surface | Disposition |
|---|---|
| Pilot `src/status-policy.js`, `trusted-authority.js` | Preserve as historical reference; migrate rules, not fixed pilot subject or private trust anchors |
| Pilot append-only runs/events and snapshot sync | Ported to release-packet comparison, ordered attempts, content-addressed snapshots and failure receipts |
| Hardcoded per-repo result translations/counts | Removed; source facts come from snapshots, current explanation from policy |
| Sample A/B/C, AC, ABC active dashboards | Replaced with design evolution + compatible links; no duplicate status source |
| Shared `_template-parts.tsx` and unused sample CSS | Removed after the formal page no longer imports them |
| First-screen effort bars / fixed Level 2+ | Removed; actual area levels and effort remain in expandable evidence details |
| Nine forms per small release | Replaced by three-record QA-Lite guidance; template library retained |
| Cloudflare/Vinext/Sites local runtime | Retained: current build and rendered tests import `dist/server/index.js`, supplied by this runtime. Pages build bypasses Cloudflare. Removing it now requires a separately validated runtime migration, not a safe dependency deletion |

Pages export now refuses existing output directories rather than recursively deleting them. Export to a fresh named directory. No deployment workflow, branch protection, hosted account or publication settings were modified.
