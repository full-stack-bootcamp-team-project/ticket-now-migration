package com.ticketnow.user.model.mapper;

import com.ticketnow.user.model.dto.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    // 회원가입
    void userSignup(User user);

    // 유저 로그인
    User userLogin(String userEmail);

    // 유저 아이디 찾기
    String userFindId(String userName, String userSSN);

    // 비밀번호 찾기
    String userFindPassword(String userEmail, String userPhone);

    // 비밀번호 찾기 -> 비밀번호 변경
    void userUpdatePassword(String userId, String newPassword);

    // 유저 정보 조회 -> 마이페이지
    User userGetInfo(String userId);

    String getUserPassword(String userId);

    void updatePassword(String userId, String newPassword);

    // 유저 정보 업데이트
    void userUpdateInfo(User user, String userId);

    // 유저 이메일 중복 확인
    boolean checkEmail(String userEmail);

    // 유저 핸드폰 번호 중복 확인
    boolean checkPhone(String userPhone);

    // 유저 주민등록번호 중복 확인
    boolean checkSSN(String userSSN);
}
