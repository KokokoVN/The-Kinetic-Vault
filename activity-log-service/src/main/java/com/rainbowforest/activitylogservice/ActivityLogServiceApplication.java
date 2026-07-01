package com.rainbowforest.activitylogservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import java.util.TimeZone;

@SpringBootApplication
@EnableEurekaClient
@EnableJpaRepositories
public class ActivityLogServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(ActivityLogServiceApplication.class, args);
    }
}
