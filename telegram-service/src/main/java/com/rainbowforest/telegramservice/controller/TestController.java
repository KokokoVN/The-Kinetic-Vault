package com.rainbowforest.telegramservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rainbowforest.telegramservice.client.ProductClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    private static final Logger log = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private ProductClient productClient;

    @GetMapping("/test-products")
    public String testProducts() {
        try {
            JsonNode productsNode = productClient.getProducts(0, 5, null);
            return productsNode.toString();
        } catch (Exception e) {
            log.error("Lỗi test-products: ", e);
            return "ERROR: " + e.toString() + " | MSG: " + e.getMessage();
        }
    }
}
