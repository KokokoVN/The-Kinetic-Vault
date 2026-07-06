package com.rainbowforest.saleservice.service;

import com.rainbowforest.saleservice.client.InventoryClient;
import com.rainbowforest.saleservice.dto.SaleProgramRequest;
import com.rainbowforest.saleservice.dto.VoucherApplyResponse;
import com.rainbowforest.saleservice.dto.VoucherRequest;
import com.rainbowforest.saleservice.dto.VoucherUsageResponse;
import com.rainbowforest.saleservice.entity.*;
import com.rainbowforest.saleservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@Transactional
public class SaleServiceImpl {

    @Autowired private SaleProgramRepository saleProgramRepo;
    @Autowired private SaleProgramItemRepository saleProgramItemRepo;
    @Autowired private VoucherRepository voucherRepo;
    @Autowired private VoucherUsageRepository voucherUsageRepo;
    @Autowired private PromoBannerRepository promoBannerRepo;
    @Autowired private InventoryClient inventoryClient;

    // =========================================================
    // SALE PROGRAM
    // =========================================================

    @Transactional(readOnly = true)
    public List<SaleProgram> listAllPrograms() {
        List<SaleProgram> programs = saleProgramRepo.findAll();
        programs.forEach(p -> p.getItems().size());
        return programs;
    }

    @Transactional(readOnly = true)
    public List<SaleProgram> listActivePrograms() {
        List<SaleProgram> programs = saleProgramRepo.findCurrentlyActive(LocalDateTime.now());
        programs.forEach(p -> p.getItems().size());
        return programs;
    }

    @Transactional(readOnly = true)
    public SaleProgram getProgramById(Long id) {
        SaleProgram program = saleProgramRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy chương trình sale #" + id));
        program.getItems().size();
        return program;
    }

    public SaleProgram createProgram(SaleProgramRequest req, String performedBy) {
        validateProgramRequest(req);
        SaleProgram program = new SaleProgram();
        applyProgramFields(program, req);
        program.setCreatedBy(performedBy);
        program = saleProgramRepo.save(program);

        if (req.getItems() != null) {
            for (SaleProgramRequest.ItemRequest itemReq : req.getItems()) {
                addItemToProgram(program, itemReq, performedBy);
            }
        }
        SaleProgram saved = saleProgramRepo.findById(program.getId()).orElse(program);
        saved.getItems().size();
        return saved;
    }

    public SaleProgram updateProgram(Long id, SaleProgramRequest req, String performedBy) {
        SaleProgram program = getProgramById(id);
        validateProgramRequest(req);
        applyProgramFields(program, req);
        program.setUpdatedBy(performedBy);

        // Replace items
        program.getItems().clear();
        saleProgramRepo.save(program);

        if (req.getItems() != null) {
            for (SaleProgramRequest.ItemRequest itemReq : req.getItems()) {
                addItemToProgram(program, itemReq, performedBy);
            }
        }
        SaleProgram saved = saleProgramRepo.findById(program.getId()).orElse(program);
        saved.getItems().size();
        return saved;
    }

    public void deleteProgram(Long id) {
        SaleProgram program = getProgramById(id);
        saleProgramRepo.delete(program);
    }

