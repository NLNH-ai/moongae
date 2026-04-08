package com.company.website.service;

import com.company.website.dto.BusinessDto;
import com.company.website.entity.BusinessArea;
import com.company.website.repository.BusinessAreaRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BusinessAreaService {

    private final BusinessAreaRepository businessAreaRepository;

    public BusinessAreaService(BusinessAreaRepository businessAreaRepository) {
        this.businessAreaRepository = businessAreaRepository;
    }

    public List<BusinessDto.Response> getActiveBusinessAreas() {
        return businessAreaRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(BusinessDto.Response::from)
                .toList();
    }

    public BusinessDto.Response getBusinessArea(Long id) {
        BusinessArea businessArea = businessAreaRepository.findById(id)
                .filter(BusinessArea::isActive)
                .orElseThrow(() -> new EntityNotFoundException("사업분야 정보를 찾을 수 없습니다."));
        return BusinessDto.Response.from(businessArea);
    }

    @Transactional
    public BusinessDto.Response createBusinessArea(BusinessDto.UpsertRequest request) {
        BusinessArea businessArea = new BusinessArea();
        applyUpsert(businessArea, request);
        return BusinessDto.Response.from(businessAreaRepository.save(businessArea));
    }

    @Transactional
    public BusinessDto.Response updateBusinessArea(Long id, BusinessDto.UpsertRequest request) {
        BusinessArea businessArea = getBusinessEntity(id);
        applyUpsert(businessArea, request);
        return BusinessDto.Response.from(businessArea);
    }

    @Transactional
    public void deleteBusinessArea(Long id) {
        businessAreaRepository.delete(getBusinessEntity(id));
    }

    private BusinessArea getBusinessEntity(Long id) {
        return businessAreaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사업분야 정보를 찾을 수 없습니다."));
    }

    private void applyUpsert(BusinessArea businessArea, BusinessDto.UpsertRequest request) {
        businessArea.setTitle(request.title());
        businessArea.setSubtitle(request.subtitle());
        businessArea.setDescription(request.description());
        businessArea.setIconUrl(request.iconUrl());
        businessArea.setImageUrl(request.imageUrl());
        businessArea.setDisplayOrder(request.displayOrder());
        businessArea.setActive(request.isActive());
    }
}
