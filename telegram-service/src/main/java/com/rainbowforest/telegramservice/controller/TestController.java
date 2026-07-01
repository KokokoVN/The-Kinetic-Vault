package com.rainbowforest.telegramservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rainbowforest.telegramservice.client.ProductClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private ProductClient productClient;

    @GetMapping("/test-products")
    public String testProducts() {
        try {
            JsonNode productsNode = productClient.getProducts(0, 5, null);
            return productsNode.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "ERROR: " + e.toString() + " | MSG: " + e.getMessage();
        }
    }
}
