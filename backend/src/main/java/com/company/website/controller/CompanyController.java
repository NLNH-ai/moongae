package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.CompanyDto;
import com.company.website.service.CompanyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ApiResponse<CompanyDto.Response> getCompanyInfo() {
        return ApiResponse.success(companyService.getCompanyInfo(), "조회 성공");
    }
}
