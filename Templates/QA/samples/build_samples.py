"""Build static, offline QA templates with explicitly synthetic teaching examples."""
from pathlib import Path
from html import escape
import json
import re
from html.parser import HTMLParser
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[3] / "public" / "qa-templates"
# One ordered catalog for navigation and all nine canonical template mappings.
FILES = [
    ('index.html', '使用入口'),
    ('qa-test-request.html', '00 QA Test Request'),
    ('quality-risk-assessment.html', '01 Quality Risk Assessment'),
    ('test-spec-template.html', '02 Test Specification'),
    ('test-scenario-template.html', '03 Test Scenario'),
    ('test-case-template.html', '04 Test Case'),
    ('run-log.html', '05 Test Run Record'),
    ('bug-report-template.html', '06 Defect Report'),
    ('quality-report.html', '07 Release Quality Summary'),
    ('dashboard-status-contract.html', '08 Dashboard Status Contract'),
]
CSS = r'''
:root{--nav:#0f172a;--ink:#263447;--muted:#58677b;--blue:#2456be;--line:#dce3ec;--paper:#f8fafc;--wash:#eef4ff;--warn:#805000}
*{box-sizing:border-box}html{scroll-padding-top:24px}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.8 "Segoe UI","Microsoft JhengHei",sans-serif}a{color:var(--blue);text-underline-offset:3px}a:hover{text-decoration-thickness:2px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #a66013;outline-offset:4px}.skip{position:absolute;top:-70px;left:18px;background:white;padding:10px;z-index:10}.skip:focus{top:10px}.sidebar{position:fixed;inset:0 auto 0 0;width:238px;background:var(--nav);padding:28px 20px;color:#dbe4f0;overflow-y:auto}.sidebar strong{display:block;color:white;font-size:18px;margin-bottom:20px}.sidebar a{display:block;color:#dbe4f0;text-decoration:none;padding:8px 0;font-size:14px;line-height:1.6}.sidebar a[aria-current=page]{color:white;font-weight:700}.sidebar p{font-size:12px;color:#bac8da;border-top:1px solid #344155;padding-top:18px;margin-top:24px}.mobile-nav{display:none}main{margin-left:238px;max-width:1340px;padding:36px 44px 50px;min-width:0}h1,h2,h3{color:#0f172a;line-height:1.45}h1{font-size:32px;margin:0 0 10px;letter-spacing:-.02em}h2{font-size:24px;margin:0 0 18px;padding-left:12px;border-left:5px solid var(--blue)}h3{font-size:18px;margin:26px 0 10px}p{margin:0 0 14px}section{margin-top:42px}header p,.muted{font-size:14px;color:var(--muted)}.eyebrow{color:var(--blue);font-size:13px;font-weight:700;margin-bottom:8px;letter-spacing:.05em}.intro{background:var(--wash);border:1px solid #c7d8f5;padding:18px 22px;border-radius:6px}.notice{border-left:3px solid #c78b28;background:#fff5e4;padding:12px 16px;color:var(--warn);font-size:14px;margin-top:20px}.notice p:last-child,.intro p:last-child{margin-bottom:0}.actions{display:flex;gap:12px 22px;flex-wrap:wrap;align-items:center;margin-top:18px;font-size:14px}button{font:inherit;background:white;color:#223b67;border:1px solid #8c9aaf;padding:7px 13px;border-radius:4px;cursor:pointer}.label{font-size:12px;color:var(--muted);background:#e9eef5;padding:3px 7px;border-radius:3px;margin-left:6px;white-space:nowrap}.panel{background:white;border:1px solid var(--line);padding:20px 22px;border-radius:6px;margin:16px 0}.panel h3:first-child{margin-top:0}.steps{padding-left:24px}.steps li{padding-left:4px;margin:9px 0}.flow{font:14px/1.9 Consolas,"Microsoft JhengHei",monospace;white-space:pre-wrap;background:white;border-left:3px solid #9db6dd;padding:15px 18px;overflow-wrap:anywhere}pre.template{font:14px/1.85 Consolas,"Microsoft JhengHei",monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:white;border:1px solid var(--line);padding:20px;border-radius:6px;margin:16px 0}.small{font-size:13px;color:var(--muted)}table{border-collapse:collapse;width:100%;table-layout:fixed;background:white;font-size:14px;line-height:1.7;margin:14px 0 22px}th,td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}th{background:#e7edfb;color:#18365b;font-weight:600}th:first-child{width:22%}td:first-child{font-weight:600}p,li,a,td,th,h1,h2,h3{overflow-wrap:anywhere}ul{padding-left:23px}li{margin:6px 0}.summary{border-left:4px solid #9c3b30;background:#fff2ef;padding:14px 18px}.kicker{color:var(--muted);font-size:13px}footer{border-top:1px solid var(--line);padding-top:18px;margin-top:40px;font-size:12px;color:var(--muted)}
@media(max-width:800px){.sidebar{display:none}.mobile-nav{display:block;background:var(--nav);padding:12px 18px;color:white}.mobile-nav summary{cursor:pointer;min-height:32px}.mobile-nav nav{padding-top:12px}.mobile-nav a{display:block;color:#dbe4f0;padding:8px 0;font-size:14px}main{margin:0;padding:25px 18px 36px;max-width:none}h1{font-size:28px}h2{font-size:22px}section{margin-top:34px}.intro,.panel{padding:16px}.responsive,.responsive tbody,.responsive tr,.responsive td{display:block;width:100%}.responsive thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.responsive tr{border:1px solid var(--line);margin-bottom:12px;padding:10px 13px;background:white}.responsive td{border:0;padding:6px 0}.responsive td[data-label]::before{content:attr(data-label)"：";display:block;font-weight:600;color:#18365b}pre.template{font-size:13px;padding:15px}.label{white-space:normal}}
@page{size:A4;margin:15mm}
@media print{html{scroll-padding-top:0}body{background:white;color:#111827;font-size:10pt;line-height:1.6}.sidebar,.mobile-nav,.skip,.actions{display:none!important}main{margin:0;padding:0;max-width:none}h1{font-size:23pt}h2{font-size:15pt;break-after:avoid;margin-bottom:3mm}h3{font-size:11pt;break-after:avoid;margin:4mm 0 2mm}section{margin-top:7mm}p{margin-bottom:2mm;orphans:3;widows:3}.notice,.intro,.panel,.summary{padding:3mm 4mm}.notice,.intro,.summary{break-inside:avoid}.panel{border-radius:0}.eyebrow,.kicker,.small,header p{font-size:8pt}table{font-size:8.5pt;line-height:1.55;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}th,td{padding:2mm 2.5mm}pre.template,.flow{font-size:8.5pt;line-height:1.6;padding:3mm;white-space:pre-wrap}.template{break-inside:auto}.steps li{margin:2mm 0}a{color:#18365b}footer{font-size:8pt;margin-top:5mm}.label{font-size:7.5pt}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
'''

NOTICE = '<div class="notice"><strong>Order Book 合成教學情境，非真實交易所實測。</strong>沿用本站 Fail Demo 的序號覆寫案例；價格、數量與時間是教學補充設定。Run、缺陷及證據名稱均為合成示例，沒有真實產品操作、證據附件或客戶核准。</div>'

def table(headers, rows):
    return '<table class="responsive"><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td data-label="'+escape(headers[i])+'">'+v+'</td>' for i,v in enumerate(row))+'</tr>' for row in rows)+'</tbody></table>'

def section(id, title, content):
    return f'<section id="{id}" aria-labelledby="{id}-title"><h2 id="{id}-title">{title}</h2>{content}</section>'

def blank(text):
    return '<p class="small">〔必填〕每案都要有；〔條件式〕適用時必填，不適用寫原因。複製下方文字到案件文件後替換方括號內容。本頁為靜態範本，沒有編輯或儲存功能。</p><pre class="template">'+escape(text.strip())+'</pre>'

