package com.company.website.dto;

import com.company.website.entity.BusinessArea;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public final class BusinessDto {

    private BusinessDto() {
    }

    public record Response(
            Long id,
            String title,
            String subtitle,
            String description,
            String iconUrl,
            String imageUrl,
            Integer displayOrder,
            boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static Response from(BusinessArea businessArea) {
            return new Response(
                    businessArea.getId(),
                    businessArea.getTitle(),
                    businessArea.getSubtitle(),
                    businessArea.getDescription(),
                    businessArea.getIconUrl(),
                    businessArea.getImageUrl(),
                    businessArea.getDisplayOrder(),
                    businessArea.isActive(),
                    businessArea.getCreatedAt(),
                    businessArea.getUpdatedAt()
            );
        }
    }

    public record UpsertRequest(
            @NotBlank @Size(max = 120) String title,
            @Size(max = 160) String subtitle,
            @NotBlank String description,
            @Size(max = 255) String iconUrl,
            @Size(max = 255) String imageUrl,
            @NotNull @Min(0) Integer displayOrder,
            @NotNull Boolean isActive
    ) {
    }
}
