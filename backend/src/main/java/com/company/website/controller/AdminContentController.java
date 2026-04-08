package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.ContentDto;
import com.company.website.service.PageContentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {

    private final PageContentService pageContentService;

    public AdminContentController(PageContentService pageContentService) {
        this.pageContentService = pageContentService;
    }

    @PutMapping("/{id}")
    public ApiResponse<ContentDto.Response> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentDto.UpdateRequest request
    ) {
        return ApiResponse.success(pageContentService.updateContent(id, request), "수정 성공");
    }
}
