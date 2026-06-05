# Trello Web (React + Vite)

## Kiểm thử

Tài liệu: [../docs/TEST_PLAN.md](../docs/TEST_PLAN.md) · Test cases: [../docs/TEST_CASES.md](../docs/TEST_CASES.md) · [Kỹ thuật kiểm thử](./docs/TESTING_TECHNIQUES_SUMMARY.md)

### Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm test` | Component tests (RTL), không cần browser |
| `npm run test:coverage` | Coverage component |
| `npm run test:e2e` | Selenium (cần Chrome + app chạy) |
| `npm run lint` | Static analysis |

### Component tests (React Testing Library)

- `src/tests/components/LoginForm.test.jsx`  
- `src/tests/components/Board.test.jsx`  
- `src/tests/components/Card.test.jsx`  

Black-box theo spec UI: render form, validation, trạng thái loading.

### Selenium E2E (khóa Coursera 4)

- `src/tests/selenium/trello.selenium.test.js`  
- Page Objects: `src/tests/selenium/pages/LoginPage.js`, `BoardPage.js`  
- `data-testid` trên LoginForm và board header  

**Chạy E2E:**

1. `cd ../Trello-api && npm run dev`  
2. `cd Trello-web && npm run dev`  
3. Trong terminal khác (user **đã verify email** trên DB dev):

```bash
cd Trello-web
E2E_TEST_EMAIL="you@example.com" \
E2E_TEST_PASSWORD="YourPass1" \
npm run test:e2e
```

Tuỳ chọn: `E2E_BASE_URL=http://localhost:5173` (mặc định).

Nếu thiếu `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`: test E2E tự **skip** (không fail).

**Lỗi ChromeDriver / Chrome version:** project dùng **Selenium Manager** (tự tải driver khớp Chrome trên máy). Sau khi pull code mới, chạy `npm install` trong `Trello-web`. Nếu vẫn lệch version: cập nhật Google Chrome lên bản mới nhất, hoặc xóa cache driver cũ rồi chạy lại `npm run test:e2e`.

### Env

- `VITE_API_BASE_URL` — trỏ tới API (xem `.env` / Vite config)  
- E2E dùng biến `E2E_*` riêng (không bắt buộc cho `npm test` RTL)
