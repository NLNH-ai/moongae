package com.company.website.controller;

import com.company.website.dto.AdminListDto;
import com.company.website.dto.ApiResponse;
import com.company.website.dto.HistoryDto;
import com.company.website.service.HistoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/history")
public class AdminHistoryController {

    private final HistoryService historyService;

    public AdminHistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<AdminListDto.PageResponse<HistoryDto.Response>> getHistoryEntries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) @Min(1900) @Max(2100) Integer year,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ) {
        return ApiResponse.success(
                historyService.getAdminHistoryEntries(keyword, isActive, year, page, size, sortBy, sortDirection),
                "History list loaded."
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<HistoryDto.Response>> createHistory(
            @Valid @RequestBody HistoryDto.UpsertRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(historyService.createHistory(request), "History entry created."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<HistoryDto.Response> updateHistory(
            @PathVariable Long id,
            @Valid @RequestBody HistoryDto.UpsertRequest request
    ) {
        return ApiResponse.success(historyService.updateHistory(id, request), "History entry updated.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deleteHistory(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ApiResponse.success(null, "History entry deleted.");
    }

    @PatchMapping("/order")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<HistoryDto.Response>> updateDisplayOrder(
            @Valid @RequestBody HistoryDto.OrderUpdateRequest request
    ) {
        return ApiResponse.success(historyService.updateDisplayOrder(request), "History order updated.");
    }
}
