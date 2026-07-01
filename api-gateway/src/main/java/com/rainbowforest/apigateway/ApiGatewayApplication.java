package com.rainbowforest.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import com.rainbowforest.apigateway.config.JwtGatewayProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import java.util.TimeZone;

@SpringBootApplication
@EnableEurekaClient
@EnableZuulProxy
@EnableFeignClients
@EnableConfigurationProperties(JwtGatewayProperties.class)
public class ApiGatewayApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