    private void addItemToProgram(SaleProgram program, SaleProgramRequest.ItemRequest itemReq, String performedBy) {
        if (itemReq.getProductId() == null) {
            throw new IllegalArgumentException("productId không được để trống trong item khuyến mãi.");
        }

        // 1. Kiểm tra trùng thời gian
        List<SaleProgramItem> overlapping = saleProgramItemRepo.findOverlapping(
                itemReq.getProductId(),
                itemReq.getVariantId(),
                program.getStartAt(),
                program.getEndAt(),
                program.getId()
        );
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Sản phẩm #" + itemReq.getProductId()
                    + (itemReq.getVariantId() != null ? " (Biến thể #" + itemReq.getVariantId() + ")" : "")
                    + " đã được áp dụng trong một chương trình khuyến mãi khác trong cùng thời gian.");
        }

        // 2. Kiểm tra promoQtyLimit <= tồn kho thực tế (từ inventory-service)
        // Validate that limit > 0 if provided. Removed check against actual stock to allow admins to set limits before importing inventory.
        if (itemReq.getPromoQtyLimit() != null && itemReq.getPromoQtyLimit() <= 0) {
            throw new IllegalArgumentException("Số lượng khuyến mãi phải lớn hơn 0.");
        }

        SaleProgramItem item = new SaleProgramItem();
        item.setSaleProgram(program);
        item.setProductId(itemReq.getProductId());
        item.setVariantId(itemReq.getVariantId());
        item.setPromoQtyLimit(itemReq.getPromoQtyLimit());
        item.setCreatedBy(performedBy);
        program.getItems().add(item);
    }

    public void consumeSaleQty(Long productId, Long variantId, Integer qty) {
        if (qty == null || qty <= 0) return;
        List<SaleProgramItem> overlapping = saleProgramItemRepo.findOverlapping(
                productId,
                variantId,
                LocalDateTime.now(),
                LocalDateTime.now(),
                -1L
        );
        if (overlapping.isEmpty()) return;

        SaleProgramItem item = overlapping.get(0);
        if (item.getPromoQtyLimit() != null && item.getPromoQtyLimit() > 0) {
            int newLimit = item.getPromoQtyLimit() - qty;
            if (newLimit < 0) newLimit = 0;
            item.setPromoQtyLimit(newLimit);
            saleProgramItemRepo.save(item);
        }
    }

    private int fetchActualStock(Long productId, Long variantId) {
        try {
            List<Map<String, Object>> balances = inventoryClient.getStockBalances(productId);
            if (balances == null || balances.isEmpty()) return 0;
            return balances.stream()
                    .filter(b -> {
                        Object vid = b.get("variantId");
                        if (variantId == null) return vid == null;
                        return variantId.toString().equals(String.valueOf(vid));
                    })
                    .mapToInt(b -> {
                        Object qty = b.get("quantityOnHand");
                        if (qty == null) return 0;
                        try { return Integer.parseInt(String.valueOf(qty)); } catch (Exception e) { return 0; }
                    })
                    .sum();
        } catch (Exception e) {
            // Nếu không kết nối được inventory-service, cho phép tiếp tục (fail-open)
            return Integer.MAX_VALUE;
        }
    }

    private void validateProgramRequest(SaleProgramRequest req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên chương trình không được để trống.");
        }
        if (!"PERCENT".equals(req.getDiscountType()) && !"AMOUNT".equals(req.getDiscountType())) {
            throw new IllegalArgumentException("discountType phải là PERCENT hoặc AMOUNT.");
        }
        if (req.getDiscountValue() == null || req.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        }
        if ("PERCENT".equals(req.getDiscountType()) && req.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Mức giảm % không được vượt quá 100%.");
        }
        if (req.getStartAt() == null || req.getEndAt() == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc không được để trống.");
        }
        if (!req.getEndAt().isAfter(req.getStartAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }
        
        if (req.getItems() != null) {
            for (int i = 0; i < req.getItems().size(); i++) {
                SaleProgramRequest.ItemRequest item1 = req.getItems().get(i);
                for (int j = i + 1; j < req.getItems().size(); j++) {
                    SaleProgramRequest.ItemRequest item2 = req.getItems().get(j);
                    if (item1.getProductId() != null && item1.getProductId().equals(item2.getProductId())) {
                        if (item1.getVariantId() == null || item2.getVariantId() == null || item1.getVariantId().equals(item2.getVariantId())) {
                            throw new IllegalArgumentException("Sản phẩm #" + item1.getProductId() + " bị trùng lặp trong cùng danh sách khuyến mãi.");
                        }
                    }
                }
            }
        }
    }

    private void applyProgramFields(SaleProgram program, SaleProgramRequest req) {
        program.setName(req.getName().trim());
        program.setDescription(req.getDescription());
        program.setDiscountType(req.getDiscountType());
        program.setDiscountValue(req.getDiscountValue());
        program.setStartAt(req.getStartAt());
        program.setEndAt(req.getEndAt());
        program.setActive(req.getActive() != null ? req.getActive() : true);
    }

    // =========================================================
    // VOUCHER
    // =========================================================

    @Transactional(readOnly = true)
    public boolean checkOverlap(Long productId, Long variantId, ZonedDateTime startAt, ZonedDateTime endAt, Long excludeProgramId) {
        List<SaleProgramItem> overlapping = saleProgramItemRepo.findOverlapping(
                productId, variantId, startAt.toLocalDateTime(), endAt.toLocalDateTime(), excludeProgramId == null ? -1L : excludeProgramId);
        return !overlapping.isEmpty();
    }

    @Transactional(readOnly = true)
    public List<Voucher> listAllVouchers() {
        return voucherRepo.findAll();
    }

    /** Lấy voucher đang active, chưa hết hạn, chưa hết lượt — dùng cho public checkout. */
    @Transactional(readOnly = true)
    public List<Voucher> listActiveVouchers() {
        return voucherRepo.findActiveVouchers(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getUserVoucherUsage(Long userId) {
        List<VoucherUsage> usages = voucherUsageRepo.findByUserId(userId);
        Map<String, Integer> usageMap = new java.util.HashMap<>();
        for (VoucherUsage u : usages) {
            voucherRepo.findById(u.getVoucherId()).ifPresent(v -> {
                usageMap.put(v.getCode(), usageMap.getOrDefault(v.getCode(), 0) + 1);
            });
        }
        return usageMap;
    }

    @Transactional(readOnly = true)
    public Voucher getVoucherById(Long id) {
        return voucherRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy voucher #" + id));
    }

    @Transactional(readOnly = true)
    public List<VoucherUsageResponse> getVoucherUsages(Long voucherId) {
        Voucher voucher = getVoucherById(voucherId);
        List<VoucherUsage> usages = voucherUsageRepo.findByVoucherIdOrderByUsedAtDesc(voucher.getId());
        List<VoucherUsageResponse> rows = new ArrayList<>();
        for (VoucherUsage usage : usages) {
            VoucherUsageResponse row = new VoucherUsageResponse();
            row.setId(usage.getId());
            row.setVoucherId(usage.getVoucherId());
            row.setUserId(usage.getUserId());
            row.setOrderId(usage.getOrderId());
            row.setUsedAt(usage.getUsedAt());
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public boolean checkVoucherCodeExists(String code, Long excludeVoucherId) {
        if (code == null || code.trim().isEmpty()) return false;
        String normalizedCode = code.trim().toUpperCase();
        Voucher existing = voucherRepo.findByCode(normalizedCode).orElse(null);
        if (existing == null) return false;
        if (excludeVoucherId != null && existing.getId().equals(excludeVoucherId)) return false;
        return true;
    }

    public Voucher createVoucher(VoucherRequest req, String performedBy) {
        validateVoucherRequest(req);
        if (voucherRepo.existsByCode(req.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Mã voucher '" + req.getCode() + "' đã tồn tại.");
        }
        Voucher v = applyVoucherFields(new Voucher(), req);
        v.setCreatedBy(performedBy);
        return voucherRepo.save(v);
    }

    public Voucher updateVoucher(Long id, VoucherRequest req, String performedBy) {
        Voucher v = getVoucherById(id);
        validateVoucherRequest(req);
        String newCode = req.getCode().trim().toUpperCase();
        if (!newCode.equals(v.getCode()) && voucherRepo.existsByCode(newCode)) {
            throw new IllegalArgumentException("Mã voucher '" + newCode + "' đã tồn tại.");
        }
        v = applyVoucherFields(v, req);
        v.setUpdatedBy(performedBy);
        return voucherRepo.save(v);
    }

    public void deleteVoucher(Long id) {
        Voucher v = getVoucherById(id);
        voucherRepo.delete(v);
    }

    /**
     * Validate voucher cho user + orderAmount.
     * Nếu hợp lệ → tính discountAmount và trả về.
     * Không consume (lock) usage ở bước này — gọi consumeVoucher() sau khi order được tạo.
     */
    @Transactional(readOnly = true)
    public VoucherApplyResponse validateVoucher(String code, Long userId, BigDecimal orderAmount) {
        Voucher v = voucherRepo.findByCode(code.trim().toUpperCase()).orElse(null);
        if (v == null) return VoucherApplyResponse.error(code, "Mã voucher không tồn tại.");
        if (!Boolean.TRUE.equals(v.getActive())) return VoucherApplyResponse.error(code, "Mã voucher đã bị vô hiệu hóa.");
        if (v.isNotYetStarted()) return VoucherApplyResponse.error(code, "Mã voucher chưa đến thời gian sử dụng.");
        if (v.isExpired()) return VoucherApplyResponse.error(code, "Mã voucher đã hết hạn.");
        if (v.isExhausted()) return VoucherApplyResponse.error(code, "Mã voucher đã hết lượt sử dụng.");
        
        int userUsageCount = voucherUsageRepo.countByVoucherIdAndUserId(v.getId(), userId);
        int allowedPerUser = v.getMaxUsagePerUser() != null ? v.getMaxUsagePerUser() : 1;
        if (userUsageCount >= allowedPerUser)
            return VoucherApplyResponse.error(code, "Bạn đã sử dụng mã voucher này " + userUsageCount + "/" + allowedPerUser + " lần (Vượt quá giới hạn).");

        if (v.getMinOrderAmount() != null && orderAmount.compareTo(v.getMinOrderAmount()) < 0)
            return VoucherApplyResponse.error(code, "Đơn hàng tối thiểu " + v.getMinOrderAmount() + " VND để áp dụng voucher này.");

        BigDecimal discount = calculateDiscount(v, orderAmount);
        return VoucherApplyResponse.ok(code, discount, v.getDiscountType(), v.getDiscountValue());
    }

    /**
     * Consume voucher — ghi lịch sử sử dụng và tăng usageCount.
     * Gọi từ order-service (qua Feign) sau khi order được tạo thành công.
     */
    public void consumeVoucher(String code, Long userId, Long orderId) {
        Voucher v = voucherRepo.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new NoSuchElementException("Voucher không tồn tại: " + code));
        if (v.isNotYetStarted()) throw new IllegalStateException("Voucher chưa đến thời gian sử dụng.");
        if (v.isExpired()) throw new IllegalStateException("Voucher đã hết hạn.");
        if (v.isExhausted()) throw new IllegalStateException("Voucher đã hết lượt sử dụng.");

        int userUsageCount = voucherUsageRepo.countByVoucherIdAndUserId(v.getId(), userId);
        int allowedPerUser = v.getMaxUsagePerUser() != null ? v.getMaxUsagePerUser() : 1;
        if (userUsageCount >= allowedPerUser)
            throw new IllegalStateException("User đã sử dụng tối đa số lần cho voucher này.");

        VoucherUsage usage = new VoucherUsage();
        usage.setVoucherId(v.getId());
        usage.setUserId(userId);
        usage.setOrderId(orderId);
        voucherUsageRepo.save(usage);

        v.setUsageCount(v.getUsageCount() + 1);
        voucherRepo.save(v);
    }

    private BigDecimal calculateDiscount(Voucher v, BigDecimal orderAmount) {
        BigDecimal discount;
        if ("PERCENT".equals(v.getDiscountType())) {
            discount = orderAmount.multiply(v.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (v.getMaxDiscountAmount() != null && discount.compareTo(v.getMaxDiscountAmount()) > 0) {
                discount = v.getMaxDiscountAmount();
            }
        } else {
            discount = v.getDiscountValue();
        }
        // Không giảm hơn giá trị đơn hàng
        if (discount.compareTo(orderAmount) > 0) discount = orderAmount;
        return discount;
    }

    private void validateVoucherRequest(VoucherRequest req) {
        if (req.getCode() == null || req.getCode().trim().isEmpty())
            throw new IllegalArgumentException("Mã voucher không được để trống.");
        if (!"PERCENT".equals(req.getDiscountType()) && !"AMOUNT".equals(req.getDiscountType()))
            throw new IllegalArgumentException("discountType phải là PERCENT hoặc AMOUNT.");
        if (req.getDiscountValue() == null || req.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        if (req.getStartsAt() != null && req.getExpiresAt() != null && !req.getExpiresAt().isAfter(req.getStartsAt()))
            throw new IllegalArgumentException("Thời gian hết hạn phải sau thời gian bắt đầu.");
    }

    private Voucher applyVoucherFields(Voucher v, VoucherRequest req) {
        v.setCode(req.getCode().trim().toUpperCase());
        v.setDescription(req.getDescription());
        v.setDiscountType(req.getDiscountType());
        v.setDiscountValue(req.getDiscountValue());
        v.setMinOrderAmount(req.getMinOrderAmount());
        v.setMaxDiscountAmount(req.getMaxDiscountAmount());
        v.setMaxUsage(req.getMaxUsage());
        v.setMaxUsagePerUser(req.getMaxUsagePerUser() != null ? req.getMaxUsagePerUser() : 1);
        v.setStartsAt(req.getStartsAt());
        v.setExpiresAt(req.getExpiresAt());
        v.setActive(req.getActive() != null ? req.getActive() : true);
        return v;
    }

    // =========================================================
    // PROMO BANNER
    // =========================================================

    @Transactional(readOnly = true)
    public List<PromoBanner> listAllBanners() {
        return promoBannerRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<PromoBanner> listActiveBanners() {
        return promoBannerRepo.findActiveBanners(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public PromoBanner getBannerById(Long id) {
        return promoBannerRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy banner #" + id));
    }

    public PromoBanner createBanner(PromoBanner banner, String performedBy) {
        banner.setCreatedBy(performedBy);
        return promoBannerRepo.save(banner);
    }

    public PromoBanner updateBanner(Long id, PromoBanner patch, String performedBy) {
        PromoBanner b = promoBannerRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy banner #" + id));
        if (patch.getTitle() != null) b.setTitle(patch.getTitle());
        if (patch.getImageUrl() != null) b.setImageUrl(patch.getImageUrl());
        if (patch.getLinkUrl() != null) b.setLinkUrl(patch.getLinkUrl());
        if (patch.getPosition() != null) b.setPosition(patch.getPosition());
        if (patch.getActive() != null) b.setActive(patch.getActive());
        if (patch.getStartAt() != null) b.setStartAt(patch.getStartAt());
        if (patch.getEndAt() != null) b.setEndAt(patch.getEndAt());
        b.setUpdatedBy(performedBy);
        return promoBannerRepo.save(b);
    }

    public void deleteBanner(Long id) {
        PromoBanner b = promoBannerRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy banner #" + id));
        promoBannerRepo.delete(b);
    }
}
