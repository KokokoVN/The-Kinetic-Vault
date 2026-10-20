package com.rainbowforest.productcatalogservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productCatalogOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Product Catalog Service API")
                        .description("API quản lý sản phẩm, danh mục, thương hiệu và biến thể sản phẩm — The Kinetic Vault E-commerce")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("RainbowForest Dev Team")
                                .email("dev@rainbowforest.com"))
                        .license(new License().name("Apache 2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8810").description("Local Development"),
                        new Server().url("http://localhost:8900/api/catalog").description("Via API Gateway")
                ));
    }
}
