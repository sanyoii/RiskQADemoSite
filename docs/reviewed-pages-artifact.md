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

## Codex 操作交接

使用者確認目前由Codex接收commit／push指令，接續測試及後續工作。
這不表示每次push都發布網站；現有GitHub Actions只確認到Tests。
不需要另找或新建部署workflow，才能使用本機產物檢查。

1. 先讀工作區差異與本次授權，保留無關修改。測試、commit、push及網站發布分別回報；
   描述既有習慣不等於授權本次執行這些外部操作。
2. 在本次授權的順序與範圍內執行相關測試。若已push，查核對應commit SHA的CI結果，
   不拿其他commit的綠燈代替；失敗時停止依賴該結果的後續工作。
3. 若只要求commit／push及測試，到此回報即可，不推定還要發布網站。
4. 若另有網站上傳授權，才準備要上傳的固定產物、覆核其內容，並保存外部清單及清單SHA-256。
   上傳前執行`check_static_artifact.py`，傳入`--artifact`、`--manifest`及`--manifest-sha256`。
5. 清單缺失、檢查非零exit或檢查後產物有變更時，停止上傳；不能重新產生清單來消除失敗。
   通過後只能使用同一份保持不變的產物，且上傳動作仍須符合當次授權。
6. 回報本機測試、該SHA的遠端CI、產物比對、實際上傳、線上驗證各自的結果。
   沒上傳就寫未發布；本文件是Codex操作交接，不是不可繞過的自動部署防線。

工具的正反例已做本機驗證。這份交接本身尚未經一次獲授權的真實發布驗證；
不可將CI新增工具測試或文件更新宣稱為正式上傳攔截已驗通。
