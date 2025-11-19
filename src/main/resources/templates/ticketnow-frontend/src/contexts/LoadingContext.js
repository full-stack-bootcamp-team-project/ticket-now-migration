import { createContext, useState } from "react";

export const LoadingContext = createContext();

const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    const value ={
        isLoading,
        startLoading,
        stopLoading
    }

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;
