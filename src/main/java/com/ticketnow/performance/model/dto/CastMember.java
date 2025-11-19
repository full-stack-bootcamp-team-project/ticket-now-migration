package com.ticketnow.performance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CastMember {

    // 출연자 id
    private String castMemberId;

    // 출연자 이름
    private String castMemberName;

    // 출연자 사진
    private String castMemberImagePath;
}