def page(file, title, subtitle, body, local_nav):
    nav=''.join('<a href="'+f+'"'+(' aria-current="page"' if f==file else '')+'>'+t+'</a>' for f,t in FILES)
    links=''.join('<a href="#'+i+'">'+t+'</a>' for i,t in local_nav)
    return f'''<!doctype html>
<html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>{escape(title)} · QA 範本示例</title><style>{CSS}</style></head>
<body><a class="skip" href="#main">跳到正文</a><aside class="sidebar" aria-label="文件導覽"><strong>QA 文件範本</strong><nav aria-label="文件">{nav}</nav><p>本頁內容</p><nav aria-label="章節">{links}</nav><p>範本與合成示例 v1.3<br>2026 年 10 月 26 日<br>可離線閱讀與列印</p></aside><details class="mobile-nav"><summary>目錄與相關文件</summary><nav>{nav}{links}</nav></details><main id="main"><header><p class="eyebrow">QA TEMPLATE / SAMPLE</p><h1>{escape(title)}</h1><p>{escape(subtitle)}</p><div class="actions"><a class="language-switch" lang="en" hreflang="en" href="{file.replace(".html", ".en.html")}">English</a><a href="#blank">查看空白範本</a><a href="#sample">查看填寫示例</a><button type="button" onclick="window.print()">列印／另存 PDF</button></div></header>{NOTICE}{body}<footer>QA 範本示例 v1.3 · 合成教學資料 · 尚未作為任何客戶的核定規格或實測結果。本組中英文共 20 份 HTML，請保留同一資料夾與相對連結。</footer></main></body></html>'''

spec_blank='〔必填〕Spec ID／版本：[ ]\u3000文件狀態：[草稿／待審閱／已核定]\n〔必填〕產品／本輪版本／負責人：[ ]\n〔必填〕目的、範圍、不測範圍：[ ]\n〔必填〕需求與判準表：REQ ID｜來源／版本｜規則｜確認狀態／人員／日期\n〔必填〕風險表：RISK ID｜失效模式｜影響｜可能性｜偵測難度｜依據\n〔必填〕追溯表：REQ ↔ RISK ↔ Scenario ↔ Case／版本 ↔ Run ↔ Defect\n〔必填〕問題清單：Q ID｜問題｜責任人｜影響 ID｜答案來源／日期｜新判準版本\n〔必填〕執行關卡：版本、角色、資料、判準、隔離、額度、停止與證據安排\n〔必填〕授權：允許帳號／操作、AI 可讀資料、遮蔽、保存位置／期限、清理範圍\n〔必填〕覆核：設計與結果的覆核者、方法、來源與未完成限制\n〔必填〕缺陷：Severity 定義、裁定責任、狀態流程、重測與回歸選取方式\n〔必填〕結束條件：關鍵路徑證據；未解決 S1／S2 處置；追溯缺口解釋\n〔必填〕修訂：原因｜舊／新版本｜受影響項目｜重新評估與重測安排\n〔條件式〕AI 測試：模型／提示詞／資料版本、K 次、允許變異、校準及覆核\n〔條件式〕資料契約：DC ID／版本／確認狀態；來源、期間、as-of 規則、單位、公式、缺值／零值、捨入與容差\n執行結果引用另存 Run；此處不預填實際結果。'

scenario_blank='〔必填〕Scenario ID／版本：[ ]\n〔必填〕標題與情境目標：[使用者在什麼條件下，要完成什麼事]\n〔必填〕需求／判準版本：[REQ ID、來源與確認狀態]\n〔必填〕風險 ID：[失效模式與影響]\n〔必填〕角色、起始狀態、操作與結束狀態：[ ]\n〔必填〕開始條件／依賴：[ ]\n〔必填〕範圍／排除：[ ]\n〔必填〕案例表：Case ID／版本｜目的｜資料分區／邊界｜Priority｜自動化適合度\n〔必填〕每筆案例獨立判定；不同輸入條件不合併一個結果。\n〔必填〕待確認問題／影響項目：[ ]\n〔條件式〕Scenario 預設 Priority：[ ]；案例可覆寫並附依據\n〔條件式〕資料與操作清理：[ ]\n〔必填〕追溯：Case → 各次 Run → Defect；Scenario 不預填整體 Pass。'

case_blank='〔必填〕Case ID／版本：[ ]\u3000標題／目的：[ ]\n〔必填〕Scenario／需求／風險 ID：[ ]\n〔必填〕判準來源與版本／確認狀態：[ ]\n〔必填〕案例 Priority／依據：[ ]（可覆寫 Scenario 預設）\n〔必填〕自動化適合度：[可自動化／部分自動化／人工]；理由與人工檢查點：[ ]\n〔必填〕自動化實作狀態／腳本引用：[未實作／阻塞／已建立；引用]\n〔條件式〕Preconditions：[帳號、角色、環境、前置狀態與依賴]\n〔條件式〕Test Data：[具體值／資料集版本、資料列 ID、等價類／邊界]\n〔必填〕Steps／Expected：S1 操作 → CP1；S2 操作 → CP2；逐一列明\n〔條件式〕等待／停止：[可觀察條件、時限、重試與額度上限]\n〔條件式〕資料契約引用：[DC ID／版本／條款連結]；本案輸入、衍生預期值：[ ]\n〔條件式〕AI 設計：[資料、模型、提示詞、評估版本、K、允許變異、逐次及彙整判準]\n〔條件式〕Postconditions／Cleanup：[留下什麼、如何在授權內還原]\n〔必填〕證據要求：[原始輸入／輸出、操作／事件識別、時間、位置]\n〔必填〕審閱狀態與待確認問題：[ ]\nActual Result 與執行狀態另存 Run Log；本頁只保留相關紀錄連結。'

bug_blank='〔必填〕Defect ID／標題：[觸發條件＋觀察到的影響]\n〔必填〕版本／環境／時間／回報人：[ ]\n〔必填〕QA 建議 Severity：[S1／S2／S3／S4]；影響依據：[ ]\n〔必填〕委託方裁定：[待裁定／等級、依據、裁定人、日期]\n〔條件式〕修復 Priority：[獨立填寫，待委託方決定]\n〔必填〕追溯：需求／判準版本、風險、Scenario、Case／版本、Run、資料列、失敗 Step／CP\n〔必填〕Preconditions／Test Data：[ ]\n〔必填〕重現步驟：[編號；最少但完整]\n〔必填〕Expected Result／來源：[ ]\n〔必填〕Actual Result：[可觀察差異，不只寫 Fail]\n〔必填〕影響／已知範圍／重現率：[成功重現次數／實際嘗試次數]\n〔必填〕Evidence：[原始檔位置／時間／必要遮蔽，不能只給摘要]\n〔必填〕成因：[product／test／environment／data／unknown；沒有證據不猜]\n〔必填〕缺陷狀態／負責人／下一步：[ ]\n〔條件式〕修正版本、重測 Run、回歸範圍與風險依據：[ ]\n〔條件式〕延期接受：[有權人、理由、剩餘風險、責任人、重評日期]\n整輪結果與結束條件判定另見品質報告；本缺陷只引用相關 Run 與證據。'

run_blank='Run 空白欄位（執行前先做就緒檢查）\nRun ID／案例版本／資料列／嘗試編號：[ ]\n環境／產品版本／時間與時區／執行人：[ ]\n就緒檢查與核定判準：[ ]\n實際模型／提示詞／資料版本：[適用時填寫]\nStep／CP → Actual Result → Status → Evidence：[ ]\n操作／事件識別／Defect ID／失敗步驟：[ ]\nRun Status：[Not Run／Pass／Fail／Blocked／Skipped]\n未完成部分、阻塞原因與恢復條件：[ ]\nIn Progress 僅為工作草稿；不作封存結果。\n實際使用的資料契約 ID／版本：[ ]\n實際資料快照 ID、as-of／時區、擷取時間：[ ]'

