package com.company.website.repository;

import com.company.website.entity.BusinessArea;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessAreaRepository extends JpaRepository<BusinessArea, Long> {
    List<BusinessArea> findAllByOrderByDisplayOrderAsc();

    List<BusinessArea> findByActiveTrueOrderByDisplayOrderAsc();
}
