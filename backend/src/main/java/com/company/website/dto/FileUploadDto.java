package com.company.website.dto;

import com.company.website.entity.FileUpload;
import java.time.LocalDateTime;

public final class FileUploadDto {

    private FileUploadDto() {
    }

    public record Response(
            Long id,
            String originalName,
            String storedName,
            String filePath,
            Long fileSize,
            String contentType,
            LocalDateTime createdAt
    ) {
        public static Response from(FileUpload fileUpload) {
            return new Response(
                    fileUpload.getId(),
                    fileUpload.getOriginalName(),
                    fileUpload.getStoredName(),
                    fileUpload.getFilePath(),
                    fileUpload.getFileSize(),
                    fileUpload.getContentType(),
                    fileUpload.getCreatedAt()
            );
        }
    }
}
