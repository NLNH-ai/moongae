package com.company.website.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.company.website.config.FileProperties;
import com.company.website.dto.FileUploadDto;
import com.company.website.entity.FileUpload;
import com.company.website.exception.CustomException;
import com.company.website.repository.FileUploadRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {

    @TempDir
    Path tempDir;

    @Mock
    private FileUploadRepository fileUploadRepository;

    private FileUploadService fileUploadService;

    @BeforeEach
    void setUp() {
        FileProperties fileProperties = new FileProperties(
                tempDir.toString(),
                List.of("image/jpeg", "image/png", "image/gif", "image/webp")
        );
        fileUploadService = new FileUploadService(fileUploadRepository, fileProperties);
    }

    @Test
    void uploadImageStoresFileAndPersistsMetadata() throws Exception {
        when(fileUploadRepository.save(any(FileUpload.class))).thenAnswer(invocation -> {
            FileUpload fileUpload = invocation.getArgument(0);
            ReflectionTestUtils.setField(fileUpload, "id", 701L);
            ReflectionTestUtils.setField(fileUpload, "createdAt", java.time.LocalDateTime.now());
            return fileUpload;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "hero.webp",
                "image/webp",
                "image-bytes".getBytes()
        );

        FileUploadDto.Response response = fileUploadService.uploadImage(file);

        assertThat(response.id()).isEqualTo(701L);
        assertThat(response.originalName()).isEqualTo("hero.webp");
        assertThat(response.filePath()).startsWith("/uploads/images/");

        Path storedFile = tempDir.resolve(response.filePath().replaceFirst("^/uploads/", ""));
        assertThat(Files.exists(storedFile)).isTrue();

        ArgumentCaptor<FileUpload> captor = ArgumentCaptor.forClass(FileUpload.class);
        verify(fileUploadRepository).save(captor.capture());
        assertThat(captor.getValue().getStoredName()).endsWith(".webp");
        assertThat(captor.getValue().getContentType()).isEqualTo("image/webp");
        assertThat(captor.getValue().getFileSize()).isEqualTo((long) file.getBytes().length);
    }

    @Test
    void uploadImageRejectsUnsupportedContentTypes() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "hero.svg",
                "image/svg+xml",
                "<svg/>".getBytes()
        );

        assertThatThrownBy(() -> fileUploadService.uploadImage(file))
                .isInstanceOf(CustomException.class)
                .extracting(exception -> ((CustomException) exception).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void deleteFileRemovesStoredFileAndDatabaseRecord() throws Exception {
        LocalDate today = LocalDate.now();
        Path directory = tempDir.resolve(Path.of(
                "images",
                String.valueOf(today.getYear()),
                String.format("%02d", today.getMonthValue())
        ));
        Files.createDirectories(directory);
        Path storedFile = directory.resolve("hero.webp");
        Files.writeString(storedFile, "stored");

        FileUpload fileUpload = new FileUpload();
        ReflectionTestUtils.setField(fileUpload, "id", 801L);
        fileUpload.setOriginalName("hero.webp");
        fileUpload.setStoredName("hero.webp");
        fileUpload.setFilePath("/uploads/images/%d/%02d/hero.webp".formatted(
                today.getYear(),
                today.getMonthValue()
        ));
        fileUpload.setFileSize(6L);
        fileUpload.setContentType("image/webp");

        when(fileUploadRepository.findById(801L)).thenReturn(Optional.of(fileUpload));

        fileUploadService.deleteFile(801L);

        assertThat(Files.exists(storedFile)).isFalse();
        verify(fileUploadRepository).delete(fileUpload);
    }
}
