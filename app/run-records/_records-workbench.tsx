"use client";
import { useState } from "react";
import { T } from "../_i18n";
import { caseGroupTitlesEn, caseTextEn, deterministicGroups, liveGroups, manualGroups, type TestCaseGroup } from "./cases";

const allCanonicalGroups: TestCaseGroup[] = [
  ...deterministicGroups,
  ...liveGroups,
  ...manualGroups,
];

const filterTabs: Array<{ id: string; en: string; zh: string; badge: string }> = [
  { id: "order-book", en: "Order Book (OB)", zh: "Order Book 帳本 (OB)", badge: "9 Cases" },
  { id: "rest-contract", en: "REST Contract", zh: "REST 契約檢查", badge: "9 Cases" },
  { id: "websocket-contract", en: "WebSocket Stream", zh: "WebSocket 串流", badge: "12 Cases" },
  { id: "documentation-contract", en: "Documentation (DOC)", zh: "文件一致性 (DOC)", badge: "4 Cases" },
  { id: "live-market-data", en: "Live Binance Feed", zh: "Live 行情驗證", badge: "5 Cases" },
  { id: "manual-checks", en: "Manual Safety (MTC)", zh: "人工安全與紀錄 (MTC)", badge: "2 Cases" },
  { id: "all", en: "All Canonical Cases", zh: "全部展開檢視", badge: "41 Cases" },
];

export function RecordsWorkbench() {
  const [selectedGroup, setSelectedGroup] = useState<string>("order-book");
  const visibleGroups = selectedGroup === "all"
    ? allCanonicalGroups
    : allCanonicalGroups.filter(g => g.id === selectedGroup);

  return (
    <div className="ct-workbench-box">
      <div className="ct-wb-filter-bar" role="group" aria-label="Filter test case groups" data-aria-label-en="Filter test case groups" data-aria-label-zh="依測試模組篩選案例">
        {filterTabs.map(tab => (
          <button
            type="button"
            key={tab.id}
            className={`ct-wb-tab ${selectedGroup === tab.id ? "is-active" : ""}`}
            aria-pressed={selectedGroup === tab.id}
            onClick={() => setSelectedGroup(tab.id)}
          >
            <span><T en={tab.en} zh={tab.zh} /></span>
            <code>{tab.badge}</code>
          </button>
        ))}
      </div>

      <div className="ct-wb-groups">
        {visibleGroups.map(group => (
          <div className="ct-wb-group-card" key={group.id}>
            <div className="ct-wb-group-head">
              <h3><T en={caseGroupTitlesEn[group.id]} zh={group.title} /></h3>
              <code className="ct-badge-go">{`${group.cases.length} SPECS`}</code>
            </div>
            <div className="ct-matrix-scroll">
              <table className="ct-sig-table ct-case-spec-table">
                <thead>
                  <tr>
                    <th scope="col">Test Case ID</th>
                    <th scope="col"><T en="Priority" zh="優先級" /></th>
                    <th scope="col"><T en="Verification Check" zh="檢查內容" /></th>
                    <th scope="col"><T en="Expected Oracle Result" zh="預期結果" /></th>
                  </tr>
                </thead>
                <tbody>
                  {group.cases.map(testCase => (
                    <tr key={testCase.id}>
                      <th scope="row">
                        <code className="ct-case-id-pill">{testCase.id}</code>
                      </th>
                      <td>
                        <code className={testCase.priority === "P0" ? "ct-p0-tag" : "ct-p1-tag"}>{testCase.priority}</code>
                      </td>
                      <td><T en={caseTextEn[testCase.id].check} zh={testCase.check} /></td>
                      <td><T en={caseTextEn[testCase.id].expected} zh={testCase.expected} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
