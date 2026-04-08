package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.BusinessDto;
import com.company.website.service.BusinessAreaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    private final BusinessAreaService businessAreaService;

    public BusinessController(BusinessAreaService businessAreaService) {
        this.businessAreaService = businessAreaService;
    }

    @GetMapping
    public ApiResponse<List<BusinessDto.Response>> getBusinessAreas() {
        return ApiResponse.success(businessAreaService.getActiveBusinessAreas(), "조회 성공");
    }

    @GetMapping("/{id}")
    public ApiResponse<BusinessDto.Response> getBusinessArea(@PathVariable Long id) {
        return ApiResponse.success(businessAreaService.getBusinessArea(id), "조회 성공");
    }
}
