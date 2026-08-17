# QA Decision Desk

Public portfolio deployment surface for the Risk-Based QA Evidence Pack and Low-Tech Testing Dashboard demo.

## Public boundary

This repository contains only a sanitized, read-only decision projection. It does not include raw test artifacts, protected receipts, internal Wiki files, credentials, or source-repository worktrees.

## Commands

```bash
npm ci
npm run dev
npm test
```

`npm test` builds the Cloudflare-compatible Sites output and verifies the rendered page, public disclosure boundary, metadata, and removal of starter-only files.
