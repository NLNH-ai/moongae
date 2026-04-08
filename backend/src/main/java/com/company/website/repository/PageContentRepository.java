package com.company.website.repository;

import com.company.website.entity.PageContent;
import com.company.website.entity.enums.PageKey;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PageContentRepository extends JpaRepository<PageContent, Long> {
    List<PageContent> findByPageKeyOrderByDisplayOrderAsc(PageKey pageKey);

    Optional<PageContent> findByPageKeyAndSectionKey(PageKey pageKey, String sectionKey);

    List<PageContent> findByPageKeyAndActiveTrueOrderByDisplayOrderAsc(PageKey pageKey);

    Optional<PageContent> findByPageKeyAndSectionKeyAndActiveTrue(PageKey pageKey, String sectionKey);
}
