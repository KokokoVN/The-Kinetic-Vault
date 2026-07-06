package com.rainbowforest.reviewservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ReviewMediaWebConfig implements WebMvcConfigurer {

    private static Path getRootUploadPath(String subDir) {
        Path path = Paths.get(System.getProperty("user.dir"));
        if (path.getFileName().toString().endsWith("-service")) {
            path = path.getParent();
        }
        return path.resolve("uploads").resolve(subDir).toAbsolutePath().normalize();
    }
    private static final Path REVIEW_MEDIA_DIR = getRootUploadPath("review-media");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = REVIEW_MEDIA_DIR.toUri().toString();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}
