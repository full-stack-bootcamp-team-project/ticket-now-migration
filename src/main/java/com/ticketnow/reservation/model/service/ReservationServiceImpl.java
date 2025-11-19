package com.ticketnow.reservation.model.service;

import com.ticketnow.reservation.model.dto.Reservation;
import com.ticketnow.reservation.model.dto.UserReservationViewDto;
import com.ticketnow.reservation.model.mapper.ReservationMapper;
import com.ticketnow.user.model.dto.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ReservationServiceImpl implements ReservationService{

   private final ReservationMapper reservationMapper;

    @Override
    public void insertReservation(String performanceScheduleId, String userId, String seatId, String seatNumber) {
        reservationMapper.insertReservation(performanceScheduleId,userId,seatId,seatNumber);
    }

    @Override
    public List<UserReservationViewDto> getReservation(HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        String userId = loginUser.getUserId();
        return reservationMapper.getReservation(userId);
    }

    @Override
    public void deleteReservation(String performanceScheduleId, String seatId, String seatNumber) {
        reservationMapper.deleteReservation(performanceScheduleId, seatId, seatNumber);
    }
}
