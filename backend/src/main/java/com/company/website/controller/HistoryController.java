package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.HistoryDto;
import com.company.website.service.HistoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ApiResponse<List<HistoryDto.YearGroupResponse>> getHistories() {
        return ApiResponse.success(historyService.getActiveHistoryGroups(), "조회 성공");
    }

    @GetMapping("/{id}")
    public ApiResponse<HistoryDto.Response> getHistory(@PathVariable Long id) {
        return ApiResponse.success(historyService.getHistory(id), "조회 성공");
    }
}
