package com.company.website.service;

import com.company.website.dto.ContentDto;
import com.company.website.entity.PageContent;
import com.company.website.entity.enums.PageKey;
import com.company.website.exception.CustomException;
import com.company.website.repository.PageContentRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PageContentService {

    private final PageContentRepository pageContentRepository;

    public PageContentService(PageContentRepository pageContentRepository) {
        this.pageContentRepository = pageContentRepository;
    }

    public List<ContentDto.Response> getPageContents(String pageKey) {
        return pageContentRepository.findByPageKeyAndActiveTrueOrderByDisplayOrderAsc(parsePageKey(pageKey))
                .stream()
                .map(ContentDto.Response::from)
                .toList();
    }

    public ContentDto.Response getPageSection(String pageKey, String sectionKey) {
        return pageContentRepository.findByPageKeyAndSectionKeyAndActiveTrue(parsePageKey(pageKey), sectionKey)
                .map(ContentDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("페이지 섹션 정보를 찾을 수 없습니다."));
    }

    @Transactional
    public ContentDto.Response updateContent(Long id, ContentDto.UpdateRequest request) {
        PageContent pageContent = pageContentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("콘텐츠 정보를 찾을 수 없습니다."));
        pageContent.setTitle(request.title());
        pageContent.setContent(request.content());
        pageContent.setImageUrl(request.imageUrl());
        pageContent.setDisplayOrder(request.displayOrder());
        pageContent.setActive(request.isActive());
        return ContentDto.Response.from(pageContent);
    }

    private PageKey parsePageKey(String pageKey) {
        try {
            return PageKey.valueOf(pageKey.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 페이지 키입니다.");
        }
    }
}