quality_blank='〔必填〕報告 ID／版本、本輪範圍、產品版本／環境、截止時間：[ ]\n〔必填〕引用的 Spec／Case／Run／Defect／資料契約版本：[ ]\n〔必填〕已知問題：[缺陷 ID、影響、未解決等級、處置與風險接受依據]\n〔必填〕執行完整性：[選定範圍、實際完成、Blocked／Skipped／Not Run 及原因]\n〔必填〕結束條件判定：[逐項條件、證據、未達項與有權人的決定]\n〔必填〕未測部分：[案例、風險、原因與後續責任]\n〔必填〕覆核與限制：[誰覆核什麼、依據、尚未完成項]\n總結論由上述內容推導，不另獨立填寫；測試結束與批准上線分開。'

spec_body=section('purpose','這份文件回答什麼','<div class="intro"><p>定義 Order Book 的更新規則、測試範圍及可追溯的判準。這組示例聚焦舊序號更新覆寫最新狀態的問題，來源是本站 Fail Demo 的合成案例。</p></div>')
spec_body+=section('blank','空白範本',blank(spec_blank))
spec_body+=section('sample','填寫示例：Order Book 更新順序','<div class="panel" id="DEMO-SPEC-MDQ"><h3>DEMO-SPEC-MDQ · v1.2</h3><p>目的：驗證連續更新、拒絕舊序號及重新連線後載入快照。範圍是隔離的合成行情狀態；不含真實交易所協定、下單、成交、資產或壓力測試。</p><p>環境名稱：DEMO-BOOK／build-demo-1；沒有真實端點。文件狀態：教學草稿。案例 ID 與 104→103 失敗沿用 app/run-records/fail-demo/page.tsx；本頁新增的資料契約只供教學，未經產品方核定。</p></div>'+table(['需求／判準','合成規則','來源／狀態'],[
 ('<span id="DEMO-REQ-NEXT">DEMO-REQ-NEXT</span>','current=104，incoming=105 時，套用本次更新並保留新序號。','TC-MDQ-016 的連續更新情境；具體數值為教學設定。'),
 ('<span id="DEMO-REQ-STALE">DEMO-REQ-STALE</span>','current=104，incoming=103 時拒絕舊事件，序號及整份 Order Book 保持原值。','TC-MDQ-017；104／103 沿用本站 Fail Demo。'),
 ('<span id="DEMO-REQ-RECONNECT">DEMO-REQ-RECONNECT</span>','重新連線後用指定的最新完整快照取代舊狀態。','TC-MDQ-018；快照 106 及價格、數量為教學補充。')]))
spec_body+=section('contract','共用資料契約','<div class="panel" id="DEMO-DC-MDQ"><h3>DEMO-DC-MDQ · v1.0</h3><p>資料集 DEMO-BOOK-DATA-v1，僅含下列自足的合成資料。交易對 DEMO-BASE/QUOTE：價格單位 QUOTE／BASE，數量單位 BASE。這套簡化規則不代表任何交易所的 sequence range 或 WebSocket 協定。</p></div>'+table(['條款','定義'],[
 ('C1 快照與事件','基準 SNAP-104：sequence=104，bids=[[100,2]]，asks=[[101,3]]。E-105：sequence=105，將價格 100 的 bid 數量更新為 4。E-103：sequence=103，企圖將同一 bid 數量更新為 9。重連 SNAP-106：sequence=106，bids=[[100,5]]，asks=[[101,6]]。每案從獨立 SNAP-104 開始，前案不得污染後案。'),
 ('C2 判定與容差','連續更新後預期 sequence=105、bid 100×4、ask 101×3。舊事件後預期 sequence=104、bid 100×2、ask 101×3，完整狀態須不變。重連後預期完整 SNAP-106。sequence 為整數；本資料的價格、數量用精確十進位值比較，絕對容差 0，不捨入。零數量刪價位、缺值、相同序號及序號跳號均未定義，須另確認，不能把缺值當零。'),
 ('C3 時間與觀察','以每案事件處理完成的確認點比較前後狀態；重連以完整快照套用完成為確認點。此同步教學情境沒有產品延遲 SLA，不沿用原案例的 30 秒等待。記錄來源 as-of、擷取時間及時區；sequence 決定順序，牆鐘時間不取代序號。缺少完成訊號或可觀察狀態時先記 Blocked，不能憑等待秒數推定 Pass／Fail。'),
 ('C4 證據與停止','保存事件識別、輸入、前後完整狀態與確認點。前提有效且狀態違反 C2 時記 Fail；無法準備隔離快照或觀察狀態時記 Blocked。已確認的失敗保留，不被其他阻塞蓋過。發現舊資料覆寫後停止該案例，保留快照；其餘案例僅在獨立隔離資料中執行。')]))
spec_body+=section('risk','風險與追溯',table(['需求／風險','情境／案例','結果入口'],[
 ('DEMO-REQ-STALE／<span id="RISK-OB-SEQ">RISK-OB-SEQ</span>：舊行情覆寫最新狀態，可能影響下游報價判斷。可能性與偵測難度：Unknown。','<a href="test-scenario-template.html#DEMO-SC-BOOK">DEMO-SC-BOOK</a> → <a href="test-case-template.html#TC-MDQ-017">TC-MDQ-017 v1.2</a>','<a href="run-log.html#DEMO-RUN-FAIL-001">DEMO-RUN-FAIL-001</a> → <a href="bug-report-template.html#DEF-MDQ-004">DEF-MDQ-004</a>（均合成）'),
 ('DEMO-REQ-NEXT／RISK-OB-SEQ','DEMO-SC-BOOK → <a href="test-case-template.html#TC-MDQ-016">TC-MDQ-016 v1.2</a>','<a href="run-log.html#coverage">同輪逐案紀錄</a>'),
 ('DEMO-REQ-RECONNECT／RISK-OB-SEQ','DEMO-SC-BOOK → <a href="test-case-template.html#TC-MDQ-018">TC-MDQ-018 v1.2</a>','<a href="run-log.html#coverage">同輪逐案紀錄</a>')]))
spec_body+=section('questions','問題與版本影響',table(['問題／責任','受影響項目','恢復條件'],[
 ('<span id="DEMO-Q-SEQ">DEMO-Q-SEQ</span>：實際 feed 的序號、重連與完成訊號規則為何？產品／行情介接窗口確認。','三筆需求、DC C1～C3、三案及相關 Run；真實規則 Unknown。','取得官方規格與版本後修訂判準，列出差異，重評受影響案例並新增 Run；舊 Run 保留原版本。'),
 ('DEMO-Q-DATA：哪些輸入可交給 AI，證據存多久、由誰清理？資料窗口確認。','外部 AI 擷取、保存與清理；本示例不呼叫 AI 或真實服務。','確認允許資料類別、遮蔽、模型／服務、保存位置與期限；未確認前不外傳或清理。')])+ '<p>覆核分歧時保留雙方結論及原始依據，由指定責任人重查；受影響判定暫不升為 Ready。AI 誤判先保存輸入、模型／提示詞與評估版本，人工重新標記並檢查受影響範圍，再用保留驗證集重評。</p>')
spec_body+=section('gates','執行、覆核與結束條件','<h3>執行前</h3><p>逐案確認版本、隔離 fixture、事件輸入、完成訊號、判準、資料讀取權限、操作上限及證據安排。必要條件不足時不開始產品操作，選定案例記 Blocked。</p><h3>覆核</h3><p>設計覆核對照來源與案例；結果覆核先看原始輸入輸出，再比較結論。同一模型換角色不算獨立覆核。本套只有合成填寫示例，無真人核准或產品執行。</p><h3>三項結束條件</h3><ol class="steps"><li>關鍵路徑完成必要步驟及檢查點，有當前版本／環境的有效證據。</li><li>沒有未解決 S1；S2 已修復並完成必要重測／回歸，或有權人明確接受延期並記理由、責任人、重評日期。</li><li>追溯表沒有未解釋缺口。</li></ol><p>測試結束、符合結束條件與批准上線分開。各項結果見 <a href="quality-report.html#sample">品質報告</a>。</p>')

