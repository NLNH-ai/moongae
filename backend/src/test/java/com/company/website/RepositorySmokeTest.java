package com.company.website;

import static org.assertj.core.api.Assertions.assertThat;

import com.company.website.entity.AdminUser;
import com.company.website.entity.BusinessArea;
import com.company.website.entity.CompanyInfo;
import com.company.website.entity.FileUpload;
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
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class RepositorySmokeTest {

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

    @Test
    void repositoriesPersistCoreEntities() {
        CompanyInfo companyInfo = new CompanyInfo();
        companyInfo.setCompanyName("한화테크");
        companyInfo.setCeoName("김대표");
        companyInfo.setEstablishedDate(LocalDate.of(1999, 3, 1));
        companyInfo.setAddress("서울특별시 중구 세종대로 1");
        companyInfo.setPhone("02-0000-0000");
        companyInfo.setEmail("hello@example.com");
        companyInfo.setDescription("기업 소개");
        companyInfoRepository.save(companyInfo);

        History history = new History();
        history.setYear(2024);
        history.setMonth(4);
        history.setTitle("신규 사옥 이전");
        history.setDescription("본사 이전 완료");
        history.setDisplayOrder(1);
        historyRepository.save(history);

        BusinessArea businessArea = new BusinessArea();
        businessArea.setTitle("에너지");
        businessArea.setSubtitle("클린 에너지 솔루션");
        businessArea.setDescription("사업 설명");
        businessArea.setDisplayOrder(1);
        businessAreaRepository.save(businessArea);

        PageContent pageContent = new PageContent();
        pageContent.setPageKey(PageKey.HOME);
        pageContent.setSectionKey("hero");
        pageContent.setTitle("메인 비주얼");
        pageContent.setContent("콘텐츠");
        pageContent.setDisplayOrder(1);
        pageContentRepository.save(pageContent);

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername("admin");
        adminUser.setPassword("$2b$10$CKIysUDhM45xUFFwP.TTDuPrS56VbZOjkW3FozSWF.H46i2QIv5/e");
        adminUser.setName("관리자");
        adminUser.setRole(AdminRole.SUPER_ADMIN);
        adminUserRepository.save(adminUser);

        FileUpload fileUpload = new FileUpload();
        fileUpload.setOriginalName("hero.jpg");
        fileUpload.setStoredName("hero-uuid.jpg");
        fileUpload.setFilePath("/uploads/images/2026/04/hero-uuid.jpg");
        fileUpload.setFileSize(1024L);
        fileUpload.setContentType("image/jpeg");
        fileUploadRepository.save(fileUpload);

        assertThat(companyInfoRepository.count()).isEqualTo(1L);
        assertThat(historyRepository.findAllByOrderByYearDescMonthDescDisplayOrderAsc()).hasSize(1);
        assertThat(businessAreaRepository.findAllByOrderByDisplayOrderAsc()).hasSize(1);
        assertThat(pageContentRepository.findByPageKeyOrderByDisplayOrderAsc(PageKey.HOME)).hasSize(1);
        assertThat(adminUserRepository.findByUsername("admin")).isPresent();
        assertThat(fileUploadRepository.count()).isEqualTo(1L);
    }
}
