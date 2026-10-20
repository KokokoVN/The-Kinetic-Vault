package com.rainbowforest.inventoryservice.config;

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
    public OpenAPI inventoryServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Inventory Service API")
                        .description("API quản lý tồn kho, nhập kho, xuất kho và điều chỉnh kho — The Kinetic Vault E-commerce")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("RainbowForest Dev Team")
                                .email("dev@rainbowforest.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8820").description("Local Development"),
                        new Server().url("http://localhost:8900/api/inventory").description("Via API Gateway")
                ));
    }
}
