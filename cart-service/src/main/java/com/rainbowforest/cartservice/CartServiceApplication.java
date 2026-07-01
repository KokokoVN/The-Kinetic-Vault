package com.rainbowforest.cartservice;

import com.rainbowforest.activitylog.client.ActivityLogFeignClient;
import com.rainbowforest.cartservice.feignclient.ProductClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"com.rainbowforest.cartservice", "com.rainbowforest.activitylog"})
@EnableEurekaClient
@EnableFeignClients(basePackageClasses = {ProductClient.class, ActivityLogFeignClient.class})
@EnableWebSecurity
public class CartServiceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(CartServiceApplication.class, args);
    }
}
