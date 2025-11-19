package com.ticketnow.reservation.model.service;

import com.ticketnow.reservation.model.dto.UserReservationViewDto;
import jakarta.servlet.http.HttpSession;

import java.util.List;

public interface ReservationService {

    // 예매
    void insertReservation(String performanceScheduleId, String userId, String seatId, String seatNumber);

    // 예매 내역 조회
    List<UserReservationViewDto> getReservation(HttpSession session);

    // 예매 삭제
    void deleteReservation(String performanceScheduleId, String seatId, String seatNumber);
}
