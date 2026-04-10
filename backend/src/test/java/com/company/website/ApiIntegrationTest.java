package com.company.website;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.company.website.entity.AdminUser;
import com.company.website.entity.BusinessArea;
import com.company.website.entity.CompanyInfo;
import com.company.website.entity.History;
import com.company.website.entity.PageContent;
import com.company.website.entity.enums.AdminRole;
import com.company.website.entity.enums.PageKey;
import com.company.website.repository.AdminUserRepository;
import com.company.website.repository.BusinessAreaRepository;
import com.company.website.repository.CompanyInfoRepository;
import com.company.website.repository.FileUploadRepository;
import com.company.website.repository.HistoryRepository;
import com.company.website.repository.PageContentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Comparator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompanyInfoRepository companyInfoRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private BusinessAreaRepository businessAreaRepository;

    @Autowired
    private PageContentRepository pageContentRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private FileUploadRepository fileUploadRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long publicHistoryId;
    private Long businessId;
    private Long contentId;

    @BeforeEach
    void setUp() throws IOException {
        cleanUploadDir();
        fileUploadRepository.deleteAll();
        pageContentRepository.deleteAll();
        historyRepository.deleteAll();
        businessAreaRepository.deleteAll();
        companyInfoRepository.deleteAll();
        adminUserRepository.deleteAll();

        CompanyInfo companyInfo = new CompanyInfo();
        companyInfo.setCompanyName("Company Logo");
        companyInfo.setCeoName("Kim Dohyun");
        companyInfo.setEstablishedDate(LocalDate.of(1998, 4, 8));
        companyInfo.setAddress("Seoul, Korea");
        companyInfo.setPhone("02-1234-5678");
        companyInfo.setEmail("contact@example.com");
        companyInfo.setDescription("Corporate website");
        companyInfo.setLogoUrl("/uploads/images/logo/company-logo.svg");
        companyInfoRepository.save(companyInfo);

        History history = new History();
        history.setYear(2025);
        history.setMonth(3);
        history.setTitle("Future energy brand launch");
        history.setDescription("Unified operations brand rollout");
        history.setImageUrl("/uploads/images/history/brand.jpg");
        history.setDisplayOrder(1);
        history.setActive(true);
        publicHistoryId = historyRepository.save(history).getId();

        History hiddenHistory = new History();
        hiddenHistory.setYear(2024);
        hiddenHistory.setMonth(1);
        hiddenHistory.setTitle("Hidden milestone");
        hiddenHistory.setDescription("Staged record");
        hiddenHistory.setDisplayOrder(2);
        hiddenHistory.setActive(false);
        historyRepository.save(hiddenHistory);

        BusinessArea businessArea = new BusinessArea();
        businessArea.setTitle("Energy Solutions");
        businessArea.setSubtitle("Sustainable transition");
        businessArea.setDescription("Business description");
        businessArea.setIconUrl("/uploads/icons/energy.svg");
        businessArea.setImageUrl("/uploads/images/business/energy.jpg");
        businessArea.setDisplayOrder(1);
        businessArea.setActive(true);
        businessId = businessAreaRepository.save(businessArea).getId();

        BusinessArea hiddenBusinessArea = new BusinessArea();
        hiddenBusinessArea.setTitle("Digital Platform");
        hiddenBusinessArea.setSubtitle("Internal line");
        hiddenBusinessArea.setDescription("Hidden business description");
        hiddenBusinessArea.setDisplayOrder(2);
        hiddenBusinessArea.setActive(false);
        businessAreaRepository.save(hiddenBusinessArea);

        PageContent pageContent = new PageContent();
        pageContent.setPageKey(PageKey.HOME);
        pageContent.setSectionKey("hero");
        pageContent.setTitle("Main hero");
        pageContent.setContent("Opening message");
        pageContent.setImageUrl("/uploads/images/content/home-hero.jpg");
        pageContent.setDisplayOrder(1);
        pageContent.setActive(true);
        contentId = pageContentRepository.save(pageContent).getId();

        AdminUser superAdmin = new AdminUser();
        superAdmin.setUsername("superadmin");
        superAdmin.setPassword(passwordEncoder.encode("admin1234"));
        superAdmin.setName("Super Admin");
        superAdmin.setRole(AdminRole.SUPER_ADMIN);
        adminUserRepository.save(superAdmin);

        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin1234"));
        admin.setName("Content Admin");
        admin.setRole(AdminRole.ADMIN);
        adminUserRepository.save(admin);
    }

    @AfterEach
    void tearDown() throws IOException {
        cleanUploadDir();
    }

    @Test
    void publicApisReturnStructuredResponses() throws Exception {
        mockMvc.perform(get("/api/company"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.companyName").value("Company Logo"));

        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].year").value(2025))
                .andExpect(jsonPath("$.data[0].items[0].title").value("Future energy brand launch"))
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/history/{id}", publicHistoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(publicHistoryId));

        mockMvc.perform(get("/api/business/{id}", businessId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Energy Solutions"));

        mockMvc.perform(get("/api/content/HOME/hero"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(contentId));
    }

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/admin/history")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "year": 2026,
                                  "month": 4,
                                  "title": "New history",
                                  "description": "Description",
                                  "imageUrl": "/uploads/a.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminLoginAndMeEndpointWork() throws Exception {
        String token = loginAndGetToken("superadmin", "admin1234");

        mockMvc.perform(get("/api/admin/me")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("superadmin"))
                .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"));
    }

    @Test
    void adminListEndpointsSupportFiltersAndPagination() throws Exception {
        String token = loginAndGetToken("superadmin", "admin1234");

        mockMvc.perform(get("/api/admin/history")
                        .header("Authorization", bearer(token))
                        .param("keyword", "brand")
                        .param("isActive", "true")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "updatedAt")
                        .param("sortDirection", "DESC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.sortBy").value("updatedAt"));

        mockMvc.perform(get("/api/admin/business")
                        .header("Authorization", bearer(token))
                        .param("keyword", "energy")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "displayOrder")
                        .param("sortDirection", "ASC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.totalElements").value(1));

        mockMvc.perform(get("/api/admin/content")
                        .header("Authorization", bearer(token))
                        .param("pageKey", "HOME")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].sectionKey").value("hero"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void superAdminCrudEndpointsWork() throws Exception {
        String token = loginAndGetToken("superadmin", "admin1234");

        MvcResult createHistoryResult = mockMvc.perform(post("/api/admin/history")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "year": 2026,
                                  "month": 4,
                                  "title": "New history",
                                  "description": "Description",
                                  "imageUrl": "/uploads/images/history/new.jpg",
                                  "displayOrder": 3,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("New history"))
                .andReturn();

        long createdHistoryId = readId(createHistoryResult);

        mockMvc.perform(put("/api/admin/history/{id}", createdHistoryId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "year": 2026,
                                  "month": 5,
                                  "title": "Updated history",
                                  "description": "Updated description",
                                  "imageUrl": "/uploads/images/history/updated.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated history"));

        mockMvc.perform(patch("/api/admin/history/order")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "items": [
                                    { "id": %d, "displayOrder": 5 },
                                    { "id": %d, "displayOrder": 1 }
                                  ]
                                }
                                """.formatted(publicHistoryId, createdHistoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(createdHistoryId));

        MvcResult createBusinessResult = mockMvc.perform(post("/api/admin/business")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Digital Platform",
                                  "subtitle": "Operations layer",
                                  "description": "Platform description",
                                  "iconUrl": "/uploads/icons/platform.svg",
                                  "imageUrl": "/uploads/images/business/platform.jpg",
                                  "displayOrder": 2,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        long createdBusinessId = readId(createBusinessResult);

        mockMvc.perform(put("/api/admin/business/{id}", createdBusinessId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Digital Platform Updated",
                                  "subtitle": "Operations layer extended",
                                  "description": "Platform description updated",
                                  "iconUrl": "/uploads/icons/platform.svg",
                                  "imageUrl": "/uploads/images/business/platform-v2.jpg",
                                  "displayOrder": 2,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Digital Platform Updated"));

        mockMvc.perform(put("/api/admin/content/{id}", contentId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated hero",
                                  "content": "Updated message",
                                  "imageUrl": "/uploads/images/content/hero-v2.jpg",
                                  "displayOrder": 1,
                                  "isActive": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));

        mockMvc.perform(delete("/api/admin/business/{id}", createdBusinessId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(delete("/api/admin/history/{id}", createdHistoryId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void adminRoleCannotDeleteOrReorderAndCannotChangeContentVisibility() throws Exception {
        String token = loginAndGetToken("admin", "admin1234");

        mockMvc.perform(delete("/api/admin/history/{id}", publicHistoryId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/admin/business/{id}", businessId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/admin/history/order")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "items": [
                                    { "id": %d, "displayOrder": 5 }
                                  ]
                                }
                                """.formatted(publicHistoryId)))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/content/{id}", contentId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated hero",
                                  "content": "Draft content update",
                                  "imageUrl": "/uploads/images/content/hero-v2.jpg",
                                  "displayOrder": 1,
                                  "isActive": false
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/admin/content/{id}", contentId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated hero",
                                  "content": "Draft content update",
                                  "imageUrl": "/uploads/images/content/hero-v2.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated hero"))
                .andExpect(jsonPath("$.data.isActive").value(true));
    }

    @Test
    void uploadEndpointStoresAndDeletesImages() throws Exception {
        String token = loginAndGetToken("superadmin", "admin1234");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "hero.jpg",
                "image/jpeg",
                "test-image".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/admin/upload")
                        .file(file)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.originalName").value("hero.jpg"))
                .andReturn();

        JsonNode uploadJson = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        long fileId = uploadJson.at("/data/id").asLong();
        String filePath = uploadJson.at("/data/filePath").asText();
        Path storedPath = Paths.get("build/test-uploads").resolve(filePath.replaceFirst("^/uploads/", ""));

        org.assertj.core.api.Assertions.assertThat(Files.exists(storedPath)).isTrue();

        mockMvc.perform(delete("/api/admin/upload/{id}", fileId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        org.assertj.core.api.Assertions.assertThat(Files.exists(storedPath)).isFalse();
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.at("/data/accessToken").asText();
    }

    private long readId(MvcResult result) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.at("/data/id").asLong();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private void cleanUploadDir() throws IOException {
        Path uploadDir = Paths.get("build/test-uploads");
        if (!Files.exists(uploadDir)) {
            return;
        }

        try (var paths = Files.walk(uploadDir)) {
            paths.sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException exception) {
                            throw new RuntimeException(exception);
                        }
                    });
        }
    }
}
