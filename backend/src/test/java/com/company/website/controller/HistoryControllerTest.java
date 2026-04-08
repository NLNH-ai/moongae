package com.company.website.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.company.website.dto.HistoryDto;
import com.company.website.exception.GlobalExceptionHandler;
import com.company.website.service.HistoryService;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class HistoryControllerTest {

    @Mock
    private HistoryService historyService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new HistoryController(historyService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getHistoriesReturnsStructuredSuccessResponse() throws Exception {
        when(historyService.getActiveHistoryGroups()).thenReturn(List.of(
                new HistoryDto.YearGroupResponse(
                        2025,
                        List.of(new HistoryDto.Response(
                                11L,
                                2025,
                                4,
                                "Global Launch",
                                "Launch description",
                                "/uploads/history.jpg",
                                1,
                                true,
                                null,
                                null
                        ))
                )
        ));

        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].year").value(2025))
                .andExpect(jsonPath("$.data[0].items[0].title").value("Global Launch"));
    }

    @Test
    void getHistoryReturnsNotFoundWhenServiceFails() throws Exception {
        when(historyService.getHistory(99L)).thenThrow(new EntityNotFoundException("missing"));

        mockMvc.perform(get("/api/history/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.status").value(404));
    }
}
