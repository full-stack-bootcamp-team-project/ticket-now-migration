package com.ticketnow.performance.model.service;

import com.ticketnow.performance.model.dto.Performance;
import com.ticketnow.performance.model.dto.PerformanceDetailResponseDto;
import com.ticketnow.performance.model.dto.PerformanceScheduleSeatViewDto;

import java.util.List;

public interface PerformanceService {

    // 공연 목록 전체 조회
    List<Performance> getAllPerformance();

    // 카테고리 별 공연 목록 조회
    List<Performance> getPerformanceByCategory(String category);

    // 공연 통합 검색
    List<Performance> searchTotalPerformance(String searchType, String keyword);

    // 키워드 검색
    List<Performance> searchKeywordPerformance(String searchType, String keyword);

    // 제목 검색
    List<Performance> searchTitlePerformance(String searchType, String keyword);

    // 출연자 검색
    List<Performance> searchCastPerformance(String searchType, String keyword);

    // 공연 상세 조회
    PerformanceDetailResponseDto getPerformanceDetail(String performanceId);

    // 공연 회차별 좌석 조회
    List<PerformanceScheduleSeatViewDto> getSeatByPerformanceScheduleId(String performanceScheduleId);

    // 자동완성 검색
    List<Performance> autocompletePerformance(String keyword);
}
