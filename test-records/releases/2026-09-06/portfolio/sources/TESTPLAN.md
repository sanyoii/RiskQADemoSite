# Personal Site QA Test Plan

## Purpose

This suite demonstrates practical test design, browser automation, and CI discipline
for William Lu's bilingual portfolio site. It favors readable, risk-focused checks
over broad but low-value coverage.

## Scope

- Static validation of `index.html` and `404.html`
- Chromium runtime behavior served over a local HTTP server
- Responsive layouts at the widths and viewport sizes named below
- English and Traditional Chinese language behavior
- GitHub Actions execution on pushes to `main`

## Out of Scope

- Cross-browser compatibility beyond Chromium
- Visual snapshot comparison and subjective typography review
- LinkedIn availability or other third-party service behavior
- Performance, accessibility conformance, and analytics
- Scheduled monitoring of the deployed site

## Risk Analysis

| Risk | Impact | Test response |
|---|---|---|
| One language is incomplete | Visitors see mixed-language content | Compare paired text and image-alt attributes |
| Personal contact data leaks | Privacy exposure | Scan both HTML files for known phone fragments |
| Invalid document structure | Inconsistent rendering and weak semantics | Check doctype, standards mode, and one `h1` |
| New external dependency appears | Privacy, reliability, or supply-chain regression | Allowlist source URLs and intercept browser requests |
| Responsive content overflows | Navigation and content become hard to use | Check horizontal overflow and fold budgets |
| Language state or metadata diverges | Poor bilingual UX and inaccurate search snippets | Toggle, inspect, and reload persisted state |
| Motion preference hides content | Reduced-motion users miss information | Emulate reduced motion and inspect every `.fade` |
| Error page becomes indexable or traps users | Search pollution and dead-end navigation | Validate `noindex` and the home link |

## Test Inventory

| # | Requirement | Automated test |
|---|---|---|
| 1 | Paired `data-en`/`data-zh` and alt attributes | `test_bilingual_text_and_alt_attributes_are_paired` |
| 2 | No `0922` or `+886` in either HTML file | `test_personal_phone_number_is_not_published` |
| 3 | One `h1` and standards doctype | `test_index_has_one_primary_heading_and_standards_doctype` |
| 4 | External URL allowlist | `test_external_urls_are_allowlisted` |
| 5 | No external runtime requests | `test_home_page_makes_no_external_network_requests` |
| 6 | `CSS1Compat` standards mode | `test_home_page_renders_in_standards_mode` |
| 7 | No horizontal overflow at 375, 768, or 1440 px | `test_home_page_has_no_horizontal_overflow` |
| 8 | Complete language toggle and persistence | `test_language_choice_updates_metadata_and_survives_reload` |
| 9 | Hero fold budget across required viewports and languages | `test_hero_content_respects_viewport_fold_budget` |
| 10 | Mobile eyebrow/language-toggle regression | `test_mobile_eyebrow_does_not_overlap_language_toggle` |
| 11 | Reduced-motion fade visibility | `test_reduced_motion_keeps_fade_content_visible` |
| 12 | Loadable, noindexed 404 with a home link | `test_404_page_is_noindexed_and_links_home` |

## Known Accepted Exception

At 375 x 812 in English, the bottom of `.ctas` sits slightly below the viewport.
This spacing tradeoff is accepted. The test deliberately does not claim that the
English CTA group is above the fold at this size. It still requires English and
Chinese `.avail`, plus the Chinese `.ctas`, to remain within the viewport.

## Environments and Execution

Local:

```text
# One-time setup from the repository root
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --requirement tests\requirements.txt
.\.venv\Scripts\python.exe -m playwright install chromium

# Repeatable test execution with a machine-readable result
.\.venv\Scripts\python.exe -m pytest tests\ -v --junitxml=test-records\pytest-results.xml
```

CI runs on `ubuntu-latest`, installs the pinned Python dependencies and Chromium,
then executes the same test directory. CI triggers only on pushes to `main`.
There is no cron schedule because an unchanged portfolio should not accumulate a
permanently red badge from unattended browser or runner changes.

## Pass Criteria

- Every automated check passes with pytest exit code 0.
- The workflow parses as YAML and contains only the documented push trigger.
- `index.html` and `404.html` remain unchanged by the test-suite work.
