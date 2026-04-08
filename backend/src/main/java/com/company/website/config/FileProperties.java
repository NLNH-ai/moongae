package com.company.website.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "file")
public record FileProperties(
        String uploadDir,
        List<String> allowedImageTypes
) {
}
