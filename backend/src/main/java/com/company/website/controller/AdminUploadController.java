package com.company.website.controller;

import com.company.website.dto.ApiResponse;
import com.company.website.dto.FileUploadDto;
import com.company.website.service.FileUploadService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/upload")
public class AdminUploadController {

    private final FileUploadService fileUploadService;

    public AdminUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping
    public ApiResponse<FileUploadDto.Response> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(fileUploadService.uploadImage(file), "업로드 성공");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        fileUploadService.deleteFile(id);
        return ApiResponse.success(null, "삭제 성공");
    }
}
