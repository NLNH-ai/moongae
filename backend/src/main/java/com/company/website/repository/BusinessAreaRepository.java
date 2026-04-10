package com.company.website.repository;

import com.company.website.entity.BusinessArea;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BusinessAreaRepository extends JpaRepository<BusinessArea, Long> {
    List<BusinessArea> findAllByOrderByDisplayOrderAsc();

    List<BusinessArea> findByActiveTrueOrderByDisplayOrderAsc();

    @Query("""
            select businessArea
            from BusinessArea businessArea
            where (:isActive is null or businessArea.active = :isActive)
              and (
                    :keyword is null
                    or lower(businessArea.title) like lower(concat('%', :keyword, '%'))
                    or lower(coalesce(businessArea.subtitle, '')) like lower(concat('%', :keyword, '%'))
              )
            order by businessArea.displayOrder asc
            """)
    List<BusinessArea> search(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive
    );

    @Query("""
            select businessArea
            from BusinessArea businessArea
            where (:isActive is null or businessArea.active = :isActive)
              and (
                    :keyword is null
                    or lower(businessArea.title) like lower(concat('%', :keyword, '%'))
                    or lower(coalesce(businessArea.subtitle, '')) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<BusinessArea> searchForAdmin(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
