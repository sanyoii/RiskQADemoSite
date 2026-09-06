# Publication preflight · 2026-09-06

The user authorized commit, push and deploy of the Dashboard reinforcement. This does not approve the CEX or Portfolio product release assessment.

## Fresh local verification

Command: `npm run verify:workflow`, Windows, Node v24.19.0, branch `codex/fix-navigation-bilingual`. Local receipt: `artifacts/2026-09-06T10-21-26-672Z/receipt.json` (Git-ignored).

- `npm test`: Pass, exit 0; 42 contract, 12 Playbook and 10 rendered tests; 14 Playbook fixtures and 2 historical registry entries validated.
- `npm run lint`: Pass, exit 0.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: Pass, exit 0.
- `GITHUB_PAGES=true npm run build`: Pass, exit 0; 7 prerendered routes.
- Pages export to a fresh run-specific directory: Pass, exit 0.
- `npm run gate:release`: Fail, exit 1, `EVIDENCE_STALE:releaseAssessment.expiresAt`. Historical product evidence was not renewed.
- `git diff --check`: Pass before staging.

Earlier verification and the uncommitted-subject release packet remain historical records, not approval for this publication.

## Deployment boundary

Remote source `main` at `481ee31c56eeb40b6e05f5d020a2f48ae1d623cb` contains an expired-assessment downgrade that must be preserved when integrating the feature branch. Main is not branch-protected. No force push or history rewrite is needed.

The hosting repository `sanyoii/sanyoii.github.io` workflow `.github/workflows/pages.yml` copies tracked `site/test-status/` into `public/test-status/`, then invokes the Dashboard exporter with that existing output path. The reinforced exporter rejects it with `OUTPUT_MUST_BE_NEW` by design. The workflow has been inspected, not dispatched; this is a preflight compatibility finding, not a claimed CI failure.

Proposed correction: add `--exclude '/test-status/'` to the existing artifact-assembly `rsync` command so the maintained Dashboard builds into a new directory. This avoids deleting tracked legacy artifacts and leaves Portfolio source content unchanged. Deployment-infrastructure edits require separate confirmation under the user's standing rules; no workflow change or deployment is included in this preflight.

After approval: integrate remote main without losing its downgrade, rerun validation, publish source main, apply the scoped hosting-workflow correction, and verify source CI, Pages CI and the actual public routes and bilingual behavior. Until then, the feature-branch push must not be described as a live deployment.