scenario_body=section('purpose','這份文件回答什麼','<div class="intro"><p>同一行情流程拆成三個可獨立判定的條件：連續更新、舊事件、重連快照。Scenario 保存範圍與選取理由，執行結果另存 Run。</p></div>')
scenario_body+=section('blank','空白範本',blank(scenario_blank))
scenario_body+=section('sample','填寫示例','<div class="panel" id="DEMO-SC-BOOK"><h3>DEMO-SC-BOOK · v1.2｜維持 Order Book 的最新狀態</h3><p>角色：合成行情消費端。起始狀態：SNAP-104。分別送入下一筆事件、舊事件，或重連後快照；各案獨立還原起始狀態。</p><p>需求：DEMO-REQ-NEXT／STALE／RECONNECT；風險 <a href="test-spec-template.html#RISK-OB-SEQ">RISK-OB-SEQ</a>；資料契約 <a href="test-spec-template.html#DEMO-DC-MDQ">DEMO-DC-MDQ v1.0</a>。Scenario 預設 P1；案例可依風險覆寫，Severity 另於缺陷記錄。</p></div>'+table(['案例／目的','資料分區','優先與自動化'],[
 ('<a href="test-case-template.html#TC-MDQ-016">TC-MDQ-016 v1.2</a>：連續更新','104 → 105；正常順序。','P0，覆寫 P1，影響行情基本正確性；可自動化，本文未提供可執行腳本。'),
 ('<a href="test-case-template.html#TC-MDQ-017">TC-MDQ-017 v1.2</a>：拒絕舊事件','104 收到 103；負向順序代表值。','P0，覆寫 P1，防止狀態倒退；可自動化，本文未提供可執行腳本。'),
 ('<a href="test-case-template.html#TC-MDQ-018">TC-MDQ-018 v1.2</a>：重連恢復','104 → 完整快照 106；狀態轉移。','P1；可自動化，需明確的快照套用完成訊號。')]))
scenario_body+=section('boundaries','資料與邊界','<p>只用 103／104／105 說明舊值、基準與下一值；尚未測相同序號、跳號、亂序緩衝、零數量、缺值與斷線中事件。這三案不能宣稱完整覆蓋行情協定。</p><p>實案先解決 <a href="test-spec-template.html#DEMO-Q-SEQ">DEMO-Q-SEQ</a>。若規則或可觀察條件不足，受影響案例先記 Blocked；規則改版則更新案例版本並新增 Run。</p>')
scenario_body+=section('trace','執行追溯','<p>每案的步驟與預期見 <a href="test-case-template.html#sample">Test Case</a>；逐案合成結果見 <a href="run-log.html#coverage">Run Log</a>；已知問題見 <a href="bug-report-template.html#DEF-MDQ-004">DEF-MDQ-004</a>。</p>')

case_body=section('purpose','這份文件回答什麼','<div class="intro"><p>案例定義資料、操作與檢查點；每次執行另留 Run。本頁的 v1.2 是教學文件版本，沒有改寫本站原有 Run 或真實產品案例。</p></div>')
case_body+=section('blank','空白範本',blank(case_blank))
case_body+=section('sample','完整案例：拒絕舊序號','<div class="panel" id="TC-MDQ-017"><h3>TC-MDQ-017 · v1.2｜Rejects a stale-sequence market-data update</h3><p>追溯：<a href="test-spec-template.html#DEMO-REQ-STALE">DEMO-REQ-STALE</a> ↔ <a href="test-spec-template.html#RISK-OB-SEQ">RISK-OB-SEQ</a> ↔ <a href="test-scenario-template.html#DEMO-SC-BOOK">DEMO-SC-BOOK</a>。Priority P0，依據為舊行情覆寫的影響。</p><p>自動化適合度：可自動化，序號與完整快照可確定性比較。本文實作狀態：未提供執行腳本；站內合成 log 也不代表真實執行。</p></div>'+table(['項目','內容'],[
 ('Preconditions','獨立 DEMO-BOOK／build-demo-1；載入 SNAP-104，沒有背景行情來源。完成訊號與狀態擷取可用。'),
 ('Test Data','DEMO-BOOK-DATA-v1／STALE-103：current=104，bid 100×2，ask 101×3；E-103 企圖把 bid 100 的數量改為 9。'),
 ('Oracle','<a href="test-spec-template.html#DEMO-DC-MDQ">DEMO-DC-MDQ v1.0 C1～C4</a>。預期拒絕 E-103；sequence=104，bid 100×2，ask 101×3，整份狀態不變。'),
 ('等待／停止','事件處理完成後讀回，不設定未核定的產品 SLA。缺完成訊號或快照為 Blocked；已確認舊事件被接受或狀態改變為 Fail，保存資料後停止該案。'),
 ('AI','本案用確定性比較，模型／提示詞／K 不適用。若 AI 協助整理證據，須保存輸入及版本、人工對照原始結果；不讓 AI 改寫 Pass／Fail 判準。')])+table(['Step','操作','Expected／檢查點'],[
 ('S1','載入獨立 SNAP-104，保存基準快照與時間。','CP1：sequence=104、bid 100×2、ask 101×3；前提不符先停止。'),
 ('S2','只注入 E-103 一次，保存事件識別及完成訊號。','CP2：事件被拒絕，不套用任何更新。'),
 ('S3','讀回完整 Order Book，逐項比較基準。','CP3：sequence 仍為 104，bids／asks 完全相同，容差 0。')])+ '<p>Cleanup：保存前後快照後在隔離 fixture 還原；任何真實資料刪除另須授權。設計狀態：合成教學假設，實案規格與審閱待確認。</p>')
case_body+=section('other-cases','其他獨立案例','<div class="panel" id="TC-MDQ-016"><h3>TC-MDQ-016 · v1.2｜接受連續遞增更新</h3><p>目的：驗證下一序號可套用。來源 DEMO-REQ-NEXT；Scenario DEMO-SC-BOOK；風險 RISK-OB-SEQ；P0，可自動化，本文未提供執行腳本。資料 DEMO-BOOK-DATA-v1／NEXT-105，依 <a href="test-spec-template.html#DEMO-DC-MDQ">契約 C1～C4</a>。</p><p>S1 載入並保存獨立 SNAP-104，CP1 確認基準；S2 注入 E-105 一次並等待完成訊號，CP2 接受事件；S3 讀回狀態，CP3 預期 sequence=105、bid 100×4、ask 101×3。證據、停止、Cleanup 與主案例相同。</p></div><div class="panel" id="TC-MDQ-018"><h3>TC-MDQ-018 · v1.2｜重連後恢復最新快照</h3><p>目的：驗證恢復時完整替換舊狀態。來源 DEMO-REQ-RECONNECT；Scenario DEMO-SC-BOOK；風險 RISK-OB-SEQ；P1，可自動化，本文未提供執行腳本。資料 DEMO-BOOK-DATA-v1／RECONNECT-106，依 <a href="test-spec-template.html#DEMO-DC-MDQ">契約 C1～C4</a>。</p><p>S1 載入並保存獨立 SNAP-104，CP1 確認基準；S2 在隔離 fixture 模擬斷線與重連，提供 SNAP-106，CP2 收到完整快照套用完成訊號；S3 讀回狀態，CP3 預期 sequence=106、bid 100×5、ask 101×6，沒有舊價位殘留。證據、停止、Cleanup 與主案例相同；不推定真實交易所的恢復演算法。</p></div>')
case_body+=section('records','執行紀錄入口','<p>Actual Result、Status、時間與證據只放 <a href="run-log.html#sample">Run Log</a>；本頁保留連結。整輪推導見 <a href="quality-report.html#sample">品質報告</a>。</p>')

