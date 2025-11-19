package com.ticketnow.user.model.service;

import com.ticketnow.user.model.dto.User;
import com.ticketnow.user.model.mapper.UserMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    // 회원가입
    @Override
    public void userSignup(User user) {
        user.setUserId("U" + System.currentTimeMillis()); // id 값 생성
        user.setUserPw(bCryptPasswordEncoder.encode(user.getUserPw()));
        userMapper.userSignup(user);
    }

    // 유저 로그인
    @Override
    public User userLogin(String userEmail, String userPw) {
        User user = userMapper.userLogin(userEmail);

        // 사용자가 없거나 비밀번호가 일치하지 않으면 null 반환
        if (user == null || !bCryptPasswordEncoder.matches(userPw, user.getUserPw())) {
            return null;
        }

        return user;
    }

    // 유저 아이디 찾기
    @Override
    public String userFindId(String userName, String userSSN) {
        return userMapper.userFindId(userName, userSSN);
    }

    // 비밀번호 찾기 -> 로그인
    @Override
    public String userFindPassword(String userEmail, String userPhone) {
        return userMapper.userFindPassword(userEmail, userPhone);
    }

    // 비밀번호 찾기 -> 비밀번호 변경 로그인
    @Override
    public void userUpdatePassword(String userId, String newPassword) {
        String bCryptPassword = bCryptPasswordEncoder.encode(newPassword);
        userMapper.userUpdatePassword(userId, bCryptPassword);
    }


    // 유저 정보 조회 -> 마이페이지
    @Override
    public User userGetInfo(HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        String userId = loginUser.getUserId();
        return userMapper.userGetInfo(userId);
    }

    // 비밀번호 찾기 -> 마이페이지
    @Override
    public boolean userConfirmPassword(HttpSession session, String currentPassword) {
        User loginUser = (User) session.getAttribute("loginUser");
        String userId = loginUser.getUserId();

        String storedPassword = userMapper.getUserPassword(userId);

        return bCryptPasswordEncoder.matches(currentPassword, storedPassword);
    }

    // 비밀번호 변경 -> 마이페이지
    @Override
    public void userUpdatePasswordMyPage(HttpSession session, String currentPassword, String newPassword) {

        User loginUser = (User) session.getAttribute("loginUser");
        String userId = loginUser.getUserId();

        String storedPassword = userMapper.getUserPassword(userId);

        if (!bCryptPasswordEncoder.matches(currentPassword, storedPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        String encodedNewPassword = bCryptPasswordEncoder.encode(newPassword);

        userMapper.updatePassword(userId, encodedNewPassword);
    }


    // 유저 정보 업데이트
    @Override
    public void userUpdateInfo(User user, HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        String userId = loginUser.getUserId();

        userMapper.userUpdateInfo(user, userId);
    }

    // 유저 이메일 중복 확인
    @Override
    public boolean checkEmail(String userEmail) {
        return userMapper.checkEmail(userEmail);
    }

    // 유저 핸드폰 번호 중복 확인
    @Override
    public boolean checkPhone(String userPhone) {
        return userMapper.checkPhone(userPhone);
    }

    // 유저 주민등록번호 중복 확인
    @Override
    public boolean checkSSN(String userSSN) {
        return userMapper.checkSSN(userSSN);
    }
}
