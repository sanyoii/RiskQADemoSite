export type TestCase = {
  id: string;
  priority: "P0" | "P1" | "P2";
  check: string;
  expected: string;
};

export type TestCaseGroup = {
  id: string;
  title: string;
  cases: TestCase[];
};

export const deterministicGroups: TestCaseGroup[] = [
  {
    id: "order-book",
    title: "Order book（9 個 Test Cases）",
    cases: [
      { id: "OB-001", priority: "P1", check: "建立未排序的 order book，讀取最佳買價與賣價。", expected: "回傳最高買價、最低賣價，並保留 Decimal 精度。" },
      { id: "OB-002", priority: "P0", check: "套用連續更新，包含新增與數量歸零的價位。", expected: "新增價位、刪除零數量價位，update ID 更新為 101。" },
      { id: "OB-003", priority: "P0", check: "把過期 event 套用到現有 order book。", expected: "回傳 False，update ID 與可見價位都不變。" },
      { id: "OB-004", priority: "P0", check: "套用中間有缺口的 event。", expected: "在改動資料前拋出 SequenceGapError。" },
      { id: "OB-005", priority: "P0", check: "用買價高於賣價的 crossed snapshot 建立 order book。", expected: "拋出 MarketInvariantError，並保留買賣價資訊。" },
      { id: "OB-006", priority: "P0", check: "同步 snapshot、過期 event 與連續 event。", expected: "略過過期 event，連續套用到 update 102。" },
      { id: "OB-007", priority: "P0", check: "以零價格、零數量及負數量建立 snapshot。", expected: "每一組無效資料都拋出 MarketInvariantError。" },
      { id: "OB-008", priority: "P0", check: "對有效 order book 套用負數量更新。", expected: "拋出 MarketInvariantError；零仍只代表刪除價位。" },
      { id: "OB-009", priority: "P0", check: "用缺少 bids 或 asks 的 snapshot 建立 order book。", expected: "因市場兩側都不可為空而拋出 MarketInvariantError。" },
    ],
  },
  {
    id: "rest-contract",
    title: "REST contract（9 個 Test Cases）",
    cases: [
      { id: "REST-001", priority: "P1", check: "用小寫 symbol 取得 bookTicker，檢查 request 與回傳值。", expected: "送出 BTCUSDT，回傳標準化 symbol 與 Decimal 數值。" },
      { id: "REST-002", priority: "P0", check: "處理 bid 高於 ask 的 ticker。", expected: "以 RestContractError 拒絕 crossed market data。" },
      { id: "REST-003", priority: "P1", check: "以 btcusdt、limit 5 取得 depth。", expected: "送出標準化參數，驗證 snapshot 後才回傳。" },
      { id: "REST-004", priority: "P1", check: "要求不存在的 symbol，檢查錯誤內容。", expected: "保留 HTTP 400、exchange code -1121 與訊息。" },
      { id: "REST-005", priority: "P1", check: "取得單一 symbol 的 exchangeInfo。", expected: "回傳 BTCUSDT、TRADING、PRICE_FILTER 與 LOT_SIZE。" },
      { id: "REST-006", priority: "P0", check: "處理 bid quantity 為零的 ticker。", expected: "以 RestContractError 拒絕非正數值。" },
      { id: "REST-007", priority: "P1", check: "處理 exchangeInfo 回傳零個或兩個 symbol。", expected: "除非恰好只有一個 symbol，否則拋出 RestContractError。" },
      { id: "REST-008", priority: "P1", check: "處理缺少欄位或不是 object 的 ticker payload。", expected: "拋出 RestContractError，並提供穩定的 schema 訊息。" },
      { id: "REST-009", priority: "P1", check: "模擬 REST transport timeout。", expected: "保留 httpx.ReadTimeout 類型與原始訊息。" },
    ],
  },
  {
    id: "websocket-contract",
    title: "WebSocket contract（12 個 Test Cases）",
    cases: [
      { id: "WS-001", priority: "P1", check: "訂閱一筆 ticker，檢查控制訊息與 event。", expected: "完成訂閱、驗證、取消訂閱，且 request ID 1／2 對應正確。" },
      { id: "WS-002", priority: "P0", check: "接收 update ID 102 後再收到 101。", expected: "update ID 倒退時拋出 WebSocketContractError。" },
      { id: "WS-003", priority: "P1", check: "預期 BTCUSDT，實際收到 ETHUSDT。", expected: "拒絕錯誤 symbol，訊息包含預期值與實際值。" },
      { id: "WS-004", priority: "P0", check: "接收 quantity 為零的 event。", expected: "拒絕非正數的 price 或 quantity。" },
      { id: "WS-005", priority: "P0", check: "接收 bid 高於 ask 的 event。", expected: "拒絕 crossed market data。" },
      { id: "WS-006", priority: "P1", check: "預期 acknowledgement ID 1，實際收到 99。", expected: "拒絕不相符的 acknowledgement。" },
      { id: "WS-007", priority: "P1", check: "取消訂閱後，acknowledgement 前仍收到 market event。", expected: "忽略途中 event，等到正確 acknowledgement 後完成。" },
      { id: "WS-008", priority: "P0", check: "同步 REST snapshot 100 與 stale／continuous events。", expected: "回傳 update 102 的同步 order book，買賣價位符合預期。" },
      { id: "WS-009", priority: "P1", check: "用 0.01 秒 timeout 等待緩慢連線。", expected: "在設定的時間內拋出 TimeoutError。" },
      { id: "WS-010", priority: "P1", check: "訂閱後接收格式錯誤的 JSON。", expected: "拋出 WebSocketContractError，訊息指出 JSON 無效。" },
      { id: "WS-011", priority: "P1", check: "訂閱後接收 JSON array。", expected: "因 protocol payload 必須是 object 而拒絕。" },
      { id: "WS-012", priority: "P1", check: "acknowledgement 正確，但 ticker 缺少 A 欄位。", expected: "拋出 WebSocketContractError，並提供穩定的 schema 訊息。" },
    ],
  },
  {
    id: "documentation-contract",
    title: "Documentation contract（4 個 Test Cases）",
    cases: [
      { id: "DOC-001", priority: "P1", check: "比較 requirements 與 traceability 文件中的 requirement IDs。", expected: "兩份文件包含相同的 requirement ID 集合。" },
      { id: "DOC-002", priority: "P1", check: "比對 Test Case、Automation Map 與 pytest functions。", expected: "每個 logical Case ID 都對應到存在的 pytest function。" },
      { id: "DOC-003", priority: "P2", check: "解析 Markdown 中的相對連結。", expected: "每個相對連結都指向存在的路徑。" },
      { id: "DOC-004", priority: "P0", check: "檢查 base URLs、endpoint paths 與 CI 設定。", expected: "只使用 allowlist 內的 public market-data interfaces，沒有帳戶或交易介面。" },
    ],
  },
];

