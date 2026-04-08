package com.company.website.service;

import com.company.website.config.AdminPrincipal;
import com.company.website.config.JwtTokenProvider;
import com.company.website.dto.AdminAuthDto;
import com.company.website.entity.AdminUser;
import com.company.website.exception.CustomException;
import com.company.website.repository.AdminUserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AdminAuthDto.LoginResponse login(AdminAuthDto.LoginRequest request) {
        AdminUser adminUser = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), adminUser.getPassword())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        adminUser.setLastLoginAt(LocalDateTime.now());
        AdminPrincipal principal = AdminPrincipal.from(adminUser);

        return new AdminAuthDto.LoginResponse(
                jwtTokenProvider.generateToken(principal),
                "Bearer",
                jwtTokenProvider.getExpiration(),
                AdminAuthDto.MeResponse.from(adminUser)
        );
    }

    public AdminAuthDto.MeResponse me(String username) {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("관리자 정보를 찾을 수 없습니다."));
        return AdminAuthDto.MeResponse.from(adminUser);
    }
}
