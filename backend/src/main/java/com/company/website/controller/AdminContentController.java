package com.company.website.controller;

import com.company.website.config.AdminPrincipal;
import com.company.website.dto.AdminListDto;
import com.company.website.dto.ApiResponse;
import com.company.website.dto.ContentDto;
import com.company.website.service.PageContentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {

    private final PageContentService pageContentService;

    public AdminContentController(PageContentService pageContentService) {
        this.pageContentService = pageContentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<AdminListDto.PageResponse<ContentDto.Response>> getContents(
            @RequestParam(required = false) String pageKey,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ) {
        return ApiResponse.success(
                pageContentService.getAdminPageContents(pageKey, keyword, isActive, page, size, sortBy, sortDirection),
                "Content list loaded."
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<ContentDto.Response> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentDto.UpdateRequest request,
            @AuthenticationPrincipal AdminPrincipal principal
    ) {
        return ApiResponse.success(
                pageContentService.updateContent(id, request, principal.getRole()),
                "Content section updated."
        );
    }
}
