import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import AuthContext from './contexts/AuthContext';
import LoadingProvider from "./contexts/LoadingContext";
import {ToastContext} from "./contexts/ToastContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthContext>
        <LoadingProvider>
            <ToastContext>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </ToastContext>
        </LoadingProvider>
    </AuthContext>
);

