package com.rainbowforest.recommendationservice;

import com.rainbowforest.activitylog.client.ActivityLogFeignClient;
import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"com.rainbowforest.recommendationservice", "com.rainbowforest.activitylog"})
@EnableFeignClients(basePackageClasses = {ProductClient.class, UserClient.class, ActivityLogFeignClient.class})
@EnableEurekaClient
@EnableJpaRepositories
public class ProductRecommendationServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(ProductRecommendationServiceApplication.class, args);
    }
}
