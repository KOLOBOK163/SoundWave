// com.example.SoundWave.config.WebConfig
package com.example.SoundWave.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/F:/SoundWave/SoundWave/uploads/");
        registry.addResourceHandler("/uploads/tracks/**")
                .addResourceLocations("file:/F:/SoundWave/SoundWave/uploads/tracks/");
    }
}