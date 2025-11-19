package com.ticketnow.common.aop;

import org.aspectj.lang.annotation.Pointcut;


public class PointcutBundle {

    @Pointcut("execution(* com.ticketnow..*Controller*.*(..))")
    public void controllerPointCut(){
    }

    @Pointcut("execution(*  com.ticketnow..*ServiceImpl*.*(..))")
    public void serviceImplPointCut(){

    }

}
