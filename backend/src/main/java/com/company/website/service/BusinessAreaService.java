package com.company.website.service;

import com.company.website.dto.AdminListDto;
import com.company.website.dto.BusinessDto;
import com.company.website.entity.BusinessArea;
import com.company.website.exception.CustomException;
import com.company.website.repository.BusinessAreaRepository;
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
public class BusinessAreaService {

    private final BusinessAreaRepository businessAreaRepository;

    public BusinessAreaService(BusinessAreaRepository businessAreaRepository) {
        this.businessAreaRepository = businessAreaRepository;
    }

    public List<BusinessDto.Response> getActiveBusinessAreas() {
        return businessAreaRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(BusinessDto.Response::from)
                .toList();
    }

    public List<BusinessDto.Response> searchActiveBusinessAreas(String keyword) {
        return businessAreaRepository.search(normalizeKeyword(keyword), true)
                .stream()
                .map(BusinessDto.Response::from)
                .toList();
    }

    public AdminListDto.PageResponse<BusinessDto.Response> searchBusinessAreasForAdmin(
            String keyword,
            Boolean isActive,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        String resolvedSortBy = resolveBusinessSortBy(sortBy);
        Sort.Direction direction = parseDirection(sortBy, sortDirection);
        Sort resolvedSort = switch (resolvedSortBy) {
            case "title" -> Sort.by(direction, "title").and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "updatedAt" -> Sort.by(direction, "updatedAt").and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "displayOrder" -> Sort.by(direction, "displayOrder").and(Sort.by(Sort.Direction.ASC, "title"));
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported business sort field.");
        };

        return AdminListDto.PageResponse.from(
                businessAreaRepository.searchForAdmin(
                                normalizeKeyword(keyword),
                                isActive,
                                PageRequest.of(page, size, resolvedSort)
                        )
                        .map(BusinessDto.Response::from),
                resolvedSortBy,
                direction.name()
        );
    }

    public BusinessDto.Response getBusinessArea(Long id) {
        BusinessArea businessArea = businessAreaRepository.findById(id)
                .filter(BusinessArea::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Business area not found."));
        return BusinessDto.Response.from(businessArea);
    }

    @Transactional
    public BusinessDto.Response createBusinessArea(BusinessDto.UpsertRequest request) {
        BusinessArea businessArea = new BusinessArea();
        applyUpsert(businessArea, request);
        return BusinessDto.Response.from(businessAreaRepository.save(businessArea));
    }

    @Transactional
    public BusinessDto.Response updateBusinessArea(Long id, BusinessDto.UpsertRequest request) {
        BusinessArea businessArea = getBusinessEntity(id);
        applyUpsert(businessArea, request);
        return BusinessDto.Response.from(businessArea);
    }

    @Transactional
    public void deleteBusinessArea(Long id) {
        businessAreaRepository.delete(getBusinessEntity(id));
    }

    private BusinessArea getBusinessEntity(Long id) {
        return businessAreaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business area not found."));
    }

    private void applyUpsert(BusinessArea businessArea, BusinessDto.UpsertRequest request) {
        businessArea.setTitle(request.title());
        businessArea.setSubtitle(request.subtitle());
        businessArea.setDescription(request.description());
        businessArea.setIconUrl(request.iconUrl());
        businessArea.setImageUrl(request.imageUrl());
        businessArea.setDisplayOrder(request.displayOrder());
        businessArea.setActive(request.isActive());
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String trimmedKeyword = keyword.trim();
        return trimmedKeyword.isEmpty() ? null : trimmedKeyword;
    }

    private String resolveBusinessSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "displayOrder";
        }

        return switch (sortBy.toLowerCase(Locale.ROOT)) {
            case "displayorder" -> "displayOrder";
            case "title" -> "title";
            case "updatedat" -> "updatedAt";
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported business sort field.");
        };
    }

    private Sort.Direction parseDirection(String sortBy, String sortDirection) {
        if (sortDirection == null || sortDirection.isBlank()) {
            return "updatedAt".equals(resolveBusinessSortBy(sortBy))
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
