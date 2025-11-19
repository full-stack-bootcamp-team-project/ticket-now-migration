import { createContext, useState, useCallback } from "react";

export const ToastContext = createContext();

const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });

        setTimeout(() => {
            setToast(null);
        }, 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div style={styles.wrapper}>
                    <div style={{ ...styles.toast, ...styles[toast.type] }}>
                        {toast.message}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;

const styles = {
    wrapper: {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
    },
    toast: {
        padding: "12px 18px",
        borderRadius: "8px",
        color: "white",
        fontWeight: "bold",
        marginBottom: "8px",
        minWidth: "180px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    success: {
        backgroundColor: "#4CAF50",
    },
    error: {
        backgroundColor: "#F44336",
    },
    warning: {
        backgroundColor: "#FF9800",
    },
};

// 알림 메시지 표시
// 성공/에러/경고 토스트