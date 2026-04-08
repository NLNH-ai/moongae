package com.company.website.dto;

import com.company.website.entity.CompanyInfo;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class CompanyDto {

    private CompanyDto() {
    }

    public record Response(
            Long id,
            String companyName,
            String ceoName,
            LocalDate establishedDate,
            String address,
            String phone,
            String email,
            String description,
            String logoUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static Response from(CompanyInfo companyInfo) {
            return new Response(
                    companyInfo.getId(),
                    companyInfo.getCompanyName(),
                    companyInfo.getCeoName(),
                    companyInfo.getEstablishedDate(),
                    companyInfo.getAddress(),
                    companyInfo.getPhone(),
                    companyInfo.getEmail(),
                    companyInfo.getDescription(),
                    companyInfo.getLogoUrl(),
                    companyInfo.getCreatedAt(),
                    companyInfo.getUpdatedAt()
            );
        }
    }
}
