package com.rainbowforest.orderservice.feignclient;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.dto.CodCheckoutRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "cart-service", url = "http://localhost:8821/")
public interface CartClient {
    @GetMapping(value = "/cart")
    List<Item> getCart(@RequestHeader(value = "Cookie") String cartId);

    @DeleteMapping(value = "/cart/clear")
    void clearCart(@RequestHeader(value = "Cookie") String cartId);

    @DeleteMapping(value = "/cart/selected")
    void removeSelected(
            @RequestHeader(value = "Cookie") String cartId,
            @RequestBody RemoveSelectedRequest request
    );

    @PostMapping(value = "/cart/selected/remove")
    void removeSelectedViaPost(
            @RequestHeader(value = "Cookie") String cartId,
            @RequestBody RemoveSelectedRequest request
    );

    class RemoveSelectedRequest {
        public List<CodCheckoutRequest.SelectedCartItem> items;
    }
}
