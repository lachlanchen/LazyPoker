[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://lazying.art)

# LazyPoker · Open Table

*Xem các lựa chọn hợp lệ và bằng chứng rõ ràng, rồi xác nhận đúng một hành động.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker là công cụ dạy quyết định ưu tiên chạy cục bộ cho một hand Texas Hold’em heads-up hoàn chỉnh và các bàn nhập môn Contract Bridge, Guandan có phạm vi rõ ràng. Mã tất định phụ trách luật, che giấu thông tin, tính điểm, lịch sử và lưu trữ.

## Hỗ trợ công cụ giảng dạy mở

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## Xem trước ứng dụng

[![Ảnh chụp màn hình ứng dụng](../docs/images/app.png)](../docs/images/app.png)

Bàn học cung cấp một công cụ quyết định gọn riêng cho từng trò, không dùng lớp “sức mạnh” chung:

- Hold’em dùng bản đồ mặt bài và mức giá cho cấu trúc công khai, equity từ bài thấy được, lá tiếp theo có thể cải thiện, giá call, stack hiệu dụng và mức cam kết của từng lựa chọn.
- Bridge dùng la bàn vòng ăn cho chất dẫn, chất chủ cố định, người đang thắng nhìn thấy, nghĩa vụ theo chất và chi phí hạng của lá xem trước.
- Guandan dùng hàng đợi quyền đi cho thứ tự phản hồi, ngưỡng chặn, lá lẻ chặn hợp lệ, số bài công khai của đội và chi phí giữ lá cao.

Mỗi lượt của người học đều có gợi ý biên soạn minh bạch. Rê chuột, focus hoặc chạm chỉ xem trước; nhấp phải hoặc `Esc` để xóa, và chỉ nút xác nhận mới thực hiện hành động.

## Có gì chơi được

- Texas Hold’em: một hand heads-up no-limit hoàn chỉnh với blind, bốn vòng cược, all-in, fold, đánh giá showdown và thanh toán pot.
- Contract Bridge: bàn nhập môn 5 vòng ăn để luyện theo chất, bích là chất chủ cố định, xác định người ăn vòng và phối hợp đồng đội; đấu giá, bài ngửa của dummy, hợp đồng và tính điểm duplicate nằm ngoài bài học.
- Guandan: bàn nhập môn 6 lá, chỉ đánh bài lẻ, để luyện quyền chủ động, bỏ lượt và phối hợp đồng đội; tổ hợp, bom, cống bài, bài cấp thay thế và tính điểm thăng hạng nằm ngoài bài học.
- Mọi chế độ dùng cùng một vòng học: xem lựa chọn hợp lệ do bộ máy luật tất định tạo ra, xem trước mà không đổi trạng thái rồi xác nhận rõ ràng.

## Bản đồ kho lưu trữ

| Đường dẫn | Mục đích |
| --- | --- |
| [`src/core/`](../src/core/) | Lá bài, luật, ứng viên hợp lệ, chuyển trạng thái, che giấu thông tin, đánh giá và lưu trữ tất định. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | Mười một danh mục hoàn chỉnh hướng tới người học với các khóa và phần giữ chỗ ổn định. |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | Bằng chứng quyết định Hold’em, Bridge và Guandan chỉ từ quan sát công khai. |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | Bản dịch theo ngữ cảnh cho ba công cụ phân tích riêng từng trò. |
| [`src/App.tsx`](../src/App.tsx) | Bàn chơi đa ngôn ngữ dùng chung, bản xem trước, xác nhận, lịch sử và giao diện phương pháp. |
| [`docs/model-options.md`](../docs/model-options.md) | Các lựa chọn mô hình và bộ giải tùy chọn cùng với các bằng chứng và ranh giới an toàn của chúng. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | Các bước xem xét trình duyệt lặp lại. |
| [`docs/images/app.png`](../docs/images/app.png) | Ảnh chụp màn hình ứng dụng hiện tại. |

## Bắt đầu nhanh

Yêu cầu Node.js `^20.19.0` hoặc `>=22.12.0`, cùng với npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Mở URL cục bộ do Vite hiển thị. Cổng phát triển được cố định ở 8020; nếu cổng đang bận, ứng dụng dừng an toàn thay vì đổi sang cổng khác.

## Quyền hạn, quyền riêng tư và bằng chứng

- Chế độ xem công khai che thứ tự bộ bài, seed, nhật ký request, bài của đối thủ và đồng đội, cùng phân tích riêng trước khi hiển thị.
- ID ứng viên không thể đoán gắn với toàn bộ trạng thái chuẩn, người hành động và hành động chính thức; lựa chọn cũ hoặc không xác định bị từ chối an toàn.
- Bản xem trước chỉ là giả định và không bao giờ tiết lộ lá bài chung trong tương lai. Chỉ thao tác xác nhận mới thay đổi trạng thái.
- Luật chính xác, mẫu tính toán và chiến lược biên soạn luôn có nhãn riêng. Equity Hold’em giả định bài hợp lệ chưa thấy phân bố đồng đều; “lá cải thiện” chỉ nâng tay bài đã tạo nhìn thấy, không phải out chắc chắn thắng. Cả hai không đọc range đối thủ hay tự nhận là GTO.
- Bridge chỉ đọc tay người học và bài đã đánh; Guandan chỉ đọc tay người học, lá hiện tại, số bài công khai và hàng phản hồi. Chỉ thay trạng thái kín không làm đổi ý nghĩa phân tích.

## Xác minh

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Kiểm thử bao phủ chia bài tất định, lá duy nhất, điểm và bảo toàn chip, ứng viên cũ, che giấu và không can thiệp trạng thái kín, lượt agent mờ, idempotency, xung đột lưu, gợi ý, xem trước có thể xóa không đổi trạng thái, tính lại sau xác nhận, công cụ riêng từng trò, cổng cố định và đối chiếu nghiêm ngặt 11 danh mục.

## Trích dẫn

Nếu bạn sử dụng LazyPoker trong giảng dạy hoặc nghiên cứu, hãy trích dẫn kho lưu trữ. GitHub đọc [CITATION.cff](../CITATION.cff) và hiển thị bảng Trích dẫn kho lưu trữ này.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## Trạng thái

Chế độ Texas Hold’em là một hand heads-up hoàn chỉnh. Bridge và Guandan được ghi rõ là phạm vi dạy người mới, không phải tuyên bố đã triển khai đầy đủ luật thi đấu. Các mô hình tùy chọn bị tắt mặc định.
