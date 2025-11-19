package com.ticketnow.common.interceptor;

import com.ticketnow.user.model.dto.User;
import com.ticketnow.common.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AlreadyLoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        HttpSession session = request.getSession(false);
        User loginUser = (session != null) ? SessionUtil.getLoginUser(session) : null;

        if (loginUser != null) {
            response.sendRedirect("/");
            return false;
        }
        return true;
    }
}
