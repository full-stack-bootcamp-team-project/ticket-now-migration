package com.ticketnow.performance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Performance {

    // 공연 id
    private String performanceId;

    // 공연 이미지
    private String performanceImagePath;

    // 공연 제목
    private String performanceTitle;

    // 공연 카테고리
    private String performanceCategory; // (종류) ENUM(콘서트, 뮤지컬, 연극) NOT NULL

    // 공연 가격
    private int performancePrice;

    // 공연 주소
    private String performanceAddress;

    // 공연 상세정보
    private String performanceInfo;

    // 공연 랭킹
    private int performanceRanking;
}
