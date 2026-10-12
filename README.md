# 🏛️ Hệ Thống Quản Lý Đặt Phòng Khách Sạn (Hotel Booking Management System)
> Triển khai thực tế theo Kịch bản [SC-xx] và Kế hoạch WBS [TASK-01] đến [TASK-04] thuộc Hệ Sinh Thái BMad Method 6.12.0 & TEA Enterprise 1.27.2 [ID:363][ID:442].

Hệ thống cung cấp giải pháp quản lý đặt phòng khách sạn thời gian thực (Real-time Hotel Booking) tích hợp giao diện trực quan, API Backend mạnh mẽ, cơ chế tự động hóa kiểm thử Playwright CLI [ID:9], và tài liệu đặc tả chuẩn hóa theo cấu trúc tri thức Vibecode KB [ID:450].

---

## 📖 Kịch Bản Nghiệp Vụ (Business Scenario)
1. **Xem danh sách phòng**: Khách hàng và Quản trị viên xem danh sách phòng trực quan với trạng thái thời gian thực (Trống, Đã đặt).
2. **Đặt phòng (Booking)**: Khách hàng chọn phòng trống, nhập thông tin cá nhân (Tên, Email, Ngày nhận/trả) để tiến hành đặt phòng. Hệ thống tự động tính toán tổng chi phí và chuyển trạng thái phòng sang "Đã đặt".
3. **Hủy đặt phòng (Cancellation)**: Quản trị viên hoặc Khách hàng có thể hủy đặt phòng để giải phóng phòng về trạng thái "Trống".
4. **Tìm kiếm & Lọc**: Lọc nhanh danh sách phòng theo trạng thái hoặc tìm kiếm theo tên phòng.

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc (Prerequisites & Installation)
Yêu cầu hệ thống đã cài đặt **Node.js (v18+)**. Chạy lệnh sau tại thư mục gốc của dự án:
```bash
npm install
```

### 2. Khởi chạy ứng dụng (Start Server)
Khởi chạy server Node.js (Express) tích hợp Socket.io phục vụ cập nhật thời gian thực:
```bash
npm start
```
Sau khi khởi chạy thành công, truy cập ứng dụng tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### 3. Chạy kiểm thử tự động (Run Tests)
Hệ thống tích hợp sẵn bộ kiểm thử tự động Playwright để kiểm tra toàn bộ luồng nghiệp vụ:
```bash
npm test
```

---

## 🗂️ Cấu Trúc Thư Mục Dự Án
```text
hotel-booking-system/
├── README.md                     # Tài liệu hướng dẫn và kịch bản hệ thống [ID:450]
├── package.json                  # Cấu hình dự án, dependencies và scripts chạy test
├── server.js                     # Backend Express Server & Socket.io Real-time
├── public/                       # Giao diện người dùng (Frontend)
│   ├── index.html                # Giao diện HTML5 trực quan
│   ├── style.css                 # Thiết kế giao diện hiện đại, responsive
│   └── app.js                    # Logic xử lý Frontend & kết nối Socket.io
└── tests/                        # Thư mục chứa kịch bản kiểm thử tự động [ID:9]
    └── booking.spec.js           # Kịch bản kiểm thử Playwright E2E hoàn chỉnh
```
```

---