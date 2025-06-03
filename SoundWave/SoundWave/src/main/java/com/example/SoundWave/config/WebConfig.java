// com.example.SoundWave.config.WebConfig
package com.example.SoundWave.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {


        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./" + uploadPath + "/");

        registry.addResourceHandler("/uploads/avatarsUsers/**")
                .addResourceLocations("file:./" + uploadPath + "/avatarsUsers/");

        registry.addResourceHandler("/uploads/tracks/**")
                .addResourceLocations("file:./" + uploadPath + "/tracks/");

        registry.addResourceHandler("/uploads/tracks/covers/**")
                .addResourceLocations("file:./" + uploadPath + "/tracks/covers/");
    }
}