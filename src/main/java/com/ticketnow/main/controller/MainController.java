package com.ticketnow.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class MainController {

    // 메인페이지
    @GetMapping("/")
    public String index() {
        return "index";
    }

    // 카테고리별 공연 페이지
    @GetMapping("/performance")
    public String performanceCategory(@RequestParam String category) {
        return "pages/performance";
    }

    // 예매 페이지
    @GetMapping("/reservation")
    public String reservation(@RequestParam String performanceId){
        return "pages/reservation";
    }

    // 회원가입 페이지
    @GetMapping("/user/signup")
    public String signup() {
        return "pages/signup";
    }

    // 로그인 페이지
    @GetMapping("/user/login")
    public String login() {
        return "pages/login";
    }

    // 공연 검색 페이지
    @GetMapping("/performance/search")
    public String search(@RequestParam String searchType, @RequestParam String keyword) {
        return "pages/search";
    }

    // 마이페이지
    @GetMapping("/user/myPage")
    public String myPage(){
        return "pages/myPage";
    }

    // 공연 상세 페이지
    @GetMapping("/performance/detail")
    public String performanceDetail(@RequestParam String performanceId){
        return "pages/performanceInfo";
    }

}