bug_body=section('purpose','這份文件回答什麼','<div class="intro"><p>記錄觸發條件、預期與實際差異、影響及處置。缺陷分級與整輪結束條件判定分開。</p></div>')
bug_body+=section('blank','空白範本',blank(bug_blank))
bug_body+=section('sample','填寫示例','<div class="panel" id="DEF-MDQ-004"><h3>DEF-MDQ-004｜舊序號 103 覆寫已更新至 104 的 Order Book</h3><p>沿用本站 Fail Demo 的合成缺陷 ID；狀態 Triaged · demo，QA 建議 S1。無客戶裁定，根因 Unknown。</p></div>'+table(['欄位','內容'],[
 ('版本／環境／回報','build-demo-1／DEMO-BOOK；DEMO-TESTER（虛構）。時間與證據見 <a href="run-log.html#DEMO-RUN-FAIL-001">DEMO-RUN-FAIL-001</a>。'),
 ('案例／資料／檢查點','<a href="test-case-template.html#TC-MDQ-017">TC-MDQ-017 v1.2</a>／STALE-103／attempt 1／S2～S3、CP2～CP3。'),
 ('重現步驟','載入 SNAP-104；只送 E-103 一次；在事件完成後讀回完整狀態。基準與數值依 <a href="test-spec-template.html#DEMO-DC-MDQ">DEMO-DC-MDQ v1.0</a>。'),
 ('預期／實際','預期拒絕舊事件並維持 sequence=104、bid 100×2、ask 101×3；合成實際接受事件，sequence=103、bid 100×9、ask 101×3。'),
 ('影響與重現','行情狀態倒退，可能誤導下游判斷；未宣稱發生真實交易或損失。此處只展開一筆合成 attempt；本站另一處的合成重現敘述不作真實重現率。'),
 ('責任／處置','DEMO-ENGINEER 待調查；不得把猜測寫成根因。停止該案、保存快照，修正後新增 Run；未有修復或重測證據。')]))
bug_body+=section('severity','分級與狀態',table(['欄位','規則'],[
 ('Severity','S1：核心狀態正確性或完整性受損；此例建議 S1。S2：重要功能失效；S3：局部受影響且可繞行；S4：輕微問題。實案由約定的有權人裁定，另記依據。'),
 ('Priority','案例 P0 決定測試順序；缺陷修復 Priority 由責任人另定，不能用 P0 代替 Severity。'),
 ('狀態','New → Triaged → In Progress → Fixed → Verified → Closed；重測失敗回 Reopened。Fixed 只表示有修正宣稱，仍須新 Run 證據；本例停在 Triaged。')]))
bug_body+=section('retest','重測與回歸','<p>修正後以 TC-MDQ-017 原輸入新增 Run，查 CP2 與 CP3。回歸選 TC-MDQ-016，確認正常更新未被一起拒絕；選 TC-MDQ-018，確認重連完整替換未受影響。相同序號、跳號及亂序先取得判準再擴充。不得把尚未執行的安排填成 Pass。</p>')
bug_body+=section('reports','相關紀錄','<p>原失敗保留於 <a href="run-log.html#DEMO-RUN-FAIL-001">Run Log</a>；品質報告的結論引用本缺陷與該輪證據，見 <a href="quality-report.html#sample">品質報告</a>。</p>')

# Synthetic facts are shared by the Run table and report; no runtime ledger is created.
RESULTS=[('TC-MDQ-016','NEXT-105','Pass','0.18','CP1～CP3 完成；實際 sequence=105、bid 100×4、ask 101×3。'),
         ('TC-MDQ-017','STALE-103','Fail','0.21','CP1 成立；CP2 接受 E-103，CP3 實際 sequence=103、bid 100×9、ask 101×3，違反預期。'),
         ('TC-MDQ-018','RECONNECT-106','Pass','0.44','CP1～CP3 完成；實際完整快照為 sequence=106、bid 100×5、ask 101×6。')]
run_body=section('purpose','這份文件回答什麼','<div class="intro"><p>Run 固定當次案例與契約版本，保存逐案觀察及證據。此處是靜態填寫示例，沒有執行或儲存功能；本頁三筆結果都屬同一合成批次。</p></div>')
run_body+=section('blank','空白範本',blank(run_blank))
run_body+=section('sample','Run 填寫示例','<div class="notice" id="DEMO-RUN-FAIL-001"><strong>DEMO-RUN-FAIL-001 · 全部為合成資料</strong>沿用本站 Fail Demo 的 3 案、2 Pass／1 Fail、exit 1、合計 0.83 秒。v1.2 文件補上資料契約與檢查點；沒有重新執行測試，也沒有修改原 Run。</div>'+table(['欄位','示例值'],[
 ('版本／環境／人員','三案教學版本 v1.2；DEMO-BOOK／build-demo-1；DEMO-TESTER（虛構）。'),
 ('就緒紀錄','在合成設定中，三案都有獨立 SNAP-104、指定事件及完成訊號。真實規格核准與執行證據：未提供。'),
 ('契約／資料','<a href="test-spec-template.html#DEMO-DC-MDQ">DEMO-DC-MDQ v1.0</a>／DEMO-BOOK-DATA-v1；每案 attempt 1，資料列見下表。'),
 ('時間／快照','教學補充時間：2026-10-26，UTC+08:00。STALE-103 的基準 as-of 17:20:11.400，擷取 17:20:11.402；事件處理後快照 as-of 17:20:11.519，擷取 17:20:11.523。兩種時間分開記，全部為虛構。'),
 ('證據識別','DEMO-EV-INPUT、DEMO-EV-BEFORE、DEMO-EV-AFTER 表示每個 Case／資料列／attempt 的輸入、完整前後快照；僅為教學識別，無附件。失敗位置 CP2～CP3。'),
 ('覆核與缺陷','無真人結果覆核。TC-MDQ-017 連至 <a href="bug-report-template.html#DEF-MDQ-004">DEF-MDQ-004</a>；沒有修復後 Run。')]))
run_body+=section('coverage','同一批次的逐案紀錄',table(['Case／版本／資料列','合成 Actual Result','Status／耗時'],[(f'<a href="test-case-template.html#{case}">{case} v1.2</a><br>{row}／attempt 1',actual,f'{status}（示意）／{duration}s') for case,row,status,duration,actual in RESULTS])+ '<p>三案各自使用隔離資料，舊事件失敗不污染另外兩案。耗時沿用本站合成示例，不是 SLA 或效能量測。未開始記 Not Run；缺必要前提記 Blocked；明確不做記 Skipped 並附理由。整輪判定見 <a href="quality-report.html#sample">品質報告</a>。</p>')

selected=len(RESULTS)
passed=sum(r[2]=='Pass' for r in RESULTS)
failed=sum(r[2]=='Fail' for r in RESULTS)
completed=passed+failed
open_s1=1
summary='Blocked' if open_s1 else ('Unknown' if completed < selected else 'Ready')
quality_body=section('purpose','這份文件回答什麼','<div class="intro"><p>把已知問題、執行完整性、結束條件判定與未測部分分開交代。結果引用 <a href="run-log.html#sample">Run Log</a>；總結論由證據推導。</p></div>')
quality_body+=section('blank','空白範本',blank(quality_blank))
quality_body+=section('sample','填寫示例：全部執行仍未結束條件',f'<div class="panel"><h3>DEMO-QUALITY-MDQ · v1.2</h3><p>範圍：DEMO-SPEC-MDQ v1.2 的三個 Order Book 合成案例。截止時間為示意 2026-10-26 17:30 UTC+08:00；產品 build-demo-1，契約 DEMO-DC-MDQ v1.0。</p></div>'+table(['面向','本輪內容'],[
 ('已知問題','<a href="bug-report-template.html#DEF-MDQ-004">DEF-MDQ-004</a>：舊序號覆寫，S1 · Triaged · demo，未修復；無風險接受核准。'),
 ('執行完整性',f'選定 {selected} 案，{passed} Pass、{failed} Fail；完成率 ({passed}+{failed})/{selected} = {completed}/{selected} = 100%。Not Run／Blocked／Skipped 均為 0（合成）。完成率不是通過率。選定為 0 時應顯示 N/A。'),
 ('結束條件判定','條件 1：合成情境內三案必要步驟與檢查點已完成；真實當前證據未提供。條件 2：未達，仍有未解決 S1。條件 3：合成追溯鏈完整，無未解釋缺口。整輪不符合結束條件。'),
 ('未測部分','相同序號、跳號、亂序緩衝、零數量、缺值、壓力、真實 feed 與下單均未測。由產品／介接窗口確認規格，再按風險安排；不納入本輪三案分母。'),
 ('覆核／限制','所有結果是教學填寫；沒有真實產品執行、真人驗收或上線核准。文件 v1.2 沒有改變本站歷史 Run。')])+f'<div class="summary"><strong>推導摘要（僅示例）：{summary}</strong><p>雖然三案完成率 100%，仍有 {open_s1} 筆未解決 S1。安排修正與新 Run 後再評估；本頁不填獨立的總結論欄位，也不表示真實產品的當前狀態。</p></div><p>Ready 僅表示約定測試交付條件達成；Go 仍需當前證據與有權人決定。修復宣稱及尚未發生的 rerun 都不能自動放行。</p>')

