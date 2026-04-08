package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.ContentDto;
import com.company.website.service.PageContentService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final PageContentService pageContentService;

    public ContentController(PageContentService pageContentService) {
        this.pageContentService = pageContentService;
    }

    @GetMapping("/{pageKey}")
    public ApiResponse<List<ContentDto.Response>> getPageContents(@PathVariable String pageKey) {
        return ApiResponse.success(pageContentService.getPageContents(pageKey), "조회 성공");
    }

    @GetMapping("/{pageKey}/{sectionKey}")
    public ApiResponse<ContentDto.Response> getPageSection(
            @PathVariable String pageKey,
            @PathVariable String sectionKey
    ) {
        return ApiResponse.success(pageContentService.getPageSection(pageKey, sectionKey), "조회 성공");
    }
}
