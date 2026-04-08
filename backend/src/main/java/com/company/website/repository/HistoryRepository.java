package com.company.website.repository;

import com.company.website.entity.History;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findAllByOrderByYearDescMonthDescDisplayOrderAsc();

    List<History> findByActiveTrueOrderByYearDescMonthDescDisplayOrderAsc();
}
