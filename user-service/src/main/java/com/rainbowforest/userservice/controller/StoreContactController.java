package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.StoreContactUpsertRequest;
import com.rainbowforest.userservice.entity.StoreContact;
import com.rainbowforest.userservice.service.StoreContactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/store-contact")
public class StoreContactController {

    private static final Logger log = LoggerFactory.getLogger(StoreContactController.class);

    @Autowired
    private StoreContactService storeContactService;

    /**
     * Lấy thông tin liên hệ chính của cửa hàng (SĐT, Địa chỉ, Email, Giờ làm việc, Google Map).
     * Endpoint công khai (Public) cho khách hàng & Storefront.
     */
    @GetMapping
    public ResponseEntity<StoreContact> getPrimaryStoreContact() {
        StoreContact contact = storeContactService.getPrimaryStoreContact();
        return ResponseEntity.ok(contact);
    }

    /**
     * Lấy danh sách tất cả các chi nhánh cửa hàng.
     * Endpoint công khai (Public).
     */
    @GetMapping("/all")
    public ResponseEntity<List<StoreContact>> getAllStoreContacts() {
        List<StoreContact> list = storeContactService.getAllActiveStoreContacts();
        return ResponseEntity.ok(list);
    }

    /**
     * Lấy chi tiết thông tin cửa hàng theo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StoreContact> getStoreContactById(@PathVariable("id") Long id) {
        StoreContact contact = storeContactService.getStoreContactById(id);
        return ResponseEntity.ok(contact);
    }

    /**
     * Cập nhật hoặc lưu thông tin liên hệ cửa hàng chính.
     * Yêu cầu quyền Quản trị (Admin / Manager).
     */
    @PutMapping
    public ResponseEntity<?> updatePrimaryStoreContact(
            @RequestBody StoreContactUpsertRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        String username = httpRequest.getHeader("X-User-Name");
        if (role == null || (!role.toUpperCase().contains("ADMIN") && !role.toUpperCase().contains("MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Chỉ có quản trị viên mới có quyền cập nhật thông tin cửa hàng."));
        }

        try {
            StoreContact updated = storeContactService.saveOrUpdateStoreContact(request, username != null ? username : "admin");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi cập nhật thông tin liên hệ cửa hàng: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Không thể cập nhật thông tin cửa hàng: " + e.getMessage()));
        }
    }

    /**
     * Tạo mới một chi nhánh cửa hàng.
     * Yêu cầu quyền Quản trị (Admin / Manager).
     */
    @PostMapping
    public ResponseEntity<?> createStoreContact(
            @RequestBody StoreContactUpsertRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        String username = httpRequest.getHeader("X-User-Name");
        if (role == null || (!role.toUpperCase().contains("ADMIN") && !role.toUpperCase().contains("MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Chỉ có quản trị viên mới có quyền thêm mới chi nhánh cửa hàng."));
        }

        try {
            StoreContact created = storeContactService.saveOrUpdateStoreContact(request, username != null ? username : "admin");
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi tạo mới chi nhánh cửa hàng: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Không thể tạo mới chi nhánh cửa hàng: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin chi nhánh cửa hàng theo ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStoreContactById(
            @PathVariable("id") Long id,
            @RequestBody StoreContactUpsertRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        String username = httpRequest.getHeader("X-User-Name");
        if (role == null || (!role.toUpperCase().contains("ADMIN") && !role.toUpperCase().contains("MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Chỉ có quản trị viên mới có quyền cập nhật chi nhánh cửa hàng."));
        }

        try {
            request.setId(id);
            StoreContact updated = storeContactService.saveOrUpdateStoreContact(request, username != null ? username : "admin");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi cập nhật chi nhánh cửa hàng #{}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi cập nhật: " + e.getMessage()));
        }
    }

    /**
     * Xóa chi nhánh cửa hàng.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStoreContact(
            @PathVariable("id") Long id,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        String username = httpRequest.getHeader("X-User-Name");
        if (role == null || (!role.toUpperCase().contains("ADMIN") && !role.toUpperCase().contains("MANAGER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Chỉ có quản trị viên mới có quyền xóa chi nhánh cửa hàng."));
        }

        try {
            storeContactService.deleteStoreContact(id, username != null ? username : "admin");
            return ResponseEntity.ok(Collections.singletonMap("message", "Đã xóa chi nhánh cửa hàng thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi xóa chi nhánh cửa hàng #{}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Lỗi xóa chi nhánh: " + e.getMessage()));
        }
    }
}
