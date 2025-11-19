package com.ticketnow.performance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceScheduleSeatViewDto {

    // 공연 회차 id
    private String performanceScheduleId;

    // 좌석 id
    private String seatId;

    // 좌석 번호
    private String seatNumber;

    // 예약 여부 (0/1)
    private boolean isReserved;
}
