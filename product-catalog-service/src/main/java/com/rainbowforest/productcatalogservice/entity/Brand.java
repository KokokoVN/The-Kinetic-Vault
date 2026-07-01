package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Entity
@Table(name = "brands")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Brand extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(name = "name", length = 120, nullable = false, unique = true)
    private String name;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @Size(max = 1024)
    @Column(name = "logo_url", length = 1024)
    private String logoUrl;

    public Brand() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
