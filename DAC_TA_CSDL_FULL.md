# 3.3.5. Đặc tả chi tiết Cơ sở dữ liệu theo từng Microservice

Dưới đây là đặc tả toàn bộ 37 bảng cơ sở dữ liệu của 11 Microservices trong hệ thống The Kinetic Vault. Hầu hết các bảng dữ liệu lõi đều kế thừa thuộc tính vết (AuditableEntity) bao gồm: `created_at`, `updated_at`, `created_by`, `updated_by`.

---

## A. Dịch vụ Người dùng (user-service)

**1. Bảng Users (Tài khoản)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| email | VARCHAR(255) | Not Null, Unique | Email đăng nhập |
| password | VARCHAR(255) | Not Null | Mật khẩu băm (Bcrypt) |
| is_active | BOOLEAN | Default FALSE | Trạng thái kích hoạt tài khoản |
| created_at | TIMESTAMP | Not Null | Thời gian tạo tài khoản |
| updated_at | TIMESTAMP | Nullable | Thời gian cập nhật |

**2. Bảng UserDetails (Thông tin chi tiết)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK, Unique | Trỏ về Users (1-1) |
| full_name | VARCHAR(255) | Not Null | Họ và tên đầy đủ |
| phone_number | VARCHAR(20) | Nullable | Số điện thoại liên hệ |
| avatar_url | VARCHAR(255) | Nullable | Ảnh đại diện |

**3. Bảng UserRole (Phân quyền)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| role_name | VARCHAR(50) | Not Null, Unique | Tên quyền hạn (ROLE_USER, ROLE_ADMIN) |
| description | VARCHAR(255) | Nullable | Mô tả quyền hạn |

**4. Bảng UserAddress (Sổ địa chỉ)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Trỏ về Users (1-N) |
| street_address | VARCHAR(255) | Not Null | Địa chỉ chi tiết |
| city | VARCHAR(100) | Not Null | Thành phố/Tỉnh |
| is_default | BOOLEAN | Default FALSE | Cờ địa chỉ mặc định |

**5. Bảng UserPasswordResetToken (Khôi phục mật khẩu)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Trỏ về Users |
| token | VARCHAR(255) | Not Null, Unique | Chuỗi token ngẫu nhiên |
| expiry_date | TIMESTAMP | Not Null | Hạn sử dụng token |

**6. Bảng UserActivationToken (Kích hoạt tài khoản)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Trỏ về Users |
| token | VARCHAR(255) | Not Null, Unique | Mã kích hoạt qua Email |
| expiry_date | TIMESTAMP | Not Null | Hạn kích hoạt |

**7. Bảng UserLoginDevice (Thiết bị đăng nhập)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Trỏ về Users |
| device_name | VARCHAR(100) | Not Null | Tên thiết bị truy cập |
| ip_address | VARCHAR(50) | Not Null | Địa chỉ IP đăng nhập |
| last_login | TIMESTAMP | Not Null | Lần cuối đăng nhập |

**8. Bảng UserLoginDeviceApprovalToken (Phê duyệt thiết bị)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| device_id | INT | FK | Trỏ về UserLoginDevice |
| token | VARCHAR(255) | Not Null, Unique | Mã xác nhận thiết bị lạ |
| expiry_date | TIMESTAMP | Not Null | Hạn sử dụng mã |

**9. Bảng UserProfileChangeLog (Nhật ký sửa hồ sơ)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Trỏ về Users |
| changed_field | VARCHAR(50) | Not Null | Tên trường bị thay đổi |
| old_value | VARCHAR(255) | Nullable | Giá trị cũ trước khi đổi |
| new_value | VARCHAR(255) | Nullable | Giá trị mới |
| change_date | TIMESTAMP | Not Null | Thời điểm thay đổi |

---

## B. Dịch vụ Sản phẩm (product-catalog-service)

**10. Bảng Category (Danh mục)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| name | VARCHAR(255) | Not Null | Tên danh mục |
| slug | VARCHAR(255) | Not Null, Unique | URL thân thiện |
| parent_id | INT | FK | Danh mục cha |

**11. Bảng Brand (Thương hiệu)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| name | VARCHAR(255) | Not Null | Tên thương hiệu |
| logo_url | VARCHAR(255) | Nullable | Link ảnh logo thương hiệu |

