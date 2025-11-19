import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";


const API_AUTH_URL = "http://localhost:8080/api/user";


const AuthContext  = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
}

const AuthProvider= ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 4. 페이지 로드 시 로그인 상태 확인
    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
        // 로그인 상태 확인 함수 기능 만들기
        axios.get(API_AUTH_URL+"/check", {
            withCredentials:true })
            .then(res => {
                setUser(res.data.user);
            })
            .catch(err => {
                console.log("로그인 상태 확인 오류 : ",err);
                setUser(null);
            })
            .finally(() => setLoading(false))
    }

    const loginFn = (memberEmail, memberPassword) => {
        return  axios.post(API_AUTH_URL+'/login',
            {memberEmail,memberPassword},
            {withCredentials:true})
            .then(
                res => {
                    console.log("res.data      : " + res.data);
                    console.log("res.data.user : " + res.data.user);

                    if(res.data.success && res.data.user) {
                        setUser(res.data.user);
                        return{
                            success : true,
                            message : res.data.message
                        };
                    } else {
                        return {
                            success: false,
                            message: res.data.message || '로그인 실패'
                        }
                    }

                })
            .catch( err => {
                console.error("로그인 에러 : ", err);
                return {
                    success : false,
                    message : '로그인 중 오류가 발생했습니다.'
                };
            });
    };

    const logoutFn = () => {
        return axios.post(API_AUTH_URL+'/logout',
            {},{withCredentials:true}            )
            .then(res => {
                console.log("로그아웃 응답 : ", res.data);
                setUser(null); // 사용자 정보 초기화
                return { success : true };
            })
            .catch(err => {
                console.error("로그아웃 에러 : ", err);
                return {success: false};
            });
    }

    const value = {
        user,
        loading,
        loginFn,
        logoutFn,
        isAuthenticated:!!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}
export default AuthProvider;