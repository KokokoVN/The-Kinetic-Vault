# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG WEBSITE BÁN HÀNG (SPRING BOOT MICROSERVICES)

> Phiên bản: 1.2  
> Phạm vi: mô tả toàn bộ hệ thống website bán hàng theo kiến trúc Microservices của repository hiện tại, đồng thời bổ sung các nghiệp vụ mở rộng theo yêu cầu của người dùng.  
> Ghi chú: một số mục bên dưới phản ánh **nghiệp vụ mục tiêu/đề xuất** để hoàn chỉnh tài liệu sản phẩm; có thể cần triển khai thêm ở code nếu hiện tại chưa có đầy đủ.

---

## 3. User Service

### 3.1 Chức năng chính

- Đăng ký bằng Email/SĐT, Username và Password.
- Xác thực OTP trước khi kích hoạt tài khoản.
- Đăng nhập bằng Username/Email/SĐT.
- Thiết bị mới yêu cầu OTP để tăng bảo mật.
- Quản lý hồ sơ cá nhân.
- Đổi Email.
- Đổi mật khẩu.
- Quên mật khẩu và khôi phục mật khẩu.
- Lưu lịch sử thay đổi thông tin và thiết bị đăng nhập.
- Phân quyền `Admin`, `Staff`, `User`.
- Quản lý hạng thành viên theo chi tiêu và số đơn hoàn thành.

### 3.2 Nghiệp vụ mở rộng cần hỗ trợ

- Đăng ký tài khoản chỉ được phép khi Email/SĐT/Username chưa tồn tại.
- Xác thực OTP qua email hoặc SMS trước khi bật trạng thái tài khoản.
- Đăng nhập có thể thực hiện bằng Username, Email hoặc SĐT.
- Khi phát hiện thiết bị lạ, hệ thống sinh OTP xác minh thiết bị.
- Người dùng có thể cập nhật hồ sơ cá nhân như tên, ngày sinh, giới tính, ảnh đại diện.
- Người dùng có thể đổi email sau khi xác minh lại bằng OTP.
- Người dùng có thể đổi mật khẩu hoặc khôi phục mật khẩu qua OTP/token.
- Mọi thay đổi quan trọng phải được ghi vào lịch sử thay đổi.
- Hệ thống lưu lịch sử thiết bị đăng nhập để phục vụ bảo mật và kiểm tra rủi ro.
- Hệ thống phân quyền theo `Admin`, `Staff`, `User`.
- Hạng thành viên được tính theo tổng chi tiêu và số đơn hoàn thành.

### 3.3 Quy tắc nghiệp vụ

- Email, SĐT và Username là duy nhất.
- OTP hết hạn sau 5 phút.
- Khi thay đổi Email hoặc mật khẩu phải xác thực lại người dùng.
- Thiết bị lạ cần xác minh bổ sung.
- Lịch sử đăng nhập và lịch sử thay đổi hồ sơ phải được lưu lại.
- Hạng thành viên phải được cập nhật tự động sau khi đơn hàng hoàn thành hoặc phát sinh giao dịch hợp lệ.

### 3.4 CSDL/Schema đề xuất cho User Service

Nếu cần hoàn chỉnh thêm CSDL để hỗ trợ toàn bộ nghiệp vụ trên, nên bổ sung hoặc chuẩn hóa các bảng sau:

- `users`: thông tin tài khoản chính.
- `users_details`: thông tin hồ sơ cá nhân.
- `user_role`: vai trò hệ thống.
- `user_addresses`: địa chỉ người dùng.
- `user_profile_change_logs`: lịch sử thay đổi hồ sơ.
- `user_login_devices`: lịch sử thiết bị đăng nhập.
- `user_activation_tokens`: OTP kích hoạt tài khoản.
- `user_password_reset_tokens`: OTP/token khôi phục mật khẩu.
- `user_login_device_approval_tokens`: OTP xác minh thiết bị mới.
- `user_memberships` hoặc cột tương đương trong `users`: hạng thành viên, tổng chi tiêu, số đơn hoàn thành.

Các cột nên cân nhắc bổ sung:

- `email_verified_at`
- `phone_verified_at`
- `last_login_at`
- `last_login_ip`
- `last_login_device_id`
- `membership_level`
- `total_spent`
- `completed_orders_count`
- `password_changed_at`
- `email_changed_at`

---

## 16. Quy tắc nghiệp vụ quan trọng

1. Email/SĐT/Username là duy nhất.
2. OTP hết hạn sau 5 phút.
3. Không cho phép tồn kho âm.
4. Không cho phép đánh giá sản phẩm chưa mua.
5. Không cho phép một voucher được dùng nhiều lần bởi cùng người dùng.
6. Đơn hàng chờ thanh toán quá 24 giờ sẽ tự động hủy.
7. Đơn hàng chỉ được hủy khi chưa bàn giao cho đơn vị vận chuyển.
8. Khi đơn được xác nhận bởi admin hoặc nhân viên phải lưu người xác nhận.
9. MVD phải được sinh tự động khi đơn được xác nhận.
10. Snapshot sản phẩm trong đơn hàng là dữ liệu bất biến phục vụ truy vết lịch sử.
11. Tài khoản chỉ được kích hoạt sau khi OTP hợp lệ.
12. Thiết bị lạ phải được xác minh trước khi cho phép đăng nhập đầy đủ.
13. Hạng thành viên phải được tính tự động theo lịch sử mua hàng.

---

## 19. Phạm vi dữ liệu chính

### 19.1 Người dùng
- Tài khoản.
- Hồ sơ.
- Địa chỉ.
- Thiết bị.
- Lịch sử thay đổi.
- Hạng thành viên.
- Trạng thái xác thực email/SĐT.

---

## 20. Kết luận

Tài liệu này mô tả đầy đủ nghiệp vụ của hệ thống website bán hàng theo mô hình Spring Boot Microservices, bao gồm cả các chức năng đang có trong repository và các yêu cầu nghiệp vụ mở rộng để hoàn chỉnh sản phẩm ở mức thực tế hơn.

Nếu cần, tài liệu có thể được tách tiếp thành:

- tài liệu yêu cầu nghiệp vụ chi tiết theo module,
- tài liệu use case,
- tài liệu đặc tả API,
- tài liệu luồng nghiệp vụ BPMN,
- hoặc định dạng sẵn để đưa vào file Word `.docx`.