export const liveGroups: TestCaseGroup[] = [
  {
    id: "live-market-data",
    title: "Live market-data（5 個 Test Cases）",
    cases: [
      { id: "LIVE-REST-001", priority: "P1", check: "向 public REST 取得 BTCUSDT exchangeInfo。", expected: "symbol 為 trading，且包含價格與數量 filters。" },
      { id: "LIVE-REST-002", priority: "P1", check: "向 public REST 取得 BTCUSDT book ticker。", expected: "數量為正數，best bid 不高於 best ask。" },
      { id: "LIVE-REST-003", priority: "P1", check: "取得 limit 100 的 BTCUSDT depth 並建立 order book。", expected: "update ID 為正數，order book 狀態有效。" },
      { id: "LIVE-WS-001", priority: "P1", check: "訂閱 public WebSocket，收集三筆 events 後取消。", expected: "三筆 event 都有效，update IDs 不倒退。" },
      { id: "LIVE-SYNC-001", priority: "P0", check: "同步 public REST snapshot 與 WebSocket depth stream。", expected: "order book 同步完成、沒有 crossed market，且 update ID 為正數。" },
    ],
  },
];

export const manualGroups: TestCaseGroup[] = [
  {
    id: "manual-checks",
    title: "人工檢查（本次 Run 收錄 2 個 Test Cases）",
    cases: [
      { id: "MTC-SAFE-001", priority: "P0", check: "檢查 REST／WebSocket URLs、headers、variables 與 authentication settings。", expected: "只使用 public allowlist hosts；沒有 credential、authorization header、account endpoint 或交易動作。" },
      { id: "MTC-EVID-001", priority: "P1", check: "比對 Run 記錄與已執行案例，檢查記錄路徑、defects、retries、warnings 與限制。", expected: "每個已執行案例都有 status 與 actual result；缺少必要記錄時不能宣稱人工檢查通過。" },
    ],
  },
];
