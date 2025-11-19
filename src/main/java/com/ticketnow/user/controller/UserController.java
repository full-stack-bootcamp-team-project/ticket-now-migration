package com.ticketnow.user.controller;

import com.ticketnow.common.util.SessionUtil;
import com.ticketnow.user.model.dto.User;
import com.ticketnow.user.model.service.UserService;
import com.ticketnow.user.model.service.UserServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserServiceImpl userService;

    // http://localhost:8080/api/user/signup
    /*
    {
      "userId" : "U004",
      "userName": "박보검",
      "userNickname": "보검",
      "userSSN": "930616-1234567",
      "userPhone": "010-2222-3333",
      "userEmail": "park@example.com",
      "userPw" : "qwe1234",
      "userAddress": "서울 강남구",
      "userGender": "M"
    }
    */
    // 회원가입 기능
    @PostMapping("/signup")
    public void userSignup(@RequestBody User user) {
        userService.userSignup(user);
    }

    // http://localhost:8080/api/user/login?userEmail=minsu@example.com&userPw=pw1234
    // 로그인 기능
    @PostMapping("/login")
    @ResponseBody
    public Map<String, String> userLogin(@RequestParam String userEmail,
                                         @RequestParam String userPw,
                                         HttpServletRequest request,
                                         HttpSession session) {

        Map<String, String> result = new HashMap<>();
        User user = userService.userLogin(userEmail, userPw);

        if (user == null) {
            result.put("status", "401");
            return result;
        }

        request.changeSessionId();
        SessionUtil.setLoginUser(session, user);

        String prevPage = (String) session.getAttribute("prevPage");
        if (prevPage == null) prevPage = "/";
        else session.removeAttribute("prevPage");

        result.put("status", "200");
        result.put("prevPage", prevPage);

        return result;
    }

    // 로그인 체크
    @GetMapping("/login/check")
    public boolean checkLogin(HttpSession session) {
        return SessionUtil.isLoginUser(session); // loginUser 세션 확인
    }

    // http://localhost:8080/api/user/logout
    // 로그아웃 기능
    @PostMapping("/logout")
    public void userLogout(HttpSession session, HttpServletResponse res) {
        SessionUtil.invalidateLoginUser(session);
    }

    // http://localhost:8080/api/user/login/findId?userName=김민수&userSSN=900101-1234567
    // 아이디 찾기 기능
    @PostMapping("/login/findId")
    public String userFindId(@RequestParam String userName, @RequestParam String userSSN) {
        return userService.userFindId(userName, userSSN);
    }

    // http://localhost:8080/api/user/login/findPassword?userEmail=minsu@example.com&userPhone=010-1234-5678
    // 로그인 비밀번호 찾기 기능
    @PostMapping("/login/findPassword")
    public String userFindPassword(@RequestParam String userEmail, @RequestParam String userPhone) {
        return userService.userFindPassword(userEmail, userPhone);
    }

    // http://localhost:8080/api/user/login/updatePassword?userId=U001&newPassword=test1234
    // 로그인 페이지 비밀번호 변경 기능
    @PatchMapping("/login/updatePassword")
    public void userUpdatePassword(@RequestParam String userId, @RequestParam String newPassword) {
        userService.userUpdatePassword(userId, newPassword);
    }

    // http://localhost:8080/api/user/myPage?userId=U001
    // 개인정보 조회 기능
    @GetMapping("/myPage")
    public User userGetInfo(HttpSession session) {
        return userService.userGetInfo(session);
    }

    // http://localhost:8080/api/user/myPage/confirmPassword?currentPassword=pw1234
    // 마이페이지 현재 비밀번호 확인 기능
    @PostMapping("/myPage/confirmPassword")
    public boolean userConfirmPassword(@RequestParam String currentPassword, HttpSession session) {
        return userService.userConfirmPassword(session, currentPassword);
    }

    // http://localhost:8080/api/user/myPage/updatePassword?currentPassword=pw1234&newPassword=test1234
    // 마이페이지 비밀번호 변경 기능
    @PatchMapping("/myPage/updatePassword")
    public void userUpdatePasswordMyPage(@RequestParam String currentPassword, @RequestParam String newPassword, HttpSession session) {
        userService.userUpdatePasswordMyPage(session, currentPassword, newPassword);
    }

    // U001,pw1234,900101-1234567,김민수,밍밍,010-1234-5678,minsu@example.com,서울 강남구,M,bronze,0
    // http://localhost:8080/api/user/myPage/updateInfo
    /*
    {
      "userId": "U001",
      "userName": "김민수",
      "userNickname": "밍밍",
      "userPhone": "010-1234-5678",
      "userEmail": "minsu@example.com",
      "userAddress": "서울 강남구",
      "userGender": "M"
    }
    */
    // 개인정보 변경 기능
    @PutMapping("/myPage/updateInfo")
    public void userUpdateInfo(@RequestBody User user, HttpSession session) {
        userService.userUpdateInfo(user, session);
    }

    // http://localhost:8080/api/user/checkEmail?userEmail=minsu@example.com
    // 이메일 중복확인 기능
    @PostMapping("/checkEmail")
    public boolean checkEmail(@RequestParam String userEmail) {
        return userService.checkEmail(userEmail);
    }

    // http://localhost:8080/api/user/checkPhone?userPhone=010-1234-5678
    // 전화번호 중복확인 기능
    @PostMapping("/checkPhone")
    public boolean checkPhone(@RequestParam String userPhone) {
        return userService.checkPhone(userPhone);
    }

    // http://localhost:8080/api/user/checkSSN?userSSN=900101-1234567
    // 주민등록번호 중복확인 기능
    @PostMapping("/checkSSN")
    public boolean checkSSN(@RequestParam String userSSN) {
        return userService.checkSSN(userSSN);
    }
}