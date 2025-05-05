import React, { useState, useEffect, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

import Navbar from './Components/Navbar.jsx';

import Home from './Components/Home.jsx';
import AboutUs from './Components/AboutUs.jsx';
import OurHotels from './Components/ourhotels.jsx';
import Rooms from './Components/rooms.jsx';
import Contact from './Components/Contact.jsx';
import ServicePage from './Components/Services.jsx';

import Footer from './Components/Footer.jsx';
import Back_Top from './Components/Back_Top.jsx';

import Booking from './Components/booking.jsx';
import Login from './Components/login.jsx';
import Register from './Components/Register.jsx';
import { AuthContext, AuthProvider } from './Components/AuthContext.jsx';
import Account from './Components/account.jsx';
import ForgotPassword from './Components/ForgotPassword.jsx';
import PopupBookNow from './Components/PopupBookNow.jsx';

import NotificationManager from './Components/NotificationManager.jsx'; 


// CAUTION: This function is dangerous, do not change anything here
export const PopupContext = React.createContext();
const AuthHandler = () => {
    const { user, login } = useContext(AuthContext);
    const { closePopup } = useContext(PopupContext) || {};
    const location = useLocation();
    const navigate = useNavigate();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('user');
        const error = urlParams.get('error');

        if (token && userData && !user) {
            hasProcessed.current = true;
            const parsedUserData = JSON.parse(decodeURIComponent(userData));
            const authUser = { ...parsedUserData, token };
            login(authUser, token);
            window.location.href = '/';
        } else if (error) {
            console.log('Error from backend:', error);
            navigate('/', { replace: true });
            if (closePopup) closePopup();
        }
    }, [location.search, login, user, navigate, closePopup]);

    return null;
};
// --------------------------------------------------------------------------------------------



const App = () => {
    const [isPopupLogin, setIsPopupLogin] = useState(false);
    const [isPopupRegister, setIsPopupRegister] = useState(false);
    const [isPopupForgotPassword, setIsPopupForgotPassword] = useState(false);
    const [isPopupBookNow, setIsPopupBookNow] = useState(false);

    // Mở popup đăng nhập
    const openLoginPopup = () => {
        setIsPopupLogin(true);
        setIsPopupRegister(false);
        setIsPopupForgotPassword(false);
    };

    // Mở popup đăng ký
    const openRegisterPopup = () => {
        setIsPopupRegister(true);
        setIsPopupLogin(false);
        setIsPopupForgotPassword(false);
    };

    // Mở popup quên mật khẩu
    const openForgotPassword = () => {
        setIsPopupForgotPassword(true);
        setIsPopupLogin(false);
        setIsPopupRegister(false);
    };

    // Đóng cả hai popup
    const closePopup = () => {
        setIsPopupLogin(false);
        setIsPopupRegister(false);
        setIsPopupForgotPassword(false);
        setIsPopupBookNow(false);
    };

    const checkLogin = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            setIsPopupLogin(true);
            return false;
        }
    }

    const checkLogins = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            setIsPopupLogin(true);
            return false;
        }

        setIsPopupBookNow(true);
    };

    return (
        <PopupContext.Provider value={{ closePopup }}>
        <AuthProvider>
            <Router>
                <Navbar openLoginPopup={openLoginPopup} />
                <AuthHandler /> {/* Xử lý đăng nhập tự động từ Google */}
                <Login isPopupLogin={isPopupLogin} closePopup={closePopup} openRegisterPopup={openRegisterPopup} openForgotPassword={openForgotPassword} />
                <Register isPopupRegister={isPopupRegister} closePopup={closePopup} openLoginPopup={openLoginPopup} />
                <ForgotPassword closePopup={closePopup} openLoginPopup={openLoginPopup} isPopupForgotPassword={isPopupForgotPassword} />
                <PopupBookNow isPopupBookNow={isPopupBookNow} closePopup={closePopup} selectedRoomName={selectedRoomName}/>
                <AuthHandler />
                <NotificationManager />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/booking" element={<Booking checkLogin={checkLogin} checkLogins={checkLogins} isPopupBookNow={isPopupBookNow} closePopup={closePopup} />} />
                    <Route path="/account" element={<Account openLoginPopup={openLoginPopup} />} />

                    <Route path="/About" element={<AboutUs />} />
                    <Route path="/Ourhotels" element={<OurHotels />} />
                    <Route path="/Rooms" element={<Rooms />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route path="/Services" element={<ServicePage />} />
                    <Route path="*" element={<Home />} />
                </Routes>
                <Footer />
                <Back_Top />
            </Router>
        </AuthProvider>
        </PopupContext.Provider>
    );
};

export default App;
ReactDOM.createRoot(document.getElementById('app')).render(<App />);