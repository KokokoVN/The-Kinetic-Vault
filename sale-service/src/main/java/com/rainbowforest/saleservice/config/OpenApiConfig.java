package com.rainbowforest.saleservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI saleServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sale Service API")
                        .description("API quản lý chương trình khuyến mãi, voucher giảm giá và banner quảng cáo — The Kinetic Vault E-commerce")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("RainbowForest Dev Team")
                                .email("dev@rainbowforest.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8870").description("Local Development"),
                        new Server().url("http://localhost:8900/api/sales").description("Via API Gateway")
                ));
    }
}