**12. Bảng Product (Sản phẩm gốc)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| sku | VARCHAR(64) | Unique, Nullable | Mã tham chiếu duy nhất |
| product_name | VARCHAR(255) | Not Null | Tên hiển thị |
| price | DECIMAL(15,2) | Not Null | Giá bán gốc |
| discription | TEXT | Nullable | Mô tả chi tiết |
| brand_id | BIGINT | FK | Khóa ngoại Thương hiệu |
| category_id | INT | FK | Khóa ngoại Danh mục |
| availability | INT | Not Null, Default 0 | Cờ trạng thái Tồn kho |
| is_hidden | BOOLEAN | Default 0 | Cờ Ẩn/Hiện trên web |
| view_count | BIGINT | Default 0 | Tổng lượt xem |
| sales_count | BIGINT | Default 0 | Tổng lượt mua |
| created_at | TIMESTAMP | Not Null | Thời gian tạo (Auditable) |
| updated_at | TIMESTAMP | Nullable | Thời gian sửa (Auditable) |
| created_by | VARCHAR(50) | Nullable | Người tạo (Auditable) |
| updated_by | VARCHAR(50) | Nullable | Người sửa (Auditable) |

**13. Bảng ProductVariant (Biến thể SKU)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| product_id | BIGINT | FK, Not Null | Trỏ về Product |
| size | VARCHAR(64) | Not Null | Kích thước / Dung lượng |
| color | VARCHAR(64) | Not Null | Màu sắc |
| variant_image_url| VARCHAR(1024)| Nullable | Hình ảnh riêng của biến thể |
| price | DECIMAL(15,2) | Nullable | Giá bán riêng |
| availability | INT | Default 0 | Cờ trạng thái Tồn kho riêng |
| created_at | TIMESTAMP | Not Null | Thời gian tạo (Auditable) |
| updated_at | TIMESTAMP | Nullable | Thời gian sửa (Auditable) |

**14. Bảng ProductImage (Hình ảnh thư viện)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| product_id | BIGINT | FK | Trỏ về Product |
| image_url | VARCHAR(1024) | Not Null | Đường dẫn ảnh |
| is_primary | BOOLEAN | Default FALSE | Ảnh đại diện chính |
| sort_order | INT | Default 0 | Thứ tự sắp xếp |

**15. Bảng ProductTechnicalSpec (Thông số kỹ thuật)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| product_id | BIGINT | FK | Trỏ về Product |
| spec_name | VARCHAR(100) | Not Null | Tên thông số (CPU, RAM...) |
| spec_value | VARCHAR(255) | Not Null | Giá trị thông số |

**16. Bảng ProductChangeLog (Nhật ký sửa đổi)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| product_id | BIGINT | FK | Mã sản phẩm |
| action | VARCHAR(50) | Not Null | Hành động (VD: Đổi giá) |
| change_time | TIMESTAMP | Not Null | Thời điểm sửa đổi |

---

## C. Dịch vụ Tồn kho (inventory-service)

**17. Bảng InventoryBalance (Tồn kho hiện hành)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| variant_id | BIGINT | FK, Unique | Mã biến thể sản phẩm |
| stock_quantity | INT | Default 0 | Số lượng đang có thực tế |
| created_at | TIMESTAMP | Not Null | Thời gian tạo (Auditable) |
| updated_at | TIMESTAMP | Nullable | Thời gian cập nhật (Auditable) |

**18. Bảng StockMovement (Lịch sử Nhập/Xuất)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| variant_id | BIGINT | FK | Mã biến thể sản phẩm |
| movement_type | VARCHAR(20) | Not Null | Phân loại (IN - Nhập / OUT - Xuất) |
| quantity | INT | Not Null | Số lượng nhập/xuất |
| reason | VARCHAR(255) | Nullable | Lý do (Nhập hàng, Khách mua) |

---

## D. Dịch vụ Đơn hàng (order-service)

**19. Bảng Order (Hóa đơn)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Khách mua hàng |
| total_amount | DECIMAL(15,2) | Not Null | Tổng tiền |
| status | VARCHAR(50) | Not Null | Trạng thái (PENDING, PAID, SHIPPED) |
| shipping_address| VARCHAR(255) | Not Null | Địa chỉ nhận hàng |
| created_at | TIMESTAMP | Not Null | Thời gian tạo (Auditable) |
| updated_at | TIMESTAMP | Nullable | Thời gian sửa (Auditable) |

**20. Bảng Item (Chi tiết Hóa đơn)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| order_id | BIGINT | FK | Thuộc về Hóa đơn nào |
| variant_id | BIGINT | FK | Mã hàng hóa (Biến thể) |
| quantity | INT | Min 1 | Số lượng đặt mua |
| unit_price | DECIMAL(15,2) | Not Null | Giá chốt thời điểm mua |

---

## E. Dịch vụ Thanh toán (payment-service)

**21. Bảng Payment (Giao dịch Thanh toán)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| order_id | BIGINT | FK, Unique | Thuộc về Đơn hàng nào |
| payment_gateway| VARCHAR(50) | Not Null | Cổng thanh toán (COD, SEPAY) |
| transaction_id | VARCHAR(100) | Unique | Mã giao dịch ngân hàng |
| amount | DECIMAL(15,2) | Not Null | Số tiền giao dịch |
| payment_status | VARCHAR(50) | Not Null | Trạng thái (SUCCESS, FAILED) |

