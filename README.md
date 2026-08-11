# Public Web — Minh Đức Sport

Ứng dụng web dành cho **người chơi**: tìm cơ sở/sân, đặt lịch, thanh toán, chat với chủ sân, quản lý tài khoản.

| | |
|---|---|
| **Repo** | [Minhdwc/public-user-booking-FE](https://github.com/Minhdwc/public-user-booking-FE) |
| **Port dev** | `3000` |
| **Backend** | `http://localhost:3001/api/v1` |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**, Radix UI / shadcn
- **TanStack Query**, **Zustand**, **Axios**
- **Socket.io** (chat, thông báo realtime)
- **Leaflet** (bản đồ sân)
- **Zod** + **react-hook-form**

## Yêu cầu

- Node.js 20+
- Backend API đang chạy (xem repo `BE-booking-sport`)

## Cài đặt & chạy local

```bash
npm install
# Tạo file .env (xem mục Biến môi trường bên dưới)
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
```

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_API_URL` | Base URL API dùng trên client |
| `BACKEND_URL` | Target cho Next.js rewrite `/api/v1/*` → backend |

Next.js proxy request `/api/v1/*` sang backend qua `next.config.ts`, giúp tránh CORS khi dev.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

## Tính năng chính

| Module | Route | Mô tả |
|--------|-------|--------|
| Trang chủ | `/` | Tìm kiếm, gợi ý |
| Sân | `/courts`, `/courts/[id]` | Danh sách (map + filter), chi tiết & đặt slot |
| Cơ sở | `/venues`, `/venues/[id]` | Danh sách & chi tiết cơ sở |
| Đặt sân | `/bookings`, `/checkout` | Lịch đặt, thanh toán |
| Chat | `/messages` | Nhắn tin với cơ sở |
| Yêu thích | `/favorites` | Sân/cơ sở đã lưu |
| Thông báo | `/notifications` | Thông báo realtime |
| Tài khoản | `/account/*` | Hồ sơ, đổi mật khẩu |
| Auth | `/login`, `/register`, `/verify-email` | Đăng nhập, đăng ký, xác thực email |

## Cấu trúc thư mục

```
app/                    # Routes & layouts (Next.js App Router)
components/
  features/             # UI theo domain (field, venue, booking, chat, …)
  layout/               # Header, Footer
  providers/            # Auth, socket, theme
  ui/                   # Component UI cơ bản
lib/
  api/                  # REST client & modules
  service/              # Business logic
  queries/              # TanStack Query hooks
  stores/               # Zustand (auth)
  hooks/, utils/, validations/
```

## Hệ sinh thái

Repo này là một phần của hệ thống đặt sân thể thao:

| Repo | Vai trò | Port |
|------|---------|------|
| **public-user-booking-FE** (repo này) | Web người dùng | 3000 |
| [website_booking_FE_ERP](https://github.com/Minhdwc/website_booking_FE_ERP) | Dashboard chủ sân / admin | 3002 |
| [BE-booking-sport](https://github.com/Minhdwc/BE-booking-sport) | API NestJS | 3001 |
| Mobile (Expo) | App iOS/Android | — |

## Ghi chú phát triển

- Ảnh sân (`courtImages`) và ảnh cơ sở (`venueImages`) là **riêng biệt** — trang chi tiết sân chỉ hiển thị `courtImages`.
- Chạy `npm run build` trước khi push để kiểm tra TypeScript & build.