index_body=section('blank','從需要的文件開始','<div class="intro"><p>以「舊序號 103 覆寫最新 104」為例，從規格一路追到 Run、缺陷與品質報告。先閱讀填寫示例，再複製相同頁面的空白範本到案件文件；九份文件與本入口都是靜態閱讀資料，中英文各十頁。</p></div>'+table(['文件','負責內容','入口'],[
 ('00 QA Test Request','決策問題、subject、範圍、授權與缺項。','<a href="qa-test-request.html#sample">看示例</a> · <a href="qa-test-request.html#blank">空白範本</a>'),
 ('01 Quality Risk Assessment','風險、測試深度與剩餘問題。','<a href="quality-risk-assessment.html#sample">看示例</a> · <a href="quality-risk-assessment.html#blank">空白範本</a>'),
 ('02 Test Specification','來源、範圍、風險、判準、共用資料契約。','<a href="test-spec-template.html#sample">看示例</a> · <a href="test-spec-template.html#blank">空白範本</a>'),
 ('03 Test Scenario','情境、資料分區、案例優先與追溯。','<a href="test-scenario-template.html#sample">看示例</a> · <a href="test-scenario-template.html#blank">空白範本</a>'),
 ('04 Test Case','具體輸入、步驟、預期與檢查點。','<a href="test-case-template.html#sample">看示例</a> · <a href="test-case-template.html#blank">空白範本</a>'),
 ('05 Test Run Record','各次執行的實際結果與證據。','<a href="run-log.html#sample">看示例</a> · <a href="run-log.html#blank">空白範本</a>'),
 ('06 Defect Report','預期／實際差異、影響、分級、重測。','<a href="bug-report-template.html#sample">看示例</a> · <a href="bug-report-template.html#blank">空白範本</a>'),
 ('07 Release Quality Summary','已知問題、完成程度、結束條件與未測部分。','<a href="quality-report.html#sample">看示例</a> · <a href="quality-report.html#blank">空白範本</a>'),
 ('08 Dashboard Status Contract','由核准摘要產生唯讀公開狀態。','<a href="dashboard-status-contract.html#sample">看示例</a> · <a href="dashboard-status-contract.html#blank">空白範本</a>')]))
index_body+=section('sample','文件如何追溯','<p class="flow">DEMO-SPEC-MDQ v1.2 / DEMO-DC-MDQ v1.0\n  DEMO-REQ-STALE ↔ RISK-OB-SEQ\n    DEMO-SC-BOOK → TC-MDQ-017 v1.2\n      DEMO-RUN-FAIL-001 → DEF-MDQ-004\n        DEMO-QUALITY-MDQ：Blocked（合成）</p><p><a href="test-spec-template.html#risk">追溯表</a> 往下連到案例與缺陷；<a href="bug-report-template.html#sample">缺陷</a> 也能回查失敗檢查點與 Run。</p>')
index_body+=section('use','套用到自己的案件','<ol class="steps"><li>複製 <a href="test-spec-template.html#blank">空白規格</a>，填入實際來源與版本。</li><li>依目標產品重建資料、單位、時序、預期值、停止條件及證據。保留文件責任與追溯方法，不能只換產品名稱。</li><li>依 <a href="test-case-template.html#blank">Case 範本</a> 寫出可判定的檢查點；取得必要核准後才操作產品。</li><li>把當次結果記入新的 <a href="run-log.html#blank">Run</a>，保留歷史紀錄；由 <a href="quality-report.html#blank">品質報告</a> 推導整輪狀態。</li></ol>')
index_body+=section('confirm','實案仍須確認的條件','<p>行情協定、帳號／資料權限、完成訊號、時限、AI 使用、證據保存及結束條件，見 <a href="test-spec-template.html#questions">待確認問題</a>。相同序號與跳號尚未定義；不要把教學假設當成交易所規則。</p><p>這組空白範本與方法源自公司範本；v1.3 已補齊 00～08 九份文件的中英文閱讀版，沿用本站 Order Book 情境。原始專案範本保持原樣；九份 Markdown 是正式撰寫庫。QA-Lite 維持 brief/design、run ledger、decision 三份紀錄；HTML 供閱讀與複製欄位，不新增狀態帳本。</p>')


request_blank="""〔必填〕Request ID／版本、文件狀態：[ ]
〔必填〕Requester／QA owner、提出與預計決定時間：[ ]
〔必填〕決策問題、業務目標、受影響使用者／資產與現在要決定的原因：[ ]
〔必填〕Repository／release／branch／candidate full SHA：[ ]
〔必填〕變更摘要、測試範圍、明確不測範圍：[ ]
〔必填〕已知風險／缺陷／依賴／假設及證據：[ ]
〔必填〕環境／平台、資料與存取條件：[ ]
〔必填〕可用需求／設計、Issue／PR、Runbook、既有測試證據：[ ]
〔必填〕時間、人力、環境與其他限制：[ ]
〔必填〕公開分類、遮蔽要求、禁止欄位：[ ]
〔必填〕Intake：accepted／needs-information／rejected；風險層級、缺項、負責人／審閱時間：[ ]
〔必填〕問題表：Q ID｜來源／版本｜問題｜責任人｜影響 ID｜回答來源／日期｜新判準／重評：[ ]
〔必填〕帳號／操作與額度、AI 服務／資料外傳、保存／清理授權：[ ]
Unknown 不代表允許；問題回答後重評受影響項目，保留歷史結果。"""
request_body=section('purpose','這份文件回答什麼','<div class="intro"><p>00 Test Request 鎖定要測什麼、為何要測及誰能決定。資訊不足時維持 needs-information；需求尚未確認，不能直接排成可執行測試。</p></div>')
request_body+=section('blank','空白範本',blank(request_blank))
request_body+=section('sample','填寫示例：行情順序測試申請',table(['欄位','合成示例'],[
 ('Request／責任','<span id="DEMO-REQUEST-MDQ">DEMO-REQUEST-MDQ v1.3</span>；DEMO-REQUESTER／DEMO-QA（虛構角色）；提出日 2026-10-26，預計決定時間未定。'),
 ('決策問題','針對舊序號更新可能覆寫最新狀態，哪些行情測試需要執行、什麼條件才可進入 release review？目標是避免下游讀到倒退的 Order Book；沒有真實下單或損失主張。'),
 ('Subject／變更','教學 subject DEMO-BOOK／build-demo-1；真實目標 repo、branch、candidate SHA 與實際程式變更均 Unknown，不能拿本網站 SHA 冒充受測產品版本。'),
 ('範圍／排除','納入連續更新、舊事件拒絕、重連快照；排除真實 feed、下單、成交、資產及壓力。'),
 ('已知資料／來源','本站合成 TC-MDQ-016～018、DEF-MDQ-004 提供教材；實案的官方行情規格、Issue／PR、操作 Runbook、版本與有效測試證據均待提供。'),
 ('風險／依賴','<a href="quality-risk-assessment.html#RISK-OB-SEQ">RISK-OB-SEQ</a>；依賴隔離 fixture、序號判準、完成訊號及快照存取。'),
 ('限制／授權','本示例只讀合成資料，不連外部服務；真實帳號、操作額度、AI 服務／可讀資料、證據存放／期限與清理均待核定。人力與實際交付時間未承諾。'),
 ('公開／Intake','教材可公開；禁止加入帳號、憑證、私有資料、內部連結。真實測試申請為 needs-information，風險層級 Unknown；尚無真人接受或審閱。')]))
