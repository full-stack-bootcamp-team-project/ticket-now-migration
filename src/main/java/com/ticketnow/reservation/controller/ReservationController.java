package com.ticketnow.reservation.controller;

import com.ticketnow.common.util.SessionUtil;
import com.ticketnow.reservation.model.dto.Reservation;
import com.ticketnow.reservation.model.dto.UserReservationViewDto;
import com.ticketnow.reservation.model.service.ReservationService;
import com.ticketnow.reservation.model.service.ReservationServiceImpl;
import com.ticketnow.user.model.dto.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/reservation")
public class ReservationController {

    private final ReservationServiceImpl reservationService;

    // http://localhost:8080/api/reservation/insert?performanceScheduleId=PS003&userId=U002&seatId=A&seatNumber=11
    // 예매 생성
    /*
    @PostMapping("/insert")
    public void insertReservation(@RequestParam String performanceScheduleId,
                                  @RequestParam String userId,
                                  @RequestParam String seatId,
                                  @RequestParam String seatNumber) {
        reservationService.insertReservation(performanceScheduleId, userId, seatId, seatNumber);
    }
    */
    @PostMapping("/insert")
    public void insertReservation(
            @RequestParam String performanceScheduleId,
            @RequestParam String seatId,
            @RequestParam String seatNumber,
            HttpSession session) {

        User loginUser = SessionUtil.getLoginUser(session);
        if (loginUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        reservationService.insertReservation(
                performanceScheduleId,
                loginUser.getUserId(),
                seatId,
                seatNumber
        );
    }

    // http://localhost:8080/api/reservation/get?userId=U002
    // 특정 사용자 예매 조회
    @GetMapping("/get")
    public List<UserReservationViewDto> getReservation(HttpSession  session) {
        return reservationService.getReservation(session);
    }

    // http://localhost:8080/api/reservation/delete?performanceScheduleId=PS003&userId=U002&seatId=A&seatNumber=11
    // 예매 삭제
    @DeleteMapping("/delete")
    public void deleteReservation(@RequestParam String performanceScheduleId,
                                  @RequestParam String seatId,
                                  @RequestParam String seatNumber) {
        reservationService.deleteReservation(performanceScheduleId, seatId, seatNumber);
    }
}