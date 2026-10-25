# QA HTML samples v1.3

The blank forms and traceability method originate from the testing-company QA samples dated 2026-10-25. All nine document examples use this site's **Order Book synthetic failure**, as requested; the original FinMAS files are unchanged.

Scenario source: [`app/run-records/fail-demo/page.tsx`](../../../app/run-records/fail-demo/page.tsx), baseline commit `39aedcf9cb5ee03558a05288f43a7bbb70d64a0e`. The examples retain TC-MDQ-016/017/018, DEMO-RUN-FAIL-001, DEF-MDQ-004, the 104 → 103 stale update, and the synthetic 2 Pass / 1 Fail outcome. Prices, quantities, fixture versions and capture times are explicitly added teaching assumptions. They are not exchange specifications, fresh test executions or evidence attachments. Case v1.2 denotes this teaching document, not a revision of historical Runs.

The 20 generated HTML files live in `public/qa-templates/`: one index plus nine matching documents per language. `index.html` opens Traditional Chinese; `index.en.html` opens English. Existing Chinese filenames and anchors remain compatible. Each page links to its counterpart. Edit Chinese content in `build_samples.py` and full English translations in `translations_en.json`, then regenerate from the repository root:

```bash
python Templates/QA/samples/build_samples.py
```

On Windows use `py -3 -X utf8` in place of `python`. The generator validates local links, anchors, duplicate IDs and disclosure, and prints a fresh result. It does not claim browser or print verification. No previous validation receipt is imported.

When adapting a sample to another product, retain document responsibilities and traceability, but rederive the subject, units, inputs, timing, oracle, results and decision from the target context. Renaming the product alone is insufficient. Keep a source/version reference and label all supplemental assumptions. Leave the original source and historical executions intact. The regression tests check the selected demo IDs and reject leftover billing assumptions.

Keep all 20 `.html` filenames and sibling links intact during Pages packaging. Markdown templates remain the canonical authoring library; these examples are not a second execution ledger. QA-Lite still uses three records and the full library still has nine templates. The site remains a read-only projection; publishing requires separate authorization.

## Completeness and bilingual maintenance

Use the 00–08 canonical catalog as the completeness checklist before selecting examples. Keep the navigation, index and README mapping aligned with all nine documents. One index is navigation, not a tenth template. Translate blank fields, examples, instructions, labels and limitations, not just headings. Both languages must preserve IDs, numbers, decisions and evidence boundaries.

Translations are keyed by exact Chinese source text. Missing English text fails generation before any output is written; no silent Chinese fallback is allowed. Generated pages share structure and anchors. Add or revise a source segment and its English translation together. Keep language switches and sibling links relative so the entire folder works offline and under the Pages base path. Run template/link tests and inspect both languages in a browser. Syntax and link checks alone do not prove translation fidelity or print layout.

Before committing the library, include this README, the generator, the translation dictionary, all 20 generated pages and the nine canonical Markdown templates in the same delivery. Check README links against the Git staging area, not only the local filesystem, and compare the documented Markdown version with all nine `templateVersion` values. Use `重測` for retesting and `結束條件` for exit criteria in Chinese source; update translation keys and regenerate rather than editing generated HTML. The template contract tests guard terminology, version alignment and generator dependencies.
