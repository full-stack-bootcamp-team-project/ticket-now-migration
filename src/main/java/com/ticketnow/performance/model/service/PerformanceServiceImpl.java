package com.ticketnow.performance.model.service;

import com.ticketnow.performance.model.dto.*;
import com.ticketnow.performance.model.mapper.PerformanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PerformanceServiceImpl implements PerformanceService{

    private final PerformanceMapper performanceMapper;

    @Override
    public List<Performance> getAllPerformance() {
        return performanceMapper.getAllPerformance();
    }

    @Override
    public List<Performance> getPerformanceByCategory(String category) {
        return performanceMapper.getPerformanceByCategory(category);
    }

    @Override
    public List<Performance> searchTotalPerformance(String searchType, String keyword) {
        return performanceMapper.searchTotalPerformance(searchType, keyword);
    }

    @Override
    public List<Performance> searchKeywordPerformance(String searchType, String keyword) {
        return performanceMapper.searchKeywordPerformance(searchType, keyword);
    }

    @Override
    public List<Performance> searchTitlePerformance(String searchType, String keyword) {
        return performanceMapper.searchTitlePerformance(searchType, keyword);
    }

    @Override
    public List<Performance> searchCastPerformance(String searchType, String keyword) {
        return performanceMapper.searchCastPerformance(searchType, keyword);
    }

    @Override
    public PerformanceDetailResponseDto getPerformanceDetail(String performanceId) {
            // 공연 기본 정보
        PerformanceDetailResponseDto detail = performanceMapper.getPerformanceBasicInfo(performanceId);

            // 공연 회차 목록 (N행)
            List<PerformanceSchedule> schedules = performanceMapper.getPerformanceSchedules(performanceId);

            // 출연진 목록 (N행)
            List<CastMember> castMembers = performanceMapper.getCastMembers(performanceId);

            // 세팅
            detail.setSchedules(schedules);
            detail.setCastMembers(castMembers);

            return detail;
        }


    @Override
    public List<PerformanceScheduleSeatViewDto> getSeatByPerformanceScheduleId(String performanceScheduleId) {
        return performanceMapper.getSeatByPerformanceScheduleId(performanceScheduleId);
    }

    @Override
    public List<Performance> autocompletePerformance(String keyword) {
        return performanceMapper.autocompletePerformance(keyword);
    }
}
