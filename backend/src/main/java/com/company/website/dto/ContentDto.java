package com.company.website.dto;

import com.company.website.entity.PageContent;
import com.company.website.entity.enums.PageKey;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public final class ContentDto {

    private ContentDto() {
    }

    public record Response(
            Long id,
            PageKey pageKey,
            String sectionKey,
            String title,
            String content,
            String imageUrl,
            Integer displayOrder,
            boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static Response from(PageContent pageContent) {
            return new Response(
                    pageContent.getId(),
                    pageContent.getPageKey(),
                    pageContent.getSectionKey(),
                    pageContent.getTitle(),
                    pageContent.getContent(),
                    pageContent.getImageUrl(),
                    pageContent.getDisplayOrder(),
                    pageContent.isActive(),
                    pageContent.getCreatedAt(),
                    pageContent.getUpdatedAt()
            );
        }
    }

    public record UpdateRequest(
            @NotBlank @Size(max = 150) String title,
            @NotBlank String content,
            @Size(max = 255) String imageUrl,
            @NotNull @Min(0) Integer displayOrder,
            @NotNull Boolean isActive
    ) {
    }
}
