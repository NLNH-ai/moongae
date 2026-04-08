package com.company.website.dto;

import com.company.website.config.AdminPrincipal;
import com.company.website.entity.AdminUser;
import com.company.website.entity.enums.AdminRole;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class AdminAuthDto {

    private AdminAuthDto() {
    }

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }

    public record LoginResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            MeResponse admin
    ) {
    }

    public record MeResponse(
            Long id,
            String username,
            String name,
            AdminRole role,
            LocalDateTime lastLoginAt,
            LocalDateTime createdAt
    ) {
        public static MeResponse from(AdminUser adminUser) {
            return new MeResponse(
                    adminUser.getId(),
                    adminUser.getUsername(),
                    adminUser.getName(),
                    adminUser.getRole(),
                    adminUser.getLastLoginAt(),
                    adminUser.getCreatedAt()
            );
        }

        public static MeResponse from(AdminPrincipal principal) {
            return new MeResponse(
                    principal.getId(),
                    principal.getUsername(),
                    principal.getName(),
                    principal.getRole(),
                    null,
                    null
            );
        }
    }
}
