# FlightBooking Project

Ứng dụng đặt vé máy bay gồm 3 thành phần:

| Thư mục | Công nghệ | Ghi chú |
|---|---|---|
| `backend/` | Spring Boot 3 + MySQL + JWT | API server, cổng :8080 |
| `frontend-web/` | React 18 + Vite + Tailwind CSS | Web app, cổng :5173 |
| `mobile-app/` | React Native + Expo + TypeScript | Android & iOS |

---

## Yêu cầu môi trường

- Node.js >= 18
- JDK 17+ (cho backend)
- Expo Go app trên điện thoại **hoặc** Android Studio (emulator)

---

## Cài đặt & Chạy

### Backend (Spring Boot)
```bash
cd backend
# Cấu hình DB trong src/main/resources/application.properties
./mvnw spring-boot:run
```

### Frontend Web
```bash
cd frontend-web
npm install
npm run dev
# Truy cập: http://localhost:5173
```

### Mobile App (Expo)
```bash
cd mobile-app
npm install
npx expo start
```

Sau khi chạy `npx expo start`, chọn một trong các cách sau:

| Phím | Hành động |
|---|---|
| `a` | Mở trên Android Emulator (Android Studio) |
| `i` | Mở trên iOS Simulator (chỉ macOS) |
| Quét QR | Mở trong **Expo Go** trên điện thoại thật |

> **Lưu ý:** Điện thoại và máy tính phải cùng mạng Wi-Fi khi dùng Expo Go.

---

## Cộng tác nhóm (Git)

```bash
# Clone dự án lần đầu
git clone <repo-url>
cd FlightBooking_Project

# Cài dependencies cho từng phần
cd frontend-web && npm install
cd ../mobile-app  && npm install

# Tạo nhánh tính năng mới
git checkout -b feature/ten-tinh-nang

# Commit và push
git add .
git commit -m "feat: mô tả thay đổi"
git push origin feature/ten-tinh-nang
```

> `node_modules/` đã được loại khỏi Git. Sau khi clone, nhớ chạy `npm install` trong từng thư mục.
