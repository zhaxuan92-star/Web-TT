# VZC News — Web-TT

Nền tảng tin tức đa nhánh, giao diện tiếng Việt, xây dựng bằng React + Vite.

## Tính năng hiện có
- Trang chủ và danh sách nhánh tin tức.
- Tạo nhánh với tên, mô tả, màu nhận diện và slug tự sinh.
- Trang riêng cho từng nhánh tại `/branch/:slug`.
- Đăng và đọc bài viết trong từng nhánh.
- Tìm kiếm bài viết.
- Lưu dữ liệu bằng localStorage trên trình duyệt.

## Chạy cục bộ
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Lưu ý về dữ liệu
Phiên bản 0.1.0 là prototype frontend: dữ liệu lưu trong trình duyệt của từng thiết bị, chưa đồng bộ giữa người dùng. Để mở thành nền tảng cộng đồng thực sự cần bổ sung backend/database, đăng nhập, phân quyền chủ nhánh và kiểm duyệt nội dung.
