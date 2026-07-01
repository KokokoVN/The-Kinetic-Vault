package com.rainbowforest.reviewservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long productId;

    private Long variantId;

    private String variantLabel;

    @Column(nullable = false)
    private int rating;

    @Column(length = 2000)
    private String content;

    private String status; // e.g. ACTIVE, HIDDEN

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewMedia> mediaList;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewResponse> responses;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewEditHistory> editHistories;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
