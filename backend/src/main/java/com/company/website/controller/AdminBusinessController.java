package com.company.website.controller;

import com.company.website.dto.AdminListDto;
import com.company.website.dto.ApiResponse;
import com.company.website.dto.BusinessDto;
import com.company.website.service.BusinessAreaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/business")
public class AdminBusinessController {

    private final BusinessAreaService businessAreaService;

    public AdminBusinessController(BusinessAreaService businessAreaService) {
        this.businessAreaService = businessAreaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<AdminListDto.PageResponse<BusinessDto.Response>> getBusinessAreas(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ) {
        return ApiResponse.success(
                businessAreaService.searchBusinessAreasForAdmin(keyword, isActive, page, size, sortBy, sortDirection),
                "Business list loaded."
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BusinessDto.Response>> createBusinessArea(
            @Valid @RequestBody BusinessDto.UpsertRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(businessAreaService.createBusinessArea(request), "Business area created."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<BusinessDto.Response> updateBusinessArea(
            @PathVariable Long id,
            @Valid @RequestBody BusinessDto.UpsertRequest request
    ) {
        return ApiResponse.success(businessAreaService.updateBusinessArea(id, request), "Business area updated.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deleteBusinessArea(@PathVariable Long id) {
        businessAreaService.deleteBusinessArea(id);
        return ApiResponse.success(null, "Business area deleted.");
    }
}
