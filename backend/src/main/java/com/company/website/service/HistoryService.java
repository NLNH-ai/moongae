package com.company.website.service;

import com.company.website.dto.HistoryDto;
import com.company.website.entity.History;
import com.company.website.repository.HistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    public HistoryDto.Response getHistory(Long id) {
        History history = historyRepository.findById(id)
                .filter(History::isActive)
                .orElseThrow(() -> new EntityNotFoundException("연혁 정보를 찾을 수 없습니다."));
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
            throw new EntityNotFoundException("일부 연혁 정보를 찾을 수 없습니다.");
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
                .orElseThrow(() -> new EntityNotFoundException("연혁 정보를 찾을 수 없습니다."));
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
