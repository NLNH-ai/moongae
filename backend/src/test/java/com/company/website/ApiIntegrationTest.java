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
        companyInfo.setCompanyName("한화넥스트");
        companyInfo.setCeoName("김도현");
        companyInfo.setEstablishedDate(LocalDate.of(1998, 4, 8));
        companyInfo.setAddress("서울특별시 중구 세종대로 110");
        companyInfo.setPhone("02-1234-5678");
        companyInfo.setEmail("contact@hanwha-next.co.kr");
        companyInfo.setDescription("기업 소개");
        companyInfo.setLogoUrl("/uploads/images/logo/company-logo.svg");
        companyInfoRepository.save(companyInfo);

        History history = new History();
        history.setYear(2025);
        history.setMonth(3);
        history.setTitle("미래에너지 통합 브랜드 공개");
        history.setDescription("브랜드 론칭");
        history.setImageUrl("/uploads/images/history/2025-brand.jpg");
        history.setDisplayOrder(1);
        history.setActive(true);
        publicHistoryId = historyRepository.save(history).getId();

        History hiddenHistory = new History();
        hiddenHistory.setYear(2024);
        hiddenHistory.setMonth(1);
        hiddenHistory.setTitle("비공개 연혁");
        hiddenHistory.setDescription("숨김");
        hiddenHistory.setDisplayOrder(2);
        hiddenHistory.setActive(false);
        historyRepository.save(hiddenHistory);

        BusinessArea businessArea = new BusinessArea();
        businessArea.setTitle("에너지 솔루션");
        businessArea.setSubtitle("지속 가능한 에너지 포트폴리오");
        businessArea.setDescription("사업 설명");
        businessArea.setIconUrl("/uploads/icons/energy.svg");
        businessArea.setImageUrl("/uploads/images/business/energy.jpg");
        businessArea.setDisplayOrder(1);
        businessArea.setActive(true);
        businessId = businessAreaRepository.save(businessArea).getId();

        PageContent pageContent = new PageContent();
        pageContent.setPageKey(PageKey.HOME);
        pageContent.setSectionKey("hero");
        pageContent.setTitle("메인 비주얼");
        pageContent.setContent("새로운 역사를 열어갑니다.");
        pageContent.setImageUrl("/uploads/images/content/home-hero.jpg");
        pageContent.setDisplayOrder(1);
        pageContent.setActive(true);
        contentId = pageContentRepository.save(pageContent).getId();

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername("superadmin");
        adminUser.setPassword(passwordEncoder.encode("admin1234"));
        adminUser.setName("최고관리자");
        adminUser.setRole(AdminRole.SUPER_ADMIN);
        adminUserRepository.save(adminUser);
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
                .andExpect(jsonPath("$.data.companyName").value("한화넥스트"));

        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].year").value(2025))
                .andExpect(jsonPath("$.data[0].items[0].title").value("미래에너지 통합 브랜드 공개"))
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/history/{id}", publicHistoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(publicHistoryId));

        mockMvc.perform(get("/api/business/{id}", businessId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("에너지 솔루션"));

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
                                  "title": "신규 연혁",
                                  "description": "설명",
                                  "imageUrl": "/uploads/a.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminLoginAndMeEndpointWork() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/admin/me")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("superadmin"))
                .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"));
    }

    @Test
    void adminCrudEndpointsWork() throws Exception {
        String token = loginAndGetToken();

        MvcResult createHistoryResult = mockMvc.perform(post("/api/admin/history")
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "year": 2026,
                                  "month": 4,
                                  "title": "신규 연혁",
                                  "description": "설명",
                                  "imageUrl": "/uploads/images/history/new.jpg",
                                  "displayOrder": 3,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("신규 연혁"))
                .andReturn();

        long createdHistoryId = readId(createHistoryResult);

        mockMvc.perform(put("/api/admin/history/{id}", createdHistoryId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "year": 2026,
                                  "month": 5,
                                  "title": "수정된 연혁",
                                  "description": "수정 설명",
                                  "imageUrl": "/uploads/images/history/updated.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("수정된 연혁"));

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
                                  "title": "디지털 플랫폼",
                                  "subtitle": "운영 효율",
                                  "description": "플랫폼 설명",
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
                                  "title": "디지털 플랫폼 고도화",
                                  "subtitle": "운영 효율 강화",
                                  "description": "플랫폼 설명 수정",
                                  "iconUrl": "/uploads/icons/platform.svg",
                                  "imageUrl": "/uploads/images/business/platform-v2.jpg",
                                  "displayOrder": 2,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("디지털 플랫폼 고도화"));

        mockMvc.perform(put("/api/admin/content/{id}", contentId)
                        .header("Authorization", bearer(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "업데이트된 메인 비주얼",
                                  "content": "새로운 비전 메시지",
                                  "imageUrl": "/uploads/images/content/hero-v2.jpg",
                                  "displayOrder": 1,
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("업데이트된 메인 비주얼"));

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
    void uploadEndpointStoresAndDeletesImages() throws Exception {
        String token = loginAndGetToken();

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
