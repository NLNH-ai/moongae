package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.HistoryDto;
import com.company.website.service.HistoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/history")
public class AdminHistoryController {

    private final HistoryService historyService;

    public AdminHistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HistoryDto.Response>> createHistory(
            @Valid @RequestBody HistoryDto.UpsertRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(historyService.createHistory(request), "등록 성공"));
    }

    @PutMapping("/{id}")
    public ApiResponse<HistoryDto.Response> updateHistory(
            @PathVariable Long id,
            @Valid @RequestBody HistoryDto.UpsertRequest request
    ) {
        return ApiResponse.success(historyService.updateHistory(id, request), "수정 성공");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteHistory(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ApiResponse.success(null, "삭제 성공");
    }

    @PatchMapping("/order")
    public ApiResponse<List<HistoryDto.Response>> updateDisplayOrder(
            @Valid @RequestBody HistoryDto.OrderUpdateRequest request
    ) {
        return ApiResponse.success(historyService.updateDisplayOrder(request), "순서 변경 성공");
    }
}
