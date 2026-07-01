package com.rainbowforest.reviewservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ReviewMediaWebConfig implements WebMvcConfigurer {

    private static final Path REVIEW_MEDIA_DIR = Paths.get("uploads", "review-media").toAbsolutePath().normalize();

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = REVIEW_MEDIA_DIR.toUri().toString();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}
