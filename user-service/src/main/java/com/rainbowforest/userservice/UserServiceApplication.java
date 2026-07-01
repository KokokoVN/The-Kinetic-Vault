package com.rainbowforest.userservice;

import com.rainbowforest.activitylog.client.ActivityLogFeignClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"com.rainbowforest.userservice", "com.rainbowforest.activitylog"})
@EnableJpaRepositories
@EnableEurekaClient
@EnableFeignClients(basePackageClasses = ActivityLogFeignClient.class)
@EnableScheduling
public class UserServiceApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
