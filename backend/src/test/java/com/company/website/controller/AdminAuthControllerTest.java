package com.company.website.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.company.website.config.AdminPrincipal;
import com.company.website.dto.AdminAuthDto;
import com.company.website.entity.AdminUser;
import com.company.website.entity.enums.AdminRole;
import com.company.website.exception.GlobalExceptionHandler;
import com.company.website.service.AdminAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AdminAuthControllerTest {

    @Mock
    private AdminAuthService adminAuthService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminAuthController(adminAuthService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void loginReturnsTokenPayload() throws Exception {
        when(adminAuthService.login(new AdminAuthDto.LoginRequest("superadmin", "admin1234")))
                .thenReturn(new AdminAuthDto.LoginResponse(
                        "jwt-token",
                        "Bearer",
                        86_400_000L,
                        new AdminAuthDto.MeResponse(1L, "superadmin", "Admin", AdminRole.SUPER_ADMIN, null, null)
                ));

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "superadmin",
                                  "password": "admin1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.data.admin.username").value("superadmin"));
    }

    @Test
    void loginRejectsBlankCredentials() throws Exception {
        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.username").exists())
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void meReturnsPrincipalProfile() throws Exception {
        AdminUser adminUser = new AdminUser();
        ReflectionTestUtils.setField(adminUser, "id", 1L);
        adminUser.setUsername("superadmin");
        adminUser.setPassword("encoded");
        adminUser.setName("Admin");
        adminUser.setRole(AdminRole.SUPER_ADMIN);
        AdminPrincipal principal = AdminPrincipal.from(adminUser);

        when(adminAuthService.me("superadmin"))
                .thenReturn(new AdminAuthDto.MeResponse(1L, "superadmin", "Admin", AdminRole.SUPER_ADMIN, null, null));

        var response = new AdminAuthController(adminAuthService).me(principal);

        org.assertj.core.api.Assertions.assertThat(response.success()).isTrue();
        org.assertj.core.api.Assertions.assertThat(response.data().username()).isEqualTo("superadmin");
        org.assertj.core.api.Assertions.assertThat(response.data().role()).isEqualTo(AdminRole.SUPER_ADMIN);
    }
}
