package com.rainbowforest.orderservice.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table (name = "orders")
public class Order extends AuditableEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, length = 48)
    private String orderNumber;

    @Column (name = "ordered_date")
    @NotNull
    private LocalDate orderedDate;

    @Column(name = "status")
    @NotNull
    private String status;

    @Column(name = "payment_status", length = 32)
    private String paymentStatus;

    @Column(name = "payment_method", length = 32)
    private String paymentMethod;

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "mvd", unique = true, length = 32)
    private String mvd;

    @Column(name = "phone_last4", length = 4)
    private String phoneLast4;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 120)
    private String userName;

    @Column (name = "total")
    private BigDecimal total;

    @ManyToMany (cascade = CascadeType.ALL)
    @JoinTable (name = "order_items" , joinColumns = @JoinColumn(name = "order_id"), inverseJoinColumns = @JoinColumn (name = "item_id"))
    private List<Item> items;

    @PrePersist
    public void onCreate() {
        if (orderNumber == null || orderNumber.isEmpty()) {
            orderNumber = UUID.randomUUID().toString();
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING.name();
        }
        if (paymentMethod == null) {
            paymentMethod = PaymentMethod.COD.name();
        }
    }

	public Order() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getOrderedDate() {
		return orderedDate;
	}

	public void setOrderedDate(LocalDate orderedDate) {
		this.orderedDate = orderedDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getMvd() {
        return mvd;
    }

    public void setMvd(String mvd) {
        this.mvd = mvd;
    }

    public String getPhoneLast4() {
        return phoneLast4;
    }

    public void setPhoneLast4(String phoneLast4) {
        this.phoneLast4 = phoneLast4;
    }

    public LocalDate getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
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

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public List<Item> getItems() {
		return items;
	}

	public void setItems(List<Item> items) {
		this.items = items;
	}

}
