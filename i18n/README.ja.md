[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*合法な選択肢と根拠を確認し、1つの行動だけを明示的に確定します。*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker は、完全なヘッズアップ Texas Hold’em 1ハンドと、範囲を明示した Contract Bridge／Guandan 入門テーブルをローカルで学べる意思決定教材です。決定論的コードがルール、情報の秘匿、得点、履歴、永続化を担当します。

## オープンな教育ツールをサポート

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## アプリのプレビュー

[![アプリケーションのスクリーンショット](../docs/images/app.png)](../docs/images/app.png)

学習テーブルでは、合法な選択肢、状態を変えないプレビュー、正確な事実、計算根拠、著者による原則を明確に分けて表示します。

## プレイ可能なものは何ですか

- Texas Hold’em: ブラインド、4 つのベッティング ストリート、オールイン プレイ、フォールド、ショーダウン評価、ポット決済を備えた完全なヘッズアップ ノーリミット ハンド。
- Contract Bridge: スートフォロー、スペード固定切り札、トリックの勝者、パートナーとのタイミングを学ぶ5トリックの入門テーブル。ビッド、ダミー、コントラクト、デュプリケート得点は対象外です。
- Guandan: イニシアチブ、パス、パートナー認識のための 6 枚のカードのシングル専用の初心者テーブル。コンビネーション、ボム、トリビュート、レベルワイルドカード、プロモーションスコアはこのレッスンの対象外です。
- すべてのモードで同じ学習手順を使います。決定論的ルールエンジンが提示する合法な選択肢を調べ、状態を変えずにプレビューし、明示的に確定します。

## リポジトリマップ

| パス | 目的 |
| --- | --- |
| [`src/core/`](../src/core/) | 決定論的なカード、ルール、合法候補、状態遷移、情報の秘匿、評価、永続化。 |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | 安定したキーとプレースホルダーを備えた 11 個の完全な学習者向けカタログ。 |
| [`src/App.tsx`](../src/App.tsx) | 多言語の共通テーブル、プレビュー、確定、履歴、根拠表示のインターフェイス。 |
| [`docs/model-options.md`](../docs/model-options.md) | オプションのソルバーとモデルの選択と、その証拠と安全境界。 |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | 反復可能なブラウザレビュー手順。 |
| [`docs/images/app.png`](../docs/images/app.png) | 現在のアプリケーションのスクリーンショット。 |

## クイックスタート

Node.js `^20.19.0` または `>=22.12.0` と npm が必要です。

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Vite が表示したローカル URL を開きます。開発ポートは 8020 に固定されており、使用中なら別ポートへ移らず安全に失敗します。

## 正確性、プライバシー、根拠

- 公開画面では、表示前にデッキ順、シード、リクエスト記録、相手とパートナーの手札、非公開分析を隠します。
- 推測できない候補 ID は、正式な局面全体、行動者、正規アクションを結び付けます。古い候補や不明な選択は安全に拒否されます。
- プレビューは仮定であり、将来のコミュニティカードを明かしません。確定だけが状態を変更します。
- 厳密なルール、計算サンプル、著者による戦略は別々に表示します。ホールデムのエクイティは、合法な未見カードが一様に出ると仮定した値で、相手レンジの推定でも GTO の主張でもありません。

## 検証

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

テストは、決定論的な配牌、カードの一意性、得点とチップ保存、古い候補の拒否、ビューの情報秘匿、冪等な状態変更、永続化競合、状態を変えないプレビュー、ポート固定、11言語のキーとプレースホルダーの厳密な一致を対象にします。

## 引用

教育または研究で LazyPoker を使用する場合は、リポジトリを引用してください。 GitHub は [CITATION.cff](../CITATION.cff) を読み取り、「このリポジトリを引用」パネルを表示します。

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## 状態

Texas Hold’em は完全なヘッズアップ1ハンドです。Bridge と Guandan は初心者向け教材として明示され、競技ルールの完全実装を主張しません。任意のモデル連携は既定で無効です。
