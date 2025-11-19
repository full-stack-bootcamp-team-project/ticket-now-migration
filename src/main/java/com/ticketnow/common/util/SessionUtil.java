package com.ticketnow.common.util;

import com.ticketnow.user.model.dto.User;
import jakarta.servlet.http.HttpSession;

public class SessionUtil {

    private static final String LOGIN_USER = "loginUser";
    
    public static void setLoginUser(HttpSession session, User user) {
        session.setAttribute(LOGIN_USER, user);
        session.setMaxInactiveInterval(60 * 30);
    }
    public static User getLoginUser(HttpSession session) {
        return (User)session.getAttribute(LOGIN_USER);
    }
    public static boolean isLoginUser(HttpSession session) {
        return session.getAttribute(LOGIN_USER) != null;
    }
    public static void invalidateLoginUser(HttpSession session) {
        session.invalidate();
    }
}
