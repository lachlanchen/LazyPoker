[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*가능한 선택과 근거를 살펴본 뒤, 정확히 한 가지 행동만 확정하세요.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker는 완전한 헤즈업 Texas Hold’em 한 핸드와 범위를 명확히 제한한 Contract Bridge·Guandan 입문 테이블을 로컬에서 배우는 의사결정 교사입니다. 결정론적 코드가 규칙, 정보 가림, 점수, 기록과 영속성을 담당합니다.

## 개방형 교육 도구 지원

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 앱 미리보기

[![애플리케이션 스크린샷](../docs/images/app.png)](../docs/images/app.png)

학습 테이블은 일반적인 “파워” 오버레이가 아니라 게임마다 고유한 간결한 의사결정 도구를 제공합니다.

- Hold’em은 보드·가격 지도로 공개 텍스처, 보이는 카드 에퀴티, 다음 카드 개선 후보, 콜 가격, 유효 스택, 후보별 투입을 보여 줍니다.
- Bridge는 트릭 나침반으로 선도 수트, 고정 트럼프, 보이는 현재 승자, 수트 팔로우 의무, 미리 본 카드의 랭크 비용을 보여 줍니다.
- Guandan은 주도권 대기열로 응답 순서, 기준, 합법적인 비터, 공개 팀 카드 수, 높은 카드의 비축 비용을 보여 줍니다.

자신의 모든 턴에 투명한 교육 제안이 나타납니다. 호버, 포커스, 탭은 상태 변경 없이 미리 보며, 오른쪽 클릭이나 `Esc`로 지우고 확인 버튼만 행동을 확정합니다.

## 플레이할 수 있는 내용

- Texas Hold’em: 블라인드, 4개의 베팅 스트리트, 올인 플레이, 폴드, 쇼다운 평가 및 팟 정산을 포함하는 완전한 헤즈업 무제한 핸드입니다.
- Contract Bridge: 수트 팔로우, 스페이드 고정 트럼프, 트릭 승자와 파트너십 타이밍을 익히는 5트릭 입문 테이블입니다. 비딩, 더미, 콘트랙트, 듀플리케이트 점수는 포함하지 않습니다.
- Guandan: 주도권, 패스 및 파트너 인식을 위한 6카드, 싱글 전용 초보자 테이블. 조합, 폭탄, 공물, 레벨 와일드카드, 승격 점수는 이 강의에서 다루지 않습니다.
- 모든 모드는 같은 학습 순서를 사용합니다. 결정론적 규칙 엔진이 만든 합법적 선택지를 살펴보고, 상태를 바꾸지 않고 미리 본 뒤 명시적으로 확정합니다.

## 저장소 지도

| 경로 | 용도 |
| --- | --- |
| [`src/core/`](../src/core/) | 결정론적 카드, 규칙, 가능한 후보, 상태 전환, 정보 가림, 평가 및 영속성. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | 안정적인 키와 자리 표시자가 포함된 11개의 완전한 학습자용 카탈로그. |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | 공개 관측만으로 만든 Hold’em·Bridge·Guandan 의사결정 근거. |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | 세 게임별 분석 도구의 문맥 번역. |
| [`src/App.tsx`](../src/App.tsx) | 공유 다국어 테이블, 미리보기, 확인, 기록 및 분석법 인터페이스. |
| [`docs/model-options.md`](../docs/model-options.md) | 증거 및 안전 경계가 포함된 선택적 솔버 및 모델 선택. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | 반복 가능한 브라우저 검토 단계. |
| [`docs/images/app.png`](../docs/images/app.png) | 현재 애플리케이션 스크린샷. |

## 빠른 시작

Node.js `^20.19.0` 또는 `>=22.12.0`과 npm이 필요합니다.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Vite가 표시한 로컬 URL을 여세요. 개발 포트는 8020으로 고정되며, 사용 중이면 다른 포트로 바꾸지 않고 안전하게 실패합니다.

## 정확성, 개인정보 보호 및 근거

- 공개 화면은 표시 전에 덱 순서, 시드, 요청 기록, 상대와 파트너의 카드, 비공개 분석을 숨깁니다.
- 추측할 수 없는 후보 ID는 공식 상태 전체, 행동자, 정식 행동을 묶습니다. 오래되거나 알 수 없는 선택은 안전하게 거부됩니다.
- 미리보기는 가정일 뿐이며 앞으로 나올 커뮤니티 카드를 공개하지 않습니다. 확정만 상태를 변경합니다.
- 정확한 규칙, 계산된 표본, 작성된 전략은 따로 표시됩니다. Hold’em 에퀴티는 합법적인 미지 카드가 균등하다고 가정하며, “개선 카드”는 보이는 완성 핸드만 개선할 뿐 승리를 보장하는 아웃이 아닙니다. 둘 다 상대 레인지 판독이나 GTO 주장으로 제시하지 않습니다.
- Bridge 분석은 내 손과 이미 나온 카드만, Guandan 분석은 내 손·현재 싱글·공개 카드 수·응답 대기열만 읽습니다. 숨은 상태만 바꿔도 의미 분석은 그대로입니다.

## 검증

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

테스트는 결정론적 딜, 카드 고유성, 점수와 칩 보존, 오래된 후보, 가림과 숨은 상태 비간섭, 불투명 에이전트 턴, 멱등성, 저장 충돌, 제안, 지울 수 있는 비변경 미리보기, 확정 후 재계산, 게임별 도구, 포트 고정, 11개 언어 카탈로그의 엄격한 일치를 확인합니다.

## 인용

교육이나 연구에 LazyPoker를 사용하는 경우 저장소를 인용하세요. GitHub는 [CITATION.cff](../CITATION.cff)를 읽고 이 저장소 인용 패널을 표시합니다.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## 상태

Texas Hold’em은 완전한 헤즈업 한 핸드입니다. Bridge와 Guandan은 초보자용 교육 범위로 명시하며, 완전한 대회 규칙 구현을 주장하지 않습니다. 선택적 모델 연동은 기본으로 꺼져 있습니다.