request_body+=section('questions','待確認與接續','<p><a href="test-spec-template.html#DEMO-Q-SEQ">DEMO-Q-SEQ</a> 由產品／介接窗口確認行情協定、時序與完成訊號；影響三案及 DEMO-DC-MDQ。另確認真實 subject、資料授權、決定日期與責任人。回答需附來源版本及日期，再交 <a href="quality-risk-assessment.html#sample">風險評估</a> 與 <a href="test-spec-template.html#sample">Test Spec</a> 重評；已有 Run 維持原判準版本。</p>')

risk_blank="""〔必填〕Assessment ID／版本、subject、QA owner、reviewer／時間：[ ]
〔必填〕Repository／release／branch／candidate full SHA、風險層級：[ ]
〔必填〕風險表：Risk ID｜Product Area｜風險敘述｜失效模式／觸發｜使用者／資產｜Impact｜Likelihood／uncertainty｜Detectability｜Recoverability｜既有控制與證據｜Target coverage｜測試回應｜Owner｜Residual risk｜接受人｜重評日期
〔必填〕未知／假設：ID｜類型｜敘述｜決策影響｜Owner｜期限｜處置
〔條件式〕觸發表：複雜／敏感資料、跨服務／權限、資安／隱私、無障礙／相容性、migration／正式環境變更；適用 yes／no／unknown、需要的補充、Owner／連結
〔必填〕審閱：關鍵區域有 target coverage、未處置風險有安排、是否需獨立覆核、approved／changes-required／blocked、備註
〔必填〕追溯：Requirement／版本 ↔ Risk ↔ Scenario／版本 ↔ Case／版本 ↔ Run／Defect；缺口／Owner／恢復條件
Unknown 不填成 Low；Severity、案例 Priority 與風險排序分開；此表不另維護 Pass／Fail。"""
risk_body=section('purpose','這份文件回答什麼','<div class="intro"><p>01 Risk Assessment 先確定失效影響與所需測試深度，再安排案例。coverage 是測試深度，值為 0、1、1+、2、2+、3；不代表程式覆蓋百分比。</p></div>')
risk_body+=section('blank','空白範本',blank(risk_blank))
risk_body+=section('sample','填寫示例：舊行情覆寫風險','<div class="panel" id="RISK-OB-SEQ"><h3>RISK-OB-SEQ／DEMO-RISK-ASSESSMENT v1.3</h3><p>來源 <a href="qa-test-request.html#DEMO-REQUEST-MDQ">DEMO-REQUEST-MDQ</a>；subject DEMO-BOOK／build-demo-1，真實版本與風險層級 Unknown；QA owner DEMO-QA，尚無真人 reviewer／審閱時間。</p></div>'+table(['評估面向','合成示例'],[
 ('失效／影響','已更新至 104 後接受舊事件 103，Order Book 倒退，下游行情判斷可能受影響。影響高為教學建議；沒有真實發生機率或損失證據。'),
 ('可能性／可偵測性／復原','可能性 Unknown；若能保留事件與前後快照，合成情境可偵測，實際監控能力 Unknown。重連快照可作候選復原路徑，真實復原保證未驗。'),
 ('控制／Target','控制要求是拒絕舊事件與重連後完整載入；僅有合成示例。教學建議 target coverage=2，須覆核；不宣稱實際深度已達標。'),
 ('測試回應','<a href="test-case-template.html#TC-MDQ-017">TC-MDQ-017</a> 查舊事件拒絕；016 保護正常更新；018 查重連。三案皆引用 DEMO-DC-MDQ v1.0。'),
 ('剩餘風險／接受','相同序號、跳號、亂序、真實負載未涵蓋。DEMO-QA 追蹤；接受人與重評日期待定，沒有風險接受核准。'),
 ('未知／觸發','DEMO-Q-SEQ 影響 oracle、資料與回歸範圍，產品／介接窗口待答、期限未定。合成教材無敏感資料／正式變更；真實案的五類條件式觸發均 Unknown，先確認再選補充文件。'),
 ('審閱／接續','真實範圍仍 blocked；關鍵區域 target 及未處置風險安排待審，是否需獨立覆核待決。規則新解讀回判準，新失效模式回風險；依 <a href="test-spec-template.html#questions">恢復規則</a> 追加必要 Run。')]))
risk_body+=section('trace','追溯與分級','<p>DEMO-REQ-STALE ↔ RISK-OB-SEQ ↔ DEMO-SC-BOOK ↔ TC-MDQ-017 v1.2 ↔ <a href="run-log.html#DEMO-RUN-FAIL-001">DEMO-RUN-FAIL-001</a> ↔ <a href="bug-report-template.html#DEF-MDQ-004">DEF-MDQ-004</a>。詳表見 <a href="test-spec-template.html#risk">Test Spec</a>。</p><p>此處記風險與深度建議；案例 P0 是執行順序，缺陷 S1 是對已觀察影響的分級建議。三者不可機械換算，接受風險也不能代替關鍵路徑證據。</p>')

status_blank="""〔必填〕Assessment source／版本、contractVersion、schema、exporter／policy／publisher workflow 版本與 SHA：[ ]
〔必填〕公開 subject：repository／release／branch／fullSha；objective、environment、testedScope、excludedScope：[ ]
〔必填〕核准的 releaseAssessment：status／rationale／decidedAt／expiresAt／qaOwner／reviewer／decisionOwner：[ ]
〔必填〕summary：effortLevel／coverage／quality／comment：[ ]
〔必填〕productAreas：id／name／effortLevel／executionState／coverage／targetCoverage／quality／comment／evidenceLinks：[ ]
〔必填〕gates：id／title／note／state；runs：runId／executedAt／evidenceUrl：[ ]
〔必填〕provenance：generatedAt／syncedAt／sourceSha；dataStatus／publicDisclosure：[ ]
〔必填〕檢查：subject 相符、來源授權、schema／版本、時效、阻斷／waiver、allowlist／連結、祕密／PII、atomic manifest／last-known-good：[ ]
〔必填〕公開覆核人／結果／時間、允許與禁止欄位：[ ]
〔必填〕發布與修正：產生／同步時間、manifest／hash、last-known-good、修正／撤回程序、rollback owner、發布後 smoke 證據：[ ]
由核准的 07 產生唯讀投影，不另填第二份決策；無核准不輸出可發布 snapshot。"""
status_body=section('purpose','這份文件回答什麼','<div class="intro"><p>08 Dashboard Status Contract 規定如何把已核准的 07 Release Quality Summary 投影成公開狀態。Run 保存執行，07 保存判斷，08 定義可公開的欄位及驗證方式。</p></div>')
status_body+=section('blank','空白範本',blank(status_blank))
status_body+=section('sample','填寫示例：Blocked 的投影規劃',table(['欄位','合成示例'],[
 ('來源／版本','<a href="quality-report.html#sample">DEMO-QUALITY-MDQ v1.2</a>；contractVersion 1.0.0；schema/test-status.schema.json；current policy 2.1.0。exporter／publisher SHA 待填，沒有核准來源。'),
 ('Subject／範圍','DEMO-BOOK／build-demo-1；真實 repository／branch／fullSha Unknown。三案與未測範圍引用 07；不填假的 full SHA，不產出可發布 JSON。'),
 ('產品狀態／理由','教學推導 Blocked：DEF-MDQ-004 是未解決 S1，且 TC-MDQ-017 有合成 Fail。QA／reviewer／decision owner、decidedAt／expiresAt 尚未核准；不是正式 release assessment。'),
 ('資料狀態','正式 snapshot 尚未設定，閱讀標籤 Not Configured。沒有真實同步或時效證據，不能把教材日期當 Fresh。'),
 ('Summary／Product Area','教學區域 Order Book：quality=bad，executionState=complete（合成三案已完成）；coverage／effort 未核定，不由 100% 完成率推定。comment 指向合成 S1；正式 evidenceLinks 待核准。'),
 ('Gates／Runs／provenance','G3／G6 未有正式證據或核准；教材 Run 引用 <a href="run-log.html#DEMO-RUN-FAIL-001">DEMO-RUN-FAIL-001</a>，不得冒充真實執行。generatedAt／syncedAt／sourceSha 未產生。'),
 ('公開檢查／發布','只含合成 ID、教學假設及角色；真實 schema／subject／時效／授權驗證尚未執行。publicDisclosure、公開 reviewer／時間、manifest／hash、last-known-good、rollback owner 與 smoke 證據皆待實案提供；本頁沒有發布。')]))
