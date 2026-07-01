package com.rainbowforest.paymentservice;

import com.rainbowforest.activitylog.client.ActivityLogFeignClient;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = {"com.rainbowforest.paymentservice", "com.rainbowforest.activitylog"})
@EnableEurekaClient
@EnableJpaRepositories
@EnableFeignClients(basePackageClasses = {
        ActivityLogFeignClient.class,
        com.rainbowforest.paymentservice.feignclient.OrderClient.class
})
public class PaymentServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}
