# Reviewed Pages artifact check

This repository has a test/build workflow, not an upload or deployment workflow.
The check below is a local publication prerequisite; it does not enable deployment.
The existing exporter remains a path-layout tool and can copy additional files.

Requires Python 3.12 or newer. Run from the repository root:

```bash
python3 scripts/check_static_artifact.py --help
python3 -m unittest discover -s tests -p test_static_artifact.py -v
```

On Windows, use `py -3` in place of `python3`.

Before publishing, independently review the exact prepared output. Keep its manifest
outside the upload directory, with version 1 and a nonempty files array. Each entry
has exactly path (forward-slash relative path), size (bytes), and sha256 (64 lowercase
hex characters). Pin the SHA-256 of that manifest separately from the upload folder.
Use `--artifact`, `--manifest`, and `--manifest-sha256` to check those fixed inputs.

Exit 0 means the artifact has exactly the reviewed file set and bytes. Exit 1 means
the upload must not run. Run the uploader only on successful completion of the check;
do not use unconditional next commands or ignore the exit status. Keep the checked
directory frozen through the upload. Concurrent modifications are outside this check's
guarantees. A fresh build may change bytes and requires fresh review, not automatic
regeneration of the manifest after a failure.

The checker does not scan for all secrets, approve releases, renew old evidence, or
grant deployment permission. Tests use synthetic files and do not publish anything.
The actual uploader must be identified before claiming publication is blocked by this
check. Until that integration is verified, this is a tested check entry point only.
This document does not record a sign-off or a publication.
