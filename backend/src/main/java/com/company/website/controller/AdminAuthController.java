package com.company.website.controller;

import com.company.website.config.AdminPrincipal;
import com.company.website.dto.AdminAuthDto;
import com.company.website.dto.ApiResponse;
import com.company.website.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminAuthDto.LoginResponse>> login(
            @Valid @RequestBody AdminAuthDto.LoginRequest request
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(adminAuthService.login(request), "로그인 성공"));
    }

    @GetMapping("/me")
    public ApiResponse<AdminAuthDto.MeResponse> me(@AuthenticationPrincipal AdminPrincipal principal) {
        return ApiResponse.success(adminAuthService.me(principal.getUsername()), "조회 성공");
    }
}
