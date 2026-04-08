package com.company.website.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.company.website.dto.HistoryDto;
import com.company.website.entity.History;
import com.company.website.repository.HistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class HistoryServiceTest {

    @Mock
    private HistoryRepository historyRepository;

    @InjectMocks
    private HistoryService historyService;

    @Test
    void getActiveHistoryGroupsGroupsEntriesByYear() {
        History latest = createHistory(101L, 2025, 6, "Global Launch", 1, true);
        History second = createHistory(102L, 2025, 2, "Platform Rollout", 2, true);
        History older = createHistory(103L, 2024, 11, "New HQ", 3, true);

        when(historyRepository.findByActiveTrueOrderByYearDescMonthDescDisplayOrderAsc())
                .thenReturn(List.of(latest, second, older));

        List<HistoryDto.YearGroupResponse> result = historyService.getActiveHistoryGroups();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).year()).isEqualTo(2025);
        assertThat(result.get(0).items()).extracting(HistoryDto.Response::title)
                .containsExactly("Global Launch", "Platform Rollout");
        assertThat(result.get(1).year()).isEqualTo(2024);
    }

    @Test
    void getHistoryRejectsInactiveEntries() {
        History hidden = createHistory(201L, 2024, 1, "Hidden", 1, false);
        when(historyRepository.findById(201L)).thenReturn(Optional.of(hidden));

        assertThatThrownBy(() -> historyService.getHistory(201L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateDisplayOrderPersistsAllItemsAndReturnsSortedResponses() {
        History first = createHistory(301L, 2025, 3, "First", 1, true);
        History second = createHistory(302L, 2024, 8, "Second", 2, true);
        HistoryDto.OrderUpdateRequest request = new HistoryDto.OrderUpdateRequest(List.of(
                new HistoryDto.OrderItem(302L, 1),
                new HistoryDto.OrderItem(301L, 2)
        ));

        when(historyRepository.findAllById(List.of(302L, 301L))).thenReturn(List.of(first, second));
        when(historyRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<HistoryDto.Response> result = historyService.updateDisplayOrder(request);

        assertThat(first.getDisplayOrder()).isEqualTo(2);
        assertThat(second.getDisplayOrder()).isEqualTo(1);
        assertThat(result).extracting(HistoryDto.Response::id).containsExactly(302L, 301L);
        verify(historyRepository).saveAll(List.of(first, second));
    }

    private History createHistory(Long id, int year, int month, String title, int displayOrder, boolean active) {
        History history = new History();
        ReflectionTestUtils.setField(history, "id", id);
        history.setYear(year);
        history.setMonth(month);
        history.setTitle(title);
        history.setDescription(title + " description");
        history.setImageUrl("/uploads/" + id + ".jpg");
        history.setDisplayOrder(displayOrder);
        history.setActive(active);
        return history;
    }
}
