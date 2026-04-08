package com.company.website.repository;

import com.company.website.entity.CompanyInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyInfoRepository extends JpaRepository<CompanyInfo, Long> {
    java.util.Optional<CompanyInfo> findTopByOrderByIdAsc();
}
