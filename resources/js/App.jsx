import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import '../css/App.css';
import Navbar from './Components/Navbar.jsx';

import Home from './Components/Home.jsx';
import AboutUs from './Components/AboutUs.jsx';
import OurHotels from './Components/ourhotels.jsx';
import Rooms from './Components/rooms.jsx';
import Contact from './Components/Contact.jsx';
import ServicePage from './Components/Services.jsx';

import Footer from './Components/Footer.jsx';

import Booking from './Components/booking.jsx';
import Login from './Components/login.jsx';
import Register from './Components/Register.jsx';
import { AuthProvider } from './Components/AuthContext.jsx';
import Account from './Components/account.jsx';
import ForgotPassword from './Components/ForgotPassword.jsx';
import PopupBookNow from './Components/PopupBookNow.jsx';

import NotificationManager from './Components/NotificationManager.jsx'; 


const App = () => {

    const [isPopupLogin, setIsPopupLogin] = useState(false);
    const [isPopupRegister, setIsPopupRegister] = useState(false);
    const [isPopupForgotPassword, setIsPopupForgotPassword] = useState(false);
    const [isPopupBookNow, setIsPopupBookNow] = useState(false);
    const [selectedRoomName, setSelectedRoomName] = useState(''); // State để lưu roomName

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
        setSelectedRoomName(''); // Reset roomName khi đóng popup
    };

    const checkLogin = () => {
        const user = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!user) {
            setIsPopupLogin(true);
            return false;
        }
    }

    const checkLogins = (roomName) => {
        const user = document.cookie.split('; ').find(row => row.startsWith('user='));
        if (!user) {
            setIsPopupLogin(true);
            return;
        }
        setIsPopupBookNow(true);
        setSelectedRoomName(roomName); // Lưu roomName
    };

    return (
        <AuthProvider>
            <Router>
                <Navbar openLoginPopup={openLoginPopup} />
                <Login isPopupLogin={isPopupLogin} closePopup={closePopup} openRegisterPopup={openRegisterPopup} openForgotPassword={openForgotPassword} />
                <Register isPopupRegister={isPopupRegister} closePopup={closePopup} openLoginPopup={openLoginPopup} />
                <ForgotPassword closePopup={closePopup} openLoginPopup={openLoginPopup} isPopupForgotPassword={isPopupForgotPassword} />
                <PopupBookNow isPopupBookNow={isPopupBookNow} closePopup={closePopup} selectedRoomName={selectedRoomName}/>
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
            </Router>
        </AuthProvider>
    );
};

export default App;
ReactDOM.createRoot(document.getElementById('app')).render(<App />);