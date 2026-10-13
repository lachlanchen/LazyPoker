[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner — apps and four buddies](https://github.com/lachlanchen/LazyingArtWebsite/raw/main/media/brand/lazyingart-intro.gif)](https://lazying.art)

# LazyPoker · Open Table

*查看合法选择与可靠证据，再明确确认一个动作。*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker 是一款本地优先的牌类决策教学工具，包含完整的单挑 Texas Hold’em 手牌，以及范围明确的 Contract Bridge 和 Guandan 入门牌桌。确定性代码负责规则、信息隐藏、计分、历史与持久化。

## 支持开放教学工具

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 应用预览

[![应用截图](../docs/images/app.png)](../docs/images/app.png)

学习牌桌不使用笼统的“力量”覆盖层，而是为每种游戏提供紧凑的专用决策仪表：

- Hold’em 使用牌面与价格图，展示公共牌结构、可见牌权益、可能改善成牌的下一张牌、跟注价格、有效筹码和各候选动作的投入。
- Bridge 使用一墩罗盘，展示首攻花色、固定将牌、可见领先者、跟花色义务和预演牌的点数成本。
- Guandan 使用牌权队列，展示响应顺序、压牌门槛、合法大单张、公开团队剩余张数和大牌保留成本。

每个己方回合都会显示透明的教学建议。悬停、键盘聚焦或轻触只会预演；右键或 `Esc` 可清除，只有确认按钮才会提交动作。

## 什么是可玩的

- Texas Hold’em：完整的单挑无限注手牌，包含盲注、四轮下注、全下、弃牌、摊牌牌型判定和底池结算。
- Contract Bridge：五墩入门牌桌，练习跟牌、固定黑桃将牌、赢墩和搭档时机；叫牌、明手、定约和复式计分不在本课范围内。
- Guandan：六张牌、仅限单张的入门牌桌，练习牌权与搭档配合；组合牌型、炸弹、进贡、级牌百搭和升级计分不在本课范围内。
- 所有模式都使用同一学习循环：查看确定性规则引擎给出的合法候选动作，在不改变状态的情况下预演，再明确确认。

## 仓库结构

| 路径 | 用途 |
| --- | --- |
| [`src/core/`](../src/core/) | 确定性的卡牌、规则、合法候选、状态转换、信息隐藏、牌型评估和持久化。 |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | 十一个完整的面向学习者的目录，具有稳定的键和占位符。 |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | 仅从公开观察生成 Hold’em、Bridge 与 Guandan 决策证据。 |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | 三种游戏专用分析仪表的上下文翻译。 |
| [`src/App.tsx`](../src/App.tsx) | 共享的多语言牌桌、预览、确认、历史和方法界面。 |
| [`docs/model-options.md`](../docs/model-options.md) | 可选的求解器和模型选择及其证据和安全边界。 |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | 可重复的浏览器审核步骤。 |
| [`docs/images/app.png`](../docs/images/app.png) | 当前应用程序屏幕截图。 |

## 快速启动

需要 Node.js `^20.19.0` 或 `>=22.12.0`，以及 npm。

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

打开 Vite 输出的环回地址。开发端口固定为 8020；若端口已被占用，应用会安全退出而不会改用其他端口。

## 权威、隐私和证据

- 公共视图会在渲染前隐藏牌组顺序、种子、请求记录、对手与搭档的手牌和私人分析。
- 不透明的候选 ID 会绑定完整的权威状态、行动者和规范动作；过期或未知的选择一律安全拒绝。
- 预览只是假设，不会泄露未来的公共牌。只有确认才会改变状态。
- 精确规则、计算样本和编写的策略会分开标注。Hold’em 权益假设合法未见牌均匀随机；“改善牌”只会改善当前可见成牌，并非保证获胜的出路。二者都不是对手范围推断，也不会冒充 GTO。
- Bridge 只读取学习者手牌与已经打出的牌；Guandan 只读取学习者手牌、当前单张、公开张数与响应队列。仅替换隐藏状态不会改变分析语义。

## 验证

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

测试涵盖确定性发牌、卡牌唯一性、计分和筹码守恒、过期候选、信息隐藏与隐藏状态非干扰、不透明代理回合、幂等变更、持久化冲突、建议、可清除且不改变状态的预演、确认后重算、游戏专用仪表、固定端口，以及十一种语言目录的严格一致性。

## 引用

如果您在教学或研究中使用 LazyPoker，请引用存储库。 GitHub 读取 [CITATION.cff](../CITATION.cff) 并显示“引用此存储库”面板。

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## 状态

Texas Hold’em 模式提供完整的单挑一手牌。Bridge 和 Guandan 会明确标为初学者教学范围，不声称完整实现竞赛规则。可选模型默认停用。
