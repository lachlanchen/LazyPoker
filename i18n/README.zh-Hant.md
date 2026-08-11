[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*檢視合法選擇與可靠證據，再明確確認一個動作。*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker 是一款本地優先的牌類決策教學工具，包含完整的單挑 Texas Hold’em 手牌，以及範圍明確的 Contract Bridge 和 Guandan 入門牌桌。確定性程式碼負責規則、資訊隱藏、計分、歷史與持久化。

## 支援開放教學工具

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 應用預覽

[![應用截圖](../docs/images/app.png)](../docs/images/app.png)

當前學習牌桌會清楚區分合法選擇、不改變狀態的預覽，以及精確事實、計算證據和編寫的策略原則。

## 什麼是可玩的

- Texas Hold’em：完整的單挑無限注手牌，包含盲注、四輪下注、全下、棄牌、攤牌牌型判定和底池結算。
- Contract Bridge：五墩入門牌桌，練習跟牌、固定黑桃將牌、贏墩和搭檔時機；叫牌、明手、定約和複式計分不在本課範圍內。
- Guandan：六張牌、僅限單張的入門牌桌，練習牌權與搭檔配合；組合牌型、炸彈、進貢、級牌百搭和升級計分不在本課範圍內。
- 所有模式都使用同一學習迴圈：檢視確定性規則引擎給出的合法候選動作，在不改變狀態的情況下預演，再明確確認。

## 倉庫結構

| 路徑 | 用途 |
| --- | --- |
| [`src/core/`](../src/core/) | 確定性的卡牌、規則、合法候選、狀態轉換、資訊隱藏、牌型評估和持久化。 |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | 十一個完整的面向學習者的目錄，具有穩定的鍵和佔位符。 |
| [`src/App.tsx`](../src/App.tsx) | 共享的多語言牌桌、預覽、確認、歷史和方法介面。 |
| [`docs/model-options.md`](../docs/model-options.md) | 可選的求解器和模型選擇及其證據和安全邊界。 |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | 可重複的瀏覽器稽核步驟。 |
| [`docs/images/app.png`](../docs/images/app.png) | 當前應用程式螢幕截圖。 |

## 快速啟動

需要 Node.js `^20.19.0` 或 `>=22.12.0`，以及 npm。

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

開啟 Vite 輸出的環回地址。開發埠固定為 8020；若埠已被佔用，應用會安全退出而不會改用其他埠。

## 權威、隱私和證據

- 公共檢視會在渲染前隱藏牌組順序、種子、請求記錄、對手與搭檔的手牌和私人分析。
- 不透明的候選 ID 會繫結完整的權威狀態、行動者和規範動作；過期或未知的選擇一律安全拒絕。
- 預覽只是假設，不會洩露未來的公共牌。只有確認才會改變狀態。
- 精確規則、計算樣本和編寫的策略會分開標註。德州撲克勝率假設合法未見牌均勻隨機；它不是對手範圍推斷，也不會冒充 GTO。

## 驗證

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

測試涵蓋確定性發牌、卡牌唯一性、計分和籌碼守恆、過期候選拒絕、檢視資訊隱藏、冪等狀態變更、持久化衝突、不改變狀態的預覽、固定連接埠，以及 11 種語言的鍵與佔位符嚴格一致性。

## 引用

如果您在教學或研究中使用 LazyPoker，請引用儲存庫。 GitHub 讀取 [CITATION.cff](../CITATION.cff) 並顯示“引用此儲存庫”面板。

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## 狀態

Texas Hold’em 模式提供完整的單挑一手牌。Bridge 和 Guandan 會明確標為初學者教學範圍，不聲稱完整實作競賽規則。可選模型預設停用。
