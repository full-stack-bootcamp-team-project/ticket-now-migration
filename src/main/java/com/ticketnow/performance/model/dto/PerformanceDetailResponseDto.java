package com.ticketnow.performance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceDetailResponseDto {

    // 공연 기본 정보 (1개)
    private String performanceId;
    private String performanceTitle;
    private String performanceImagePath;
    private String performanceCategory;
    private int performancePrice;
    private String performanceAddress;
    private String performanceInfo;
    private int performanceRanking;

    // 회차 목록
    private List<PerformanceSchedule> schedules;

    // 출연진 목록
    private List<CastMember> castMembers;
}
