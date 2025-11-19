package com.ticketnow.reservation.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserReservationViewDto {

    // 사용자 ID
    private String userId;

    // 공연 제목
    private String performanceTitle;

    // 공연 회차 ID
    private String performanceScheduleId;

    // 공연 이미지
    private String performanceImagePath;

    // 공연 일정 - 날짜
    private String performanceScheduleStartDate;

    // 공연 일정 - 시간
    private String performanceScheduleStartTime;

    // 예매 날짜
    private String reservationDate;

    // 좌석 ID
    private String seatId;

    // 좌석 번호
    private String seatNumber;

    // 예매 상태
    private boolean status;
}
