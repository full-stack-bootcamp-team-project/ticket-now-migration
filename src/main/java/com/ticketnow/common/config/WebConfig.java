package com.ticketnow.common.config;

import com.ticketnow.common.interceptor.LoginInterceptor;
import com.ticketnow.common.interceptor.AlreadyLoginInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final AlreadyLoginInterceptor alreadyLoginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(loginInterceptor)
                .addPathPatterns(
                        "/reservation",
                        "/user/myPage"
                )
                .excludePathPatterns(
                        "/",
                        "/performance",
                        "/performance/detail",
                        "/user/login",
                        "/user/signup",
                        "/performance/search",
                        "/user/findId",
                        "/user/findPassword",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/api/**",
                        "/user/add"
                );


        registry.addInterceptor(alreadyLoginInterceptor)
                .addPathPatterns("/user/login", "/user/signup");
    }
}
