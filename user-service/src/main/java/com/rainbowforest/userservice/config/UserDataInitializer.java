package com.rainbowforest.userservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class UserDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Không tạo dữ liệu mẫu
    }
}