package com.rainbowforest.productcatalogservice.utilities;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Utility kiểm tra an toàn File Upload (Item 16):
 * - Giới hạn kích thước tối đa 10MB
 * - Whitelist các định dạng file ảnh/video cho phép (.jpg, .jpeg, .png, .webp, .mp4, .xlsx)
 * - Kiểm tra Content-Type
 * - Kiểm tra magic bytes để chống bypass extension (vd upload shell.php.jpg)
 */
public class FileUploadValidationUtils {

    public static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    public static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".mp4"
    );

    public static final List<String> ALLOWED_EXCEL_EXTENSIONS = Arrays.asList(
            ".xlsx", ".xls"
    );

    /** Magic bytes cho phát hiện ảnh/video. */
    private static final byte[] JPEG_MAGIC = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] WEBP_RIFF = {'R', 'I', 'F', 'F'};
    private static final byte[] WEBP_WEBP = {'W', 'E', 'B', 'P'};
    private static final byte[] MP4_FTYP = {'f', 't', 'y', 'p'};
    /** Xlsx là ZIP với signature PK.. */
    private static final byte[] ZIP_MAGIC = {0x50, 0x4B, 0x03, 0x04};

    public static void validateImageOrVideoUpload(MultipartFile file) {
        validateCommonFile(file);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ.");
        }

        String lowerName = originalFilename.toLowerCase(Locale.ROOT);
        String ext = extractExtension(lowerName);
        boolean validExtension = ALLOWED_IMAGE_EXTENSIONS.contains(ext);
        if (!validExtension) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ. Chỉ chấp nhận các định dạng: .jpg, .jpeg, .png, .webp, .mp4");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.isEmpty()) {
            String lowerContent = contentType.toLowerCase(Locale.ROOT);
            boolean isVideo = ".mp4".equals(ext);
            if (isVideo && !lowerContent.startsWith("video/")) {
                throw new IllegalArgumentException("MIME-type không hợp lệ cho video: " + contentType);
            }
            if (!isVideo && !lowerContent.startsWith("image/")) {
                throw new IllegalArgumentException("MIME-type không hợp lệ cho ảnh: " + contentType);
            }
        }

        // Validate magic bytes.
        validateMagicBytes(file, ext);
    }

    public static void validateExcelUpload(MultipartFile file) {
        validateCommonFile(file);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ.");
        }

        String lowerName = originalFilename.toLowerCase(Locale.ROOT);
        String ext = extractExtension(lowerName);
        boolean validExtension = ALLOWED_EXCEL_EXTENSIONS.contains(ext);
        if (!validExtension) {
            throw new IllegalArgumentException("Định dạng file không hợp lệ. Chỉ chấp nhận file Excel (.xlsx, .xls)");
        }

        // Xlsx là ZIP - kiểm tra magic bytes.
        if (".xlsx".equals(ext)) {
            validateMagicBytes(file, ext);
        }
    }

    private static void validateCommonFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File upload không được để trống.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Dung lượng file vượt quá giới hạn tối đa cho phép (10MB).");
        }
    }

    private static String extractExtension(String lowerName) {
        int dotIdx = lowerName.lastIndexOf('.');
        if (dotIdx < 0 || dotIdx == lowerName.length() - 1) {
            return "";
        }
        return lowerName.substring(dotIdx);
    }

    /**
     * Kiểm tra magic bytes của file để chống bypass extension.
     * Throw IllegalArgumentException nếu không khớp.
     */
    private static void validateMagicBytes(MultipartFile file, String ext) {
        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int total = 0;
            int read;
            while (total < header.length && (read = is.read(header, total, header.length - total)) != -1) {
                total += read;
            }
            if (total < 4) {
                throw new IllegalArgumentException("File quá nhỏ hoặc không hợp lệ");
            }
            header = Arrays.copyOf(header, total);
        } catch (IOException e) {
            throw new IllegalArgumentException("Không đọc được file: " + e.getMessage());
        }
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                if (!startsWith(header, JPEG_MAGIC)) {
                    throw new IllegalArgumentException("Nội dung file không phải JPEG");
                }
                break;
            case ".png":
                if (!startsWith(header, PNG_MAGIC)) {
                    throw new IllegalArgumentException("Nội dung file không phải PNG");
                }
                break;
            case ".webp":
                if (!startsWith(header, WEBP_RIFF) || header.length < 12
                        || !startsWith(Arrays.copyOfRange(header, 8, 12), WEBP_WEBP)) {
                    throw new IllegalArgumentException("Nội dung file không phải WebP");
                }
                break;
            case ".mp4":
                if (header.length < 12 || !startsWith(Arrays.copyOfRange(header, 4, 8), MP4_FTYP)) {
                    throw new IllegalArgumentException("Nội dung file không phải MP4");
                }
                break;
            case ".xlsx":
                if (!startsWith(header, ZIP_MAGIC)) {
                    throw new IllegalArgumentException("Nội dung file không phải xlsx (ZIP)");
                }
                break;
            default:
                // Excel .xls có magic D0 CF 11 E0 - không kiểm tra strict.
                break;
        }
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data == null || prefix == null || data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    /**
     * Whitelist các extension cho phép - dùng chung.
     */
    public static Set<String> allowedImageExtensions() {
        return new java.util.HashSet<>(ALLOWED_IMAGE_EXTENSIONS);
    }
}