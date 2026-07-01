package com.rainbowforest.reviewservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.util.TimeZone;

@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
public class ReviewServiceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(ReviewServiceApplication.class, args);
    }
}
