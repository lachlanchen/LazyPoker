[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner — apps and four buddies](https://github.com/lachlanchen/LazyingArtWebsite/raw/main/media/brand/lazyingart-intro.gif)](https://lazying.art)

# LazyPoker · Open Table

*افحص الخيارات المسموح بها وأدلتها، ثم أكّد إجراءً واحدًا فقط.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker أداة تعليم قرارات تعمل محليًا ليد Texas Hold’em كاملة للاعبين، ولطاولتي Contract Bridge وGuandan تمهيديتين بحدود واضحة. يتولى الكود الحتمي القواعد وإخفاء المعلومات والتسجيل والتاريخ والحفظ.

## دعم أدوات التدريس المفتوحة

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## معاينة التطبيق

[![لقطة شاشة للتطبيق](../docs/images/app.png)](../docs/images/app.png)

تمنح طاولة التعلم كل لعبة أداة قرار مدمجة خاصة بها بدل عرض «قوة» عام:

- يستخدم Hold’em خريطة للوح والسعر تعرض بنية الأوراق العامة، والإكويتي من الأوراق الظاهرة، وتحسينات البطاقة التالية المحتملة، وسعر المجاراة، والرصيد الفعّال، والتزام كل مرشح.
- يستخدم Bridge بوصلة للّمة تعرض نوع الافتتاح، والحكم الثابت، والمتصدر الظاهر، ومسارات متابعة النوع، وكلفة رتبة البطاقة في المعاينة.
- يستخدم Guandan طابورًا للمبادرة يعرض ترتيب الرد، وحد التغلب، والأوراق المفردة القادرة على الرد، وأعداد أوراق الفريق العامة، وكلفة الاحتفاظ بالورقة العالية.

يعرض كل دور للمتعلم اقتراحًا تعليميًا شفافًا. تمرير المؤشر أو التركيز أو اللمس يعاينه بلا تغيير؛ النقر بالزر الأيمن أو `Esc` يمسحه، وزر التأكيد وحده يعتمد الإجراء.

## ما هو قابل للعب

- Texas Hold’em: يد كاملة بلا حد للاعبين، تشمل الرهانات العمياء وأربع جولات مراهنة والكل في والانسحاب وتقييم كشف الأوراق وتسوية مجموع الرهانات.
- Contract Bridge: طاولة مبتدئين من خمس لمّات لمتابعة النوع، مع السبيت ورقة رابحة ثابتة، وتحديد رابح اللمّة وتوقيت الشراكة؛ المزايدة واليد المكشوفة والعقود والتسجيل المكرر خارج هذا الدرس.
- Guandan: طاولة مبتدئين من ست أوراق وبأوراق مفردة فقط، لتعلّم المبادرة والتمرير والوعي بالشريك؛ التركيبات والقنابل والإكرام وأوراق المستوى البديلة وتسجيل الترقية خارج هذا الدرس.
- تستخدم جميع الأنماط دورة التعلم نفسها: افحص خيارًا قانونيًا يولّده محرك القواعد الحتمي، وعاين من دون تغيير الحالة، ثم أكّد صراحة.

## خريطة المستودع

| المسار | الغرض |
| --- | --- |
| [`src/core/`](../src/core/) | الأوراق والقواعد والمرشحون المسموح بهم وانتقالات الحالة وإخفاء المعلومات والتقييم والحفظ، وكلها حتمية. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | أحد عشر كتالوجًا كاملاً موجهًا للمتعلم مزودًا بمفاتيح ثابتة وعناصر نائبة. |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | أدلة قرار Hold’em وBridge وGuandan المشتقة من المشاهدة العامة فقط. |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | ترجمات سياقية لأدوات التحليل الثلاث الخاصة بكل لعبة. |
| [`src/App.tsx`](../src/App.tsx) | واجهة طاولة اللعب المشتركة متعددة اللغات، والمعاينة، والتأكيد، والسجل، وطريقة عرض الأدلة. |
| [`docs/model-options.md`](../docs/model-options.md) | الحلول الاختيارية والخيارات النموذجية مع الأدلة وحدود السلامة الخاصة بها. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | خطوات مراجعة المتصفح المتكررة. |
| [`docs/images/app.png`](../docs/images/app.png) | لقطة شاشة للتطبيق الحالي. |

## بداية سريعة

يتطلب Node.js `^20.19.0` أو `>=22.12.0`، بالإضافة إلى npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

افتح عنوان URL المحلي الذي يطبعه Vite. منفذ التطوير المضبوط هو 8020، وإذا كان مشغولًا يفشل وضع المنفذ الصارم بأمان بدل الانتقال إلى منفذ آخر.

## السلطة والخصوصية والأدلة

- تحجب المشاهدات العامة ترتيب حزمة الأوراق والبذور وسجل الطلبات وأوراق الخصوم والشريك والتحليل الخاص قبل العرض.
- تربط معرّفات المرشحين المبهمة الحالة المعتمدة الكاملة واللاعب والإجراء المحدد؛ وتُرفض الخيارات القديمة أو المجهولة بأمان.
- المعاينة افتراضية ولا تكشف أبدًا ورقة مشتركة مستقبلية. التأكيد وحده يغيّر الحالة.
- تبقى القواعد الدقيقة والعينات المحسوبة والاستراتيجية المكتوبة مصنفة كلٌّ على حدة. يفترض إكويتي Hold’em أوراقًا قانونية غير مرئية موزعة بالتساوي؛ وتحسينات البطاقة التالية تحسّن اليد الظاهرة وليست مخارج فوز مضمونة. لا تمثل أي منهما قراءة لنطاق الخصم أو ادعاء GTO.
- لا يقرأ تحليل Bridge إلا يد المتعلم والأوراق الملعوبة علنًا، ولا يقرأ تحليل Guandan إلا يد المتعلم والورقة الحالية والأعداد العامة وطابور الرد؛ وتبديل أي حالة مخفية لا يغيّر المعنى المعروض.

## تَحَقّق

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

تغطي الاختبارات التوزيع الحتمي، وتفرّد الأوراق، والتسجيل وحفظ الرقائق، ورفض المرشحين القدماء، وإخفاء المعلومات وعدم تأثر التحليل بالحالة المخفية، وأدوار الوكيل المبهمة، وتكرار الطلب بأمان، وتعارضات الحفظ، والاقتراحات، والمعاينات القابلة للمسح بلا تغيير، وإعادة الحساب بعد التأكيد، والأدوات الخاصة بكل لعبة، وتثبيت المنفذ، والتطابق الصارم بين اللغات الإحدى عشرة.

## الاقتباس

إذا كنت تستخدم LazyPoker في التدريس أو البحث، فاستشهد بالمستودع. يقرأ GitHub [CITATION.cff](../CITATION.cff) ويعرض لوحة Cite this repository.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## حالة

يعد وضع Texas Hold’em بمثابة يد كاملة. تظل Bridge وGuandan مصنفة بشكل واضح على أنها مجموعات فرعية لتعليم المبتدئين، وليست مطالبات بالتطبيقات التنافسية الكاملة. يتم تعطيل النماذج الاختيارية بشكل افتراضي.
