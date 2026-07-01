package com.rainbowforest.orderservice;

import com.rainbowforest.activitylog.client.ActivityLogFeignClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"com.rainbowforest.orderservice", "com.rainbowforest.activitylog"})
@EnableEurekaClient
@EnableJpaRepositories
@EnableFeignClients(basePackageClasses = {
        com.rainbowforest.orderservice.feignclient.UserClient.class,
        com.rainbowforest.orderservice.feignclient.CartClient.class,
        com.rainbowforest.orderservice.feignclient.PaymentClient.class,
        com.rainbowforest.orderservice.feignclient.NotificationClient.class,
        com.rainbowforest.orderservice.feignclient.InventoryClient.class,
        com.rainbowforest.orderservice.client.SaleClient.class,
        ActivityLogFeignClient.class
})
@EnableWebSecurity
public class OrderServiceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
