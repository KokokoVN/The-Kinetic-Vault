package com.rainbowforest.recommendationservice.model;

import javax.persistence.*;

@Entity
@Table (name = "recommendation")
public class Recommendation extends AuditableEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Column (name = "rating")
    private int rating;

    @ManyToOne (cascade = CascadeType.ALL)
    @JoinColumn (name = "product_id")
    private Product product;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 120)
    private String userName;
    
    public Recommendation() {
	
	}

	public Recommendation(int rating, Product product, Long userId, String userName) {
        this.rating = rating;
        this.product = product;
        this.userId = userId;
        this.userName = userName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
