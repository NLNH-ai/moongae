package com.company.website.repository;

import com.company.website.entity.History;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findAllByOrderByYearDescMonthDescDisplayOrderAsc();

    List<History> findByActiveTrueOrderByYearDescMonthDescDisplayOrderAsc();

    @Query("""
            select history
            from History history
            where (:keyword is null
                    or lower(history.title) like lower(concat('%', :keyword, '%')))
              and (:isActive is null or history.active = :isActive)
              and (:year is null or history.year = :year)
            """)
    Page<History> searchForAdmin(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            @Param("year") Integer year,
            Pageable pageable
    );
}
