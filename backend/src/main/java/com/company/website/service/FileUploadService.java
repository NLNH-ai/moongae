package com.company.website.service;

import com.company.website.config.FileProperties;
import com.company.website.dto.FileUploadDto;
import com.company.website.entity.FileUpload;
import com.company.website.exception.CustomException;
import com.company.website.repository.FileUploadRepository;
import com.company.website.util.FileStorageUtils;
import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class FileUploadService {

    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM");

    private final FileUploadRepository fileUploadRepository;
    private final FileProperties fileProperties;

    public FileUploadService(FileUploadRepository fileUploadRepository, FileProperties fileProperties) {
        this.fileUploadRepository = fileUploadRepository;
        this.fileProperties = fileProperties;
    }

    @Transactional
    public FileUploadDto.Response uploadImage(MultipartFile file) {
        validateImage(file);

        LocalDate today = LocalDate.now();
        String storedName = FileStorageUtils.buildStoredName(file.getOriginalFilename());
        Path rootPath = Paths.get(fileProperties.uploadDir()).toAbsolutePath().normalize();
        Path relativePath = Paths.get("images", YEAR_FORMATTER.format(today), MONTH_FORMATTER.format(today));
        Path targetDirectory = rootPath.resolve(relativePath);
        Path targetFile = targetDirectory.resolve(storedName);

        try {
            Files.createDirectories(targetDirectory);
            file.transferTo(targetFile);
        } catch (IOException exception) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }

        FileUpload fileUpload = new FileUpload();
        fileUpload.setOriginalName(FileStorageUtils.sanitizeFilename(file.getOriginalFilename()));
        fileUpload.setStoredName(storedName);
        fileUpload.setFilePath("/uploads/" + relativePath.toString().replace('\\', '/') + "/" + storedName);
        fileUpload.setFileSize(file.getSize());
        fileUpload.setContentType(file.getContentType());

        return FileUploadDto.Response.from(fileUploadRepository.save(fileUpload));
    }

    @Transactional
    public void deleteFile(Long id) {
        FileUpload fileUpload = fileUploadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("업로드 파일 정보를 찾을 수 없습니다."));

        try {
            Path rootPath = Paths.get(fileProperties.uploadDir()).toAbsolutePath().normalize();
            String relative = fileUpload.getFilePath().replaceFirst("^/uploads/", "");
            Files.deleteIfExists(rootPath.resolve(relative));
        } catch (IOException exception) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 삭제에 실패했습니다.");
        }

        fileUploadRepository.delete(fileUpload);
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "업로드할 이미지 파일이 필요합니다.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (contentType == null || fileProperties.allowedImageTypes().stream().noneMatch(contentType::equalsIgnoreCase)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "지원하지 않는 이미지 형식입니다.");
        }

        if (extension == null || !isAllowedExtension(extension)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "지원하지 않는 파일 확장자입니다.");
        }
    }

    private boolean isAllowedExtension(String extension) {
        String normalized = extension.toLowerCase(Locale.ROOT);
        return normalized.equals("jpg")
                || normalized.equals("jpeg")
                || normalized.equals("png")
                || normalized.equals("gif")
                || normalized.equals("webp");
    }
}