status_body+=section('rules','產品狀態與資料狀態分開',table(['狀態','判定'],[
 ('Blocked','可信且同版本的未解決 S1、未接受 S2 或關鍵路徑不符合；證據過期仍保留已知問題，另列資料不足。'),
 ('At Risk','沒有阻斷問題，但仍有剩餘缺陷或已接受風險；記責任與後續，不等於准許發布。'),
 ('Unknown','沒有可信的已知阻斷或剩餘問題，但判準、證據或覆核不足；損毀／subject 不符資料不能建立產品事實。'),
 ('Ready','四面向均支持測試交付、沒有已知剩餘缺陷／接受風險，且有 human-owned assessment；實際發布另需 Go。歷史 Ready 不代表目前核准。'),
 ('Data Status','Fresh／Stale／Invalid／Not Configured／Unreachable 說明來源可用性；不能直接推論產品好壞，也不是即時監控。')]))
status_body+=section('recovery','修正與恢復','<p>來源改版先比對受影響案例，新增必要 Run 與覆核；資料不合法時保留 last-known-good 並標失敗，不改寫舊 snapshot。修正、撤回、rollback 與發布後驗證由原責任流程處理；發送、發布或上線仍須授權。三種異常處理見 <a href="test-spec-template.html#questions">來源改版、覆核分歧與 AI 誤判</a>。</p>')

PAGES={
 'qa-test-request.html':page('qa-test-request.html','00 QA Test Request','測試申請｜範圍、決策問題與授權',request_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('questions','待確認與接續')]),
 'quality-risk-assessment.html':page('quality-risk-assessment.html','01 Quality Risk Assessment','風險評估｜影響、未知與測試深度',risk_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('trace','追溯與分級')]),
 'dashboard-status-contract.html':page('dashboard-status-contract.html','08 Dashboard Status Contract','公開投影｜來源、狀態與發布邊界',status_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('rules','狀態規則'),('recovery','修正與恢復')]),
 'index.html':page('index.html','QA 文件範本與示例','用 Order Book 合成失敗案例練習文件追溯。',index_body,[('blank','文件入口'),('sample','文件關係'),('use','如何套用'),('confirm','需要確認')]),
 'test-spec-template.html':page('test-spec-template.html','Test Specification','測試規格｜來源、範圍、風險與執行依據',spec_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('contract','資料契約'),('risk','風險與追溯'),('questions','問題影響'),('gates','關卡與結束條件')]),
 'test-scenario-template.html':page('test-scenario-template.html','Test Scenario','測試情境｜行情流程與獨立案例',scenario_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('boundaries','資料與邊界'),('trace','執行追溯')]),
 'test-case-template.html':page('test-case-template.html','Test Case','測試案例｜步驟、資料、預期與獨立 Run',case_body,[('purpose','用途'),('blank','空白範本'),('sample','完整案例'),('other-cases','其他條件'),('records','執行紀錄入口')]),
 'bug-report-template.html':page('bug-report-template.html','Bug Report','缺陷回報｜序號覆寫、影響與處置',bug_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('severity','分級與狀態'),('retest','重測與回歸'),('reports','相關紀錄')]),
 'run-log.html':page('run-log.html','Run Log','執行紀錄｜三案各自保留實際觀察',run_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例'),('coverage','逐案結果')]),
 'quality-report.html':page('quality-report.html','品質報告','整輪結果｜完成率 100% 仍有 S1',quality_body,[('purpose','用途'),('blank','空白範本'),('sample','填寫示例')]),
}


class EnglishPage(HTMLParser):
    """Translate visible text and labels without changing IDs or document structure."""
    def __init__(self, translations):
        super().__init__(convert_charrefs=True)
        self.translations = translations
        self.parts = []
        self.in_style = False
        self.language_link = False

    def translate(self, value):
        if re.search('[\u3400-\u9fff]', value):
            if value not in self.translations:
                raise ValueError('Missing English translation: ' + value[:100])
            return self.translations[value]
        return value.replace('。', '.').replace('／', ' / ').replace('；', ';').replace('：', ':')

    def handle_decl(self, decl):
        self.parts.append('<!' + decl + '>')

    def handle_starttag(self, tag, attrs):
        self.in_style = tag == 'style' or self.in_style
        self.language_link = tag == 'a' and dict(attrs).get('class') == 'language-switch'
        translated = []
        for key, value in attrs:
            if value is None:
                translated.append(key)
                continue
            if key in ('aria-label', 'data-label', 'title'):
                value = self.translate(value)
            elif tag == 'html' and key == 'lang':
                value = 'en'
            elif self.language_link and key in ('lang', 'hreflang'):
                value = 'zh-Hant-TW'
            elif key == 'href':
                value = value.replace('.en.html', '.html') if self.language_link else value.replace('.html', '.en.html')
            translated.append(key + '="' + escape(value, quote=True) + '"')
        self.parts.append('<' + tag + (' ' if translated else '') + ' '.join(translated) + '>')

    def handle_endtag(self, tag):
        self.parts.append('</' + tag + '>')
        if tag == 'style':
            self.in_style = False
        if tag == 'a':
            self.language_link = False

    def handle_data(self, value):
        if self.in_style:
            self.parts.append(value)
        else:
            self.parts.append(escape('繁體中文' if self.language_link else self.translate(value)))


def bilingual_pages(chinese_pages, translations):
    result = dict(chinese_pages)
    for name, html in chinese_pages.items():
        translated = EnglishPage(translations)
        translated.feed(html)
        result[name.replace('.html', '.en.html')] = ''.join(translated.parts)
    return result

PAGES = bilingual_pages(PAGES, json.loads(Path(__file__).with_name('translations_en.json').read_text(encoding='utf-8')))

class Check(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.hrefs=[];self.external=[];self.tags=set()
    def handle_starttag(self, tag, attrs):
        a=dict(attrs);self.tags.add(tag)
        if 'id' in a:self.ids.append(a['id'])
        if 'href' in a:self.hrefs.append(a['href'])
        for k in ['src','href']:
            if a.get(k,'').startswith(('https://','http://','//')):self.external.append(a[k])

if __name__=='__main__':
    ROOT.mkdir(parents=True, exist_ok=True)
    parsed={}
    for name in PAGES:
        c=Check();c.feed(PAGES[name]);parsed[name]=c
        assert len(c.ids)==len(set(c.ids)), (name,'duplicate IDs')
        assert not c.external,(name,'external dependency')
        allowed=set('html head meta title style body a aside strong nav p br details summary main header div button footer section h1 h2 h3 pre table thead tbody tr th td span ol ul li'.split())
        assert not c.tags-allowed,(name,'unexpected HTML tag',c.tags-allowed)
        assert ('not a real exchange test' if name.endswith('.en.html') else '非真實交易所實測') in PAGES[name]
        assert 'id="blank"' in PAGES[name] and 'id="sample"' in PAGES[name]
    count=0
    for name,c in parsed.items():
        for href in c.hrefs:
            target,_,anchor=href.partition('#');target=unquote(target) or name
            assert target in parsed,(name,href,'missing file')
            assert not anchor or unquote(anchor) in parsed[target].ids,(name,href,'missing anchor')
            count+=1
    for name,html in PAGES.items():
        (ROOT/name).write_text(html,encoding='utf-8',newline='\n')
    result={'files':list(PAGES),'staticLinksChecked':count,'duplicateIds':0,'externalDependencies':0,'syntheticExamplesOnly':True,'browserAndPrintVerified':False}
    print(json.dumps(result,ensure_ascii=False))
