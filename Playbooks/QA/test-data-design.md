# Test Data Design

## Decision question

在已知 field／entity constraints 下，哪些 valid、invalid、boundary 與 synthetic records 能驗證行為，又不把 production data 或 real PII 帶進測試？

## Inputs

- Field／entity definition、type、format、length、required／optional、uniqueness 與 cross-field rules。
- Environment、data retention、cleanup／rollback 與 external dependency constraints。
- Related scenario／case、expected observable outcome 與 data owner。

Constraint 沒有來源時標 `Unknown`，不為了湊資料而發明 validation rule。

## Data classes

| Class | Purpose | Example rule |
|---|---|---|
| `valid` | 代表性可接受資料 | 符合所有已知 constraints |
| `invalid` | 單一明確規則違反 | 保持其他欄位有效，讓失敗原因可觀察 |
| `boundary` | 最小／最大、剛好內外一格、空值、日期／數值邊界 | 每個 boundary 指回來源 |
| `synthetic` | 不對應真實人的組合資料 | 使用保留網域、假識別碼與可辨識 test prefix |

禁止複製 real PII、customer record、production token 或可回推個人的資料。需要 production-like shape 時只保存 schema 與經核准的 synthetic transformation，不保存原值。

## Environment safety

- 每組資料標示允許環境：local／test／staging／non-production only。
- 可能觸發 email、payment、notification、webhook 或 irreversible action 的資料預設 blocked。
- 記錄 seed、setup、cleanup、retention 與 owner；cleanup 未定時標 `Unknown`。
- Production 使用需要獨立授權與 data owner，不由本 Playbook建議通過。

## Output

```markdown
Playbook: Test Data Design
Review state: draft
State: draft / needs-clarification / blocked
Constraints and sources:
| Field | valid | invalid | boundary | synthetic | Expected outcome | Environment |
Safety controls: <PII, side effects, retention, cleanup>
Unknown constraints:
Evidence target: conditional Test Data Sheet / 04 Test Case
Decision owner: <human or Unknown>
External actions: none
```

資料只是 draft；不建立帳號、不呼叫 API、不寫入 environment。Review 後由 04 Test Case 引用具體資料與 observable expected result。


## Shared numeric contract

在 02 的既有 Spec 定義 DC ID／version／確認狀態、來源、單位／期間／幣別、as-of／時區、公式、缺值／零值、精度／捨入及容差依據。04 引用條款並保留本案具體輸入、資料列 ID 與可重算預期值；05 記實際契約版本、快照與擷取時間。各資料列獨立判定，契約更新依 [Review and recovery](playbook-contract.md#review-and-recovery) 重評。
