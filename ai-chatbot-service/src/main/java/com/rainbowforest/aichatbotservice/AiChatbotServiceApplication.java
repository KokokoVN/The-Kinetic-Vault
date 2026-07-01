package com.rainbowforest.aichatbotservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.util.TimeZone;

@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients(basePackages = "com.rainbowforest.aichatbotservice.client")
public class AiChatbotServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(AiChatbotServiceApplication.class, args);
    }
}
