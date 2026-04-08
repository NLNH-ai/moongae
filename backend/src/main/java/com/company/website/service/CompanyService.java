package com.company.website.service;

import com.company.website.dto.CompanyDto;
import com.company.website.entity.CompanyInfo;
import com.company.website.repository.CompanyInfoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyInfoRepository companyInfoRepository;

    public CompanyService(CompanyInfoRepository companyInfoRepository) {
        this.companyInfoRepository = companyInfoRepository;
    }

    public CompanyDto.Response getCompanyInfo() {
        CompanyInfo companyInfo = companyInfoRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new EntityNotFoundException("회사 정보를 찾을 수 없습니다."));
        return CompanyDto.Response.from(companyInfo);
    }
}
