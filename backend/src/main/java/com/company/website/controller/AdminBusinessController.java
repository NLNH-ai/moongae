package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.BusinessDto;
import com.company.website.service.BusinessAreaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/business")
public class AdminBusinessController {

    private final BusinessAreaService businessAreaService;

    public AdminBusinessController(BusinessAreaService businessAreaService) {
        this.businessAreaService = businessAreaService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessDto.Response>> createBusinessArea(
            @Valid @RequestBody BusinessDto.UpsertRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(businessAreaService.createBusinessArea(request), "등록 성공"));
    }

    @PutMapping("/{id}")
    public ApiResponse<BusinessDto.Response> updateBusinessArea(
            @PathVariable Long id,
            @Valid @RequestBody BusinessDto.UpsertRequest request
    ) {
        return ApiResponse.success(businessAreaService.updateBusinessArea(id, request), "수정 성공");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBusinessArea(@PathVariable Long id) {
        businessAreaService.deleteBusinessArea(id);
        return ApiResponse.success(null, "삭제 성공");
    }
}
