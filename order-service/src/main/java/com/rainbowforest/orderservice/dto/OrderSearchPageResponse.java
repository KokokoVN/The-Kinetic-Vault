package com.rainbowforest.orderservice.dto;

import com.rainbowforest.orderservice.domain.Order;

import java.util.ArrayList;
import java.util.List;

public class OrderSearchPageResponse {
    private List<Order> items = new ArrayList<>();
    private int page;
    private int size;
    private long totalItems;
    private int totalPages;

    public List<Order> getItems() {
        return items;
    }

    public void setItems(List<Order> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
