package com.company.website.service;

import com.company.website.dto.AdminListDto;
import com.company.website.dto.ContentDto;
import com.company.website.entity.PageContent;
import com.company.website.entity.enums.AdminRole;
import com.company.website.entity.enums.PageKey;
import com.company.website.exception.CustomException;
import com.company.website.repository.PageContentRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    public AdminListDto.PageResponse<ContentDto.Response> getAdminPageContents(
            String pageKey,
            String keyword,
            Boolean isActive,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        String resolvedSortBy = resolveContentSortBy(sortBy);
        Sort.Direction direction = parseDirection(sortBy, sortDirection);
        Sort resolvedSort = switch (resolvedSortBy) {
            case "displayOrder" -> Sort.by(direction, "displayOrder").and(Sort.by(Sort.Direction.ASC, "sectionKey"));
            case "sectionKey" -> Sort.by(direction, "sectionKey").and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "title" -> Sort.by(direction, "title").and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "updatedAt" -> Sort.by(direction, "updatedAt").and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported content sort field.");
        };

        return AdminListDto.PageResponse.from(
                pageContentRepository.searchForAdmin(
                                parseOptionalPageKey(pageKey),
                                normalizeKeyword(keyword),
                                isActive,
                                PageRequest.of(page, size, resolvedSort)
                        )
                        .map(ContentDto.Response::from),
                resolvedSortBy,
                direction.name()
        );
    }

    public ContentDto.Response getPageSection(String pageKey, String sectionKey) {
        return pageContentRepository.findByPageKeyAndSectionKeyAndActiveTrue(parsePageKey(pageKey), sectionKey)
                .map(ContentDto.Response::from)
                .orElseThrow(() -> new EntityNotFoundException("Page section not found."));
    }

    @Transactional
    public ContentDto.Response updateContent(Long id, ContentDto.UpdateRequest request, AdminRole role) {
        PageContent pageContent = pageContentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Content item not found."));

        if (role != AdminRole.SUPER_ADMIN && request.isActive() != pageContent.isActive()) {
            throw new CustomException(HttpStatus.FORBIDDEN, "Only super admins can change content visibility.");
        }

        pageContent.setTitle(request.title());
        pageContent.setContent(request.content());
        pageContent.setImageUrl(request.imageUrl());
        pageContent.setDisplayOrder(request.displayOrder());
        pageContent.setActive(request.isActive());
        return ContentDto.Response.from(pageContent);
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String trimmedKeyword = keyword.trim();
        return trimmedKeyword.isEmpty() ? null : trimmedKeyword;
    }

    private PageKey parsePageKey(String pageKey) {
        try {
            return PageKey.valueOf(pageKey.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Invalid page key.");
        }
    }

    private PageKey parseOptionalPageKey(String pageKey) {
        if (pageKey == null || pageKey.isBlank()) {
            return null;
        }

        return parsePageKey(pageKey);
    }

    private String resolveContentSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "displayOrder";
        }

        return switch (sortBy.toLowerCase(Locale.ROOT)) {
            case "displayorder" -> "displayOrder";
            case "sectionkey" -> "sectionKey";
            case "title" -> "title";
            case "updatedat" -> "updatedAt";
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported content sort field.");
        };
    }

    private Sort.Direction parseDirection(String sortBy, String sortDirection) {
        if (sortDirection == null || sortDirection.isBlank()) {
            return "updatedAt".equals(resolveContentSortBy(sortBy))
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
        }

        try {
            return Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException exception) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported sort direction.");
        }
    }
}