---

## F. Dịch vụ Khuyến mãi & Quảng cáo (sale-service)

**22. Bảng Voucher (Mã giảm giá)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| code | VARCHAR(50) | Not Null, Unique | Mã Voucher (Ví dụ: MEGA2024) |
| discount_value | DECIMAL(15,2) | Not Null | Giá trị giảm |
| discount_type | VARCHAR(20) | Not Null | Loại giảm (PERCENT, FIXED) |
| max_discount | DECIMAL(15,2) | Nullable | Tiền giảm tối đa |
| expires_at | TIMESTAMP | Not Null | Hạn sử dụng |

**23. Bảng VoucherUsage (Lịch sử sử dụng)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| voucher_id | INT | FK | Khóa ngoại trỏ đến Voucher |
| user_id | INT | FK | Khách hàng đã dùng mã |
| order_id | BIGINT | FK | Hóa đơn áp dụng mã |

**24. Bảng PromoBanner (Quảng cáo Banner)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| image_url | VARCHAR(255) | Not Null | Đường dẫn ảnh banner |
| link_url | VARCHAR(255) | Nullable | Link điều hướng |
| is_active | BOOLEAN | Default TRUE | Trạng thái Ẩn/Hiện |

**25. Bảng SaleProgram (Chiến dịch Khuyến mãi)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| name | VARCHAR(255) | Not Null | Tên chiến dịch (VD: Flash Sale) |
| start_date | TIMESTAMP | Not Null | Thời gian bắt đầu |
| end_date | TIMESTAMP | Not Null | Thời gian kết thúc |

**26. Bảng SaleProgramItem (Sản phẩm trong chiến dịch)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| program_id | INT | FK | Trỏ về SaleProgram |
| product_id | BIGINT | FK | Sản phẩm tham gia sale |
| promo_price | DECIMAL(15,2) | Not Null | Giá khuyến mãi |

---

## G. Dịch vụ Đánh giá Hậu mãi (review-service)

**27. Bảng Review (Bình luận)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Khách hàng viết |
| product_id | BIGINT | FK | Đánh giá SP nào |
| rating | INT | Not Null | Số sao (1 đến 5) |
| comment | TEXT | Nullable | Nội dung chữ |

**28. Bảng ReviewResponse (Admin phản hồi)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| review_id | BIGINT | FK, Unique | Trả lời cho bình luận nào |
| admin_id | INT | FK | Người trả lời |
| response_text | TEXT | Not Null | Nội dung trả lời |

**29. Bảng ReviewMedia (Ảnh đính kèm)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| review_id | BIGINT | FK | Thuộc bình luận nào |
| image_url | VARCHAR(255) | Not Null | Link ảnh đính kèm |

**30. Bảng ReviewEditHistory (Lịch sử sửa đổi)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| review_id | BIGINT | FK | Thuộc bình luận nào |
| old_content | TEXT | Nullable | Bình luận cũ trước khi bị sửa |

---

## H. Dịch vụ Gợi ý Sản phẩm (product-recommendation-service)

**31. Bảng Product (Bản sao lưu RecommendationDB)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| name | VARCHAR(255) | Not Null | Tên sản phẩm |
| tags | VARCHAR(255) | Nullable | Từ khóa gợi ý |

**32. Bảng Recommendation (Lịch sử Gợi ý AI)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Gợi ý cho ai |
| recommended_product_id | BIGINT | FK | Mã SP được gọi ý |

**33. Bảng ManualProductRecommendation (Gợi ý Cấu hình tay)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| product_id | BIGINT | FK | Khách mua Sản phẩm A... |
| target_product_id | BIGINT | FK | ...Sẽ gợi ý mua thêm Sản phẩm B |

---

## I. Các Dịch vụ Hỗ trợ Hệ thống

**34. Bảng NotificationMessage (notification-service)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| recipient_email | VARCHAR(255) | Not Null | Người nhận |
| subject | VARCHAR(255) | Not Null | Tiêu đề thư |
| content | TEXT | Not Null | Nội dung thư |

**35. Bảng TelegramUser (telegram-service)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| telegram_chat_id| VARCHAR(50) | Not Null | ID phòng chat Telegram |
| user_id | INT | FK | Liên kết với tài khoản web |

**36. Bảng TelegramToken (telegram-service)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính |
| token | VARCHAR(100) | Not Null, Unique | Mã bí mật lấy từ BotFather |

**37. Bảng WebActivity (activity-log-service)**
| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PK, Auto Inc | Khóa chính |
| user_id | INT | FK | Tài khoản thực hiện hành động |
| action | VARCHAR(255) | Not Null | Hành động (Ví dụ: Thay đổi giá hàng loạt) |
| ip_address | VARCHAR(50) | Not Null | Địa chỉ IP |
| timestamp | TIMESTAMP | Not Null | Lần thực hiện thao tác |
