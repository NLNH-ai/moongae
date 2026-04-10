package com.company.website.service;

import com.company.website.dto.AdminListDto;
import com.company.website.dto.HistoryDto;
import com.company.website.entity.History;
import com.company.website.exception.CustomException;
import com.company.website.repository.HistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HistoryService {

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public List<HistoryDto.YearGroupResponse> getActiveHistoryGroups() {
        Map<Integer, List<HistoryDto.Response>> grouped = new LinkedHashMap<>();

        historyRepository.findByActiveTrueOrderByYearDescMonthDescDisplayOrderAsc()
                .stream()
                .map(HistoryDto.Response::from)
                .forEach(item -> grouped.computeIfAbsent(item.year(), ignored -> new ArrayList<>()).add(item));

        return grouped.entrySet()
                .stream()
                .map(entry -> new HistoryDto.YearGroupResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    public AdminListDto.PageResponse<HistoryDto.Response> getAdminHistoryEntries(
            String keyword,
            Boolean isActive,
            Integer year,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        String resolvedSortBy = resolveHistorySortBy(sortBy);
        Sort resolvedSort = buildHistorySort(resolvedSortBy, sortDirection);

        return AdminListDto.PageResponse.from(
                historyRepository.searchForAdmin(
                                normalizeKeyword(keyword),
                                isActive,
                                year,
                                PageRequest.of(page, size, resolvedSort)
                        )
                        .map(HistoryDto.Response::from),
                resolvedSortBy,
                resolveSortDirectionLabel(resolvedSortBy, sortDirection)
        );
    }

    public HistoryDto.Response getHistory(Long id) {
        History history = historyRepository.findById(id)
                .filter(History::isActive)
                .orElseThrow(() -> new EntityNotFoundException("History entry not found."));
        return HistoryDto.Response.from(history);
    }

    @Transactional
    public HistoryDto.Response createHistory(HistoryDto.UpsertRequest request) {
        History history = new History();
        applyUpsert(history, request);
        return HistoryDto.Response.from(historyRepository.save(history));
    }

    @Transactional
    public HistoryDto.Response updateHistory(Long id, HistoryDto.UpsertRequest request) {
        History history = getHistoryEntity(id);
        applyUpsert(history, request);
        return HistoryDto.Response.from(history);
    }

    @Transactional
    public void deleteHistory(Long id) {
        History history = getHistoryEntity(id);
        historyRepository.delete(history);
    }

    @Transactional
    public List<HistoryDto.Response> updateDisplayOrder(HistoryDto.OrderUpdateRequest request) {
        List<Long> ids = request.items().stream().map(HistoryDto.OrderItem::id).toList();
        List<History> histories = historyRepository.findAllById(ids);

        if (histories.size() != ids.size()) {
            throw new EntityNotFoundException("One or more history entries could not be found.");
        }

        Map<Long, History> historyMap = histories.stream()
                .collect(java.util.stream.Collectors.toMap(History::getId, history -> history));

        for (HistoryDto.OrderItem item : request.items()) {
            historyMap.get(item.id()).setDisplayOrder(item.displayOrder());
        }

        return historyRepository.saveAll(histories)
                .stream()
                .sorted(Comparator.comparing(History::getDisplayOrder))
                .map(HistoryDto.Response::from)
                .toList();
    }

    private History getHistoryEntity(Long id) {
        return historyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("History entry not found."));
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String trimmedKeyword = keyword.trim();
        return trimmedKeyword.isEmpty() ? null : trimmedKeyword;
    }

    private String resolveHistorySortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "timeline";
        }

        return switch (sortBy.toLowerCase(Locale.ROOT)) {
            case "timeline" -> "timeline";
            case "year" -> "year";
            case "month" -> "month";
            case "title" -> "title";
            case "displayorder" -> "displayOrder";
            case "updatedat" -> "updatedAt";
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported history sort field.");
        };
    }

    private Sort buildHistorySort(String sortBy, String sortDirection) {
        Sort.Direction direction = parseDirection(sortBy, sortDirection);

        return switch (sortBy) {
            case "timeline" -> Sort.by(
                    Sort.Order.desc("year"),
                    Sort.Order.desc("month"),
                    Sort.Order.asc("displayOrder")
            );
            case "year" -> Sort.by(direction, "year")
                    .and(Sort.by(direction, "month"))
                    .and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "month" -> Sort.by(direction, "month")
                    .and(Sort.by(Sort.Direction.DESC, "year"))
                    .and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            case "title" -> Sort.by(direction, "title")
                    .and(Sort.by(Sort.Direction.DESC, "year"))
                    .and(Sort.by(Sort.Direction.DESC, "month"));
            case "displayOrder" -> Sort.by(direction, "displayOrder")
                    .and(Sort.by(Sort.Direction.DESC, "year"))
                    .and(Sort.by(Sort.Direction.DESC, "month"));
            case "updatedAt" -> Sort.by(direction, "updatedAt")
                    .and(Sort.by(Sort.Direction.ASC, "displayOrder"));
            default -> throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported history sort field.");
        };
    }

    private Sort.Direction parseDirection(String sortBy, String sortDirection) {
        if (sortDirection == null || sortDirection.isBlank()) {
            return "displayOrder".equals(sortBy) || "title".equals(sortBy)
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
        }

        try {
            return Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException exception) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Unsupported sort direction.");
        }
    }

    private String resolveSortDirectionLabel(String sortBy, String sortDirection) {
        if ("timeline".equals(sortBy) && (sortDirection == null || sortDirection.isBlank())) {
            return Sort.Direction.DESC.name();
        }

        return parseDirection(sortBy, sortDirection).name();
    }

    private void applyUpsert(History history, HistoryDto.UpsertRequest request) {
        history.setYear(request.year());
        history.setMonth(request.month());
        history.setTitle(request.title());
        history.setDescription(request.description());
        history.setImageUrl(request.imageUrl());
        history.setDisplayOrder(request.displayOrder());
        history.setActive(request.isActive());
    }
}
