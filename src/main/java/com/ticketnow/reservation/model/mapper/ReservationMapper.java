package com.ticketnow.reservation.model.mapper;

import com.ticketnow.reservation.model.dto.UserReservationViewDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReservationMapper {

    // 예매
    void insertReservation(String performanceScheduleId, String userId, String seatId, String seatNumber);

    // 예매 내역 조회
    List<UserReservationViewDto> getReservation(String userId);

    // 예매 삭제
    void deleteReservation(String performanceScheduleId, String seatId, String seatNumber);
}
