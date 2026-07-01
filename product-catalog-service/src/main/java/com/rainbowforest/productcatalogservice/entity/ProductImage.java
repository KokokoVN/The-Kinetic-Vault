package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "product_images")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductImage extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    /** URL công khai (CDN / static) để hiển thị. */
    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    /** Đường dẫn lưu file nội bộ (disk, object storage key). */
    @NotNull
    @Column(name = "storage_path", length = 1024)
    private String storagePath;

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "is_primary")
    private boolean primaryImage;

    /**
     * Loại media: "IMAGE" (mặc định) hoặc "VIDEO".
     * Giúp phân biệt ảnh và video trong danh sách media của sản phẩm.
     */
    @Column(name = "media_type", length = 32, nullable = false)
    private String mediaType = "IMAGE";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public boolean isPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(boolean primaryImage) {
        this.primaryImage = primaryImage;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType != null ? mediaType : "IMAGE";
    }
}
