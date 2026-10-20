package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.dto.StoreContactUpsertRequest;
import com.rainbowforest.userservice.entity.StoreContact;
import com.rainbowforest.userservice.repository.StoreContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StoreContactServiceImpl implements StoreContactService {

    private static final Logger log = LoggerFactory.getLogger(StoreContactServiceImpl.class);

    @Autowired
    private StoreContactRepository storeContactRepository;

    @Override
    @Transactional(readOnly = true)
    public StoreContact getPrimaryStoreContact() {
        Optional<StoreContact> primary = storeContactRepository.findFirstByIsPrimaryTrueAndIsActiveTrue();
        if (primary.isPresent()) {
            return primary.get();
        }

        Optional<StoreContact> firstActive = storeContactRepository.findFirstByIsActiveTrueOrderByIdAsc();
        if (firstActive.isPresent()) {
            return firstActive.get();
        }

        // Return a default store contact if no record exists yet
        StoreContact defaultStore = new StoreContact();
        defaultStore.setStoreName("The Kinetic Vault - Hệ Thống Bán Lẻ Công Nghệ");
        defaultStore.setPhoneNumber("0901 234 567");
        defaultStore.setHotline("1900 6868");
        defaultStore.setEmail("contact@thekineticvault.vn");
        defaultStore.setAddress("123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh");
        defaultStore.setWard("Phường Bến Nghé");
        defaultStore.setDistrict("Quận 1");
        defaultStore.setProvince("TP. Hồ Chí Minh");
        defaultStore.setOpeningHours("08:00 - 22:00 (Thứ 2 - Chủ Nhật)");
        defaultStore.setGoogleMapsUrl("https://maps.google.com/?q=10.776889,106.700806");
        defaultStore.setWebsiteUrl("https://thekineticvault.vn");
        defaultStore.setDescription("Hệ sinh thái thương mại điện tử công nghệ cao chính hãng.");
        defaultStore.setIsPrimary(true);
        defaultStore.setIsActive(true);
        defaultStore.setCreatedBy("system");

        return defaultStore;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoreContact> getAllActiveStoreContacts() {
        List<StoreContact> list = storeContactRepository.findAllByIsActiveTrueOrderByIdAsc();
        if (list.isEmpty()) {
            StoreContact primary = getPrimaryStoreContact();
            list.add(primary);
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public StoreContact getStoreContactById(Long id) {
        if (id == null) {
            return getPrimaryStoreContact();
        }
        return storeContactRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin cửa hàng có ID: " + id));
    }

    @Override
    public StoreContact saveOrUpdateStoreContact(StoreContactUpsertRequest request, String actor) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu thông tin liên hệ cửa hàng không được để trống");
        }

        StoreContact entity;
        if (request.getId() != null && request.getId() > 0) {
            entity = storeContactRepository.findById(request.getId())
                    .orElse(new StoreContact());
        } else {
            // Check if there is an existing primary store
            Optional<StoreContact> existingPrimary = storeContactRepository.findFirstByIsPrimaryTrueAndIsActiveTrue();
            entity = existingPrimary.orElseGet(StoreContact::new);
        }

        // Validate mandatory fields
        if (request.getStoreName() != null && !request.getStoreName().trim().isEmpty()) {
            entity.setStoreName(request.getStoreName().trim());
        } else if (entity.getStoreName() == null) {
            entity.setStoreName("The Kinetic Vault");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            entity.setPhoneNumber(request.getPhoneNumber().trim());
        } else if (entity.getPhoneNumber() == null) {
            entity.setPhoneNumber("0901 234 567");
        }

        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            entity.setAddress(request.getAddress().trim());
        } else if (entity.getAddress() == null) {
            entity.setAddress("123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh");
        }

        // Optional fields
        if (request.getHotline() != null) entity.setHotline(request.getHotline().trim());
        if (request.getEmail() != null) entity.setEmail(request.getEmail().trim());
        if (request.getWard() != null) entity.setWard(request.getWard().trim());
        if (request.getDistrict() != null) entity.setDistrict(request.getDistrict().trim());
        if (request.getProvince() != null) entity.setProvince(request.getProvince().trim());
        if (request.getOpeningHours() != null) entity.setOpeningHours(request.getOpeningHours().trim());
        if (request.getGoogleMapsUrl() != null) entity.setGoogleMapsUrl(request.getGoogleMapsUrl().trim());
        if (request.getFacebookUrl() != null) entity.setFacebookUrl(request.getFacebookUrl().trim());
        if (request.getZaloUrl() != null) entity.setZaloUrl(request.getZaloUrl().trim());
        if (request.getTiktokUrl() != null) entity.setTiktokUrl(request.getTiktokUrl().trim());
        if (request.getWebsiteUrl() != null) entity.setWebsiteUrl(request.getWebsiteUrl().trim());
        if (request.getDescription() != null) entity.setDescription(request.getDescription().trim());

        boolean isPrimary = request.getIsPrimary() == null || request.getIsPrimary();
        entity.setIsPrimary(isPrimary);

        boolean isActive = request.getIsActive() == null || request.getIsActive();
        entity.setIsActive(isActive);

        if (entity.getId() == null) {
            entity.setCreatedBy(actor != null ? actor : "admin");
        }
        entity.setUpdatedBy(actor != null ? actor : "admin");

        // If this contact is marked primary, demote other contacts
        if (isPrimary) {
            List<StoreContact> all = storeContactRepository.findAll();
            for (StoreContact sc : all) {
                if (entity.getId() == null || !sc.getId().equals(entity.getId())) {
                    if (Boolean.TRUE.equals(sc.getIsPrimary())) {
                        sc.setIsPrimary(false);
                        storeContactRepository.save(sc);
                    }
                }
            }
        }

        return storeContactRepository.save(entity);
    }

    @Override
    public void deleteStoreContact(Long id, String actor) {
        if (id == null) return;
        StoreContact sc = storeContactRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi nhánh cửa hàng có ID: " + id));

        sc.setIsActive(false);
        sc.setDeletedAt(LocalDateTime.now());
        sc.setDeletedBy(actor != null ? actor : "admin");
        storeContactRepository.save(sc);
    }
}
