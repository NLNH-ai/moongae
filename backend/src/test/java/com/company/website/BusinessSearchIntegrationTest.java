package com.company.website;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.company.website.entity.AdminUser;
import com.company.website.entity.BusinessArea;
import com.company.website.entity.enums.AdminRole;
import com.company.website.repository.AdminUserRepository;
import com.company.website.repository.BusinessAreaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BusinessSearchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessAreaRepository businessAreaRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        businessAreaRepository.deleteAll();
        adminUserRepository.deleteAll();

        BusinessArea activeBusiness = new BusinessArea();
        activeBusiness.setTitle("Energy Solutions");
        activeBusiness.setSubtitle("Renewable operations portfolio");
        activeBusiness.setDescription("Integrated energy transition platform");
        activeBusiness.setDisplayOrder(1);
        activeBusiness.setActive(true);
        businessAreaRepository.save(activeBusiness);

        BusinessArea hiddenBusiness = new BusinessArea();
        hiddenBusiness.setTitle("Digital Platform");
        hiddenBusiness.setSubtitle("Internal beta program");
        hiddenBusiness.setDescription("Connected data and orchestration services");
        hiddenBusiness.setDisplayOrder(2);
        hiddenBusiness.setActive(false);
        businessAreaRepository.save(hiddenBusiness);

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername("superadmin");
        adminUser.setPassword(passwordEncoder.encode("admin1234"));
        adminUser.setName("Admin User");
        adminUser.setRole(AdminRole.SUPER_ADMIN);
        adminUserRepository.save(adminUser);
    }

    @Test
    void publicBusinessSearchReturnsOnlyActiveMatches() throws Exception {
        mockMvc.perform(get("/api/business")
                        .param("keyword", "energy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Energy Solutions"));

        mockMvc.perform(get("/api/business")
                        .param("keyword", "digital"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void adminBusinessSearchSupportsKeywordAndStatusFilters() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/admin/business")
                        .header("Authorization", bearer(token))
                        .param("keyword", "platform")
                        .param("isActive", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.items[0].title").value("Digital Platform"))
                .andExpect(jsonPath("$.data.items[0].isActive").value(false));

        mockMvc.perform(get("/api/admin/business")
                        .header("Authorization", bearer(token))
                        .param("isActive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.items[0].title").value("Energy Solutions"));
    }

    private String loginAndGetToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "superadmin",
                                  "password": "admin1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.at("/data/accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
