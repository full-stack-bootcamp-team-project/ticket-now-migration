package com.ticketnow.common.interceptor;

import com.ticketnow.user.model.dto.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        HttpSession session = request.getSession(false);
        User loginUser = (session != null) ? (User) session.getAttribute("loginUser") : null;

        // 로그
        String sessionId = (session != null) ? session.getId() : "no-session";
        System.out.println("[요청 로그] JSESSIONID=" + sessionId
                + ", User=" + (loginUser != null ? loginUser.getUserEmail() : "anonymous")
                + ", URI=" + request.getRequestURI());

        if (loginUser == null) {
            // 접근하려던 URL과 쿼리까지 저장
            String redirectUrl = request.getRequestURI();
            if (request.getQueryString() != null) {
                redirectUrl += "?" + request.getQueryString();
            }

            request.getSession(true).setAttribute("prevPage", redirectUrl);

            response.sendRedirect("/user/login");
            return false;
        }

        return true;
    }
}
