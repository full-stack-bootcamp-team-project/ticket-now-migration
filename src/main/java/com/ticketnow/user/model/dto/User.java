package com.ticketnow.user.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    // 유저 아이디
    private String userId;
    // 유저 비밀번호
    private String userPw;
    // 유저 주민번호
    private String userSSN;
    // 유저 이름
    private String userName;
    // 유저 닉네임
    private String userNickname;
    // 유저 전화번호
    private String userPhone;
    // 유저 이메일
    private String userEmail;
    // 유저 주소
    private String userAddress;
    // 유저 성별
    private String userGender;
    // 유저 등급
    private String grade;
    // 유저 총 소비량
    private long userTotalCount;

}
