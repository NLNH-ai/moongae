package com.company.website.util;

import java.util.UUID;
import org.springframework.util.StringUtils;

public final class FileStorageUtils {

    private FileStorageUtils() {
    }

    public static String sanitizeFilename(String originalFilename) {
        return StringUtils.cleanPath(originalFilename == null ? "file" : originalFilename);
    }

    public static String buildStoredName(String originalFilename) {
        String sanitized = sanitizeFilename(originalFilename);
        String extension = "";
        int extensionIndex = sanitized.lastIndexOf('.');
        if (extensionIndex >= 0) {
            extension = sanitized.substring(extensionIndex);
        }
        return UUID.randomUUID() + extension.toLowerCase();
    }
}
