package com.company.website.dto;

import java.util.List;
import org.springframework.data.domain.Page;

public final class AdminListDto {

    private AdminListDto() {
    }

    public record PageResponse<T>(
            List<T> items,
            int page,
            int size,
            long totalElements,
            int totalPages,
            String sortBy,
            String sortDirection,
            boolean hasNext,
            boolean hasPrevious
    ) {
        public static <T> PageResponse<T> from(Page<T> page, String sortBy, String sortDirection) {
            return new PageResponse<>(
                    page.getContent(),
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages(),
                    sortBy,
                    sortDirection,
                    page.hasNext(),
                    page.hasPrevious()
            );
        }
    }
}
