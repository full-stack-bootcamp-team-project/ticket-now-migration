package com.ticketnow.performance.model.mapper;

import com.ticketnow.performance.model.dto.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PerformanceMapper {

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

    // 기본 공연정보 조회
    PerformanceDetailResponseDto getPerformanceBasicInfo(String performanceId);

    // 공연 회차 조회
    List<PerformanceSchedule> getPerformanceSchedules(String performanceId);

    // 출연진 목록만 조회
    List<CastMember> getCastMembers(String performanceId);

    // 공연 회차별 좌석 조회
    List<PerformanceScheduleSeatViewDto> getSeatByPerformanceScheduleId(String performanceScheduleId);

    // 자동완성 검색
    List<Performance> autocompletePerformance(String keyword);
}
