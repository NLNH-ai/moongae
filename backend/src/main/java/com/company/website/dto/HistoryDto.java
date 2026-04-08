package com.company.website.dto;

import com.company.website.entity.History;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public final class HistoryDto {

    private HistoryDto() {
    }

    public record Response(
            Long id,
            Integer year,
            Integer month,
            String title,
            String description,
            String imageUrl,
            Integer displayOrder,
            boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static Response from(History history) {
            return new Response(
                    history.getId(),
                    history.getYear(),
                    history.getMonth(),
                    history.getTitle(),
                    history.getDescription(),
                    history.getImageUrl(),
                    history.getDisplayOrder(),
                    history.isActive(),
                    history.getCreatedAt(),
                    history.getUpdatedAt()
            );
        }
    }

    public record YearGroupResponse(
            Integer year,
            List<Response> items
    ) {
    }

    public record UpsertRequest(
            @NotNull @Min(1900) @Max(2100) Integer year,
            @NotNull @Min(1) @Max(12) Integer month,
            @NotBlank @Size(max = 150) String title,
            @NotBlank String description,
            @Size(max = 255) String imageUrl,
            @NotNull @Min(0) Integer displayOrder,
            @NotNull Boolean isActive
    ) {
    }

    public record OrderItem(
            @NotNull Long id,
            @NotNull @Min(0) Integer displayOrder
    ) {
    }

    public record OrderUpdateRequest(
            @NotEmpty List<@Valid OrderItem> items
    ) {
    }
}
