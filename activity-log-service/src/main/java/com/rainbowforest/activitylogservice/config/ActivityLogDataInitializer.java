package com.rainbowforest.activitylogservice.config;

import com.rainbowforest.activitylogservice.entity.WebActivity;
import com.rainbowforest.activitylogservice.repository.WebActivityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class ActivityLogDataInitializer implements CommandLineRunner {

    private final WebActivityRepository webActivityRepository;

    public ActivityLogDataInitializer(WebActivityRepository webActivityRepository) {
        this.webActivityRepository = webActivityRepository;
    }

    @Override
    public void run(String... args) {
        if (webActivityRepository.count() > 0) {
            return;
        }

        save("1", "admin", "PRODUCT_CREATE", "Product", "101", "POST", "/catalog/admin/products");
        save("1", "admin", "ORDER_STATUS_UPDATE", "Order", "10001", "PATCH", "/shop/orders/10001/status");
        save("2", "staff01", "CART_ITEM_UPSERT", "Cart", "cart:demo-user-01", "POST", "/shop/cart");
        save("3", "alice", "LOGIN_SUCCESS", "Auth", "alice", "POST", "/users/login");
    }

    private void save(
            String actorUserId,
            String actorUsername,
            String action,
            String resourceType,
            String resourceId,
            String httpMethod,
            String requestPath
    ) {
        WebActivity row = new WebActivity();
        row.setActorUserId(actorUserId);
        row.setActorUsername(actorUsername);
        row.setAction(action);
        row.setResourceType(resourceType);
        row.setResourceId(resourceId);
        row.setHttpMethod(httpMethod);
        row.setRequestPath(requestPath);
        row.setIpAddress("127.0.0.1");
        row.setUserAgent("seed-agent");
        row.setDetailJson("{\"seed\":true}");
        webActivityRepository.save(row);
    }
}
