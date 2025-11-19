package com.ticketnow.reservation.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Reservation {

    // 공연 회차 id
    private String performanceScheduleId;

    // 좌석 id
    private String seatId;

    // 좌석 번호
    private String seatNumber;

    // 유저 id
    private String userId;

    // 예약 날짜
    private String reservationDate;

    // 가능 여부
    private boolean status;
}
