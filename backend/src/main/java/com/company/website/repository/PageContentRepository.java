package com.company.website.repository;

import com.company.website.entity.PageContent;
import com.company.website.entity.enums.PageKey;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PageContentRepository extends JpaRepository<PageContent, Long> {
    List<PageContent> findByPageKeyOrderByDisplayOrderAsc(PageKey pageKey);

    Optional<PageContent> findByPageKeyAndSectionKey(PageKey pageKey, String sectionKey);

    List<PageContent> findByPageKeyAndActiveTrueOrderByDisplayOrderAsc(PageKey pageKey);

    Optional<PageContent> findByPageKeyAndSectionKeyAndActiveTrue(PageKey pageKey, String sectionKey);

    @Query("""
            select pageContent
            from PageContent pageContent
            where (:pageKey is null or pageContent.pageKey = :pageKey)
              and (:isActive is null or pageContent.active = :isActive)
              and (
                    :keyword is null
                    or lower(pageContent.sectionKey) like lower(concat('%', :keyword, '%'))
                    or lower(pageContent.title) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<PageContent> searchForAdmin(
            @Param("pageKey") PageKey pageKey,
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
