import React, { useState, useContext, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
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
import ProtectedAdminRoute from './Components/ProtectedAdminRoute.jsx';
import ProtectedStaffRoute from './Components/ProtectedStaffRoute.jsx';
import AdminDashboard from './Components/Admin/AdminDashboard.jsx';
import StaffDashboard from './Components/Staff/StaffDashboard.jsx';

// components admin
import UserManagement from './Components/Admin/UserManagement.jsx';
import RoomListManagement from './Components/Admin/RoomListManagement.jsx';
import EmployeeListManagement from './Components/Admin/EmployeeListManagement.jsx';
import EditOffer from './Components/Admin/EditOffer.jsx';
import TinhNang4 from './Components/Admin/TinhNang4.jsx';
import TinhNang5 from './Components/Admin/TinhNang5.jsx';
import RoomManagement from './Components/Admin/RoomManagement.jsx';
//-----------------------------------------------------

//components staff
import StaffBookings from './Components/Staff/StaffBookings.jsx';
import StaffUser from './Components/Staff/StaffUser.jsx';
import StaffRooms from './Components/Staff/StaffRooms.jsx';
//---------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';

// PopupContext để quản lý trạng thái popup
export const PopupContext = React.createContext();

// Layout cho các route công khai
const PublicLayout = ({ children, openLoginPopup, isPopupLogin, isPopupRegister, isPopupForgotPassword, isPopupBookNow, closePopup, openRegisterPopup, openForgotPassword, selectedRoomName }) => {
    return (
        <div>
            <Navbar openLoginPopup={openLoginPopup} />
            <Login
                isPopupLogin={isPopupLogin}
                closePopup={closePopup}
                openRegisterPopup={openRegisterPopup}
                openForgotPassword={openForgotPassword}
            />
            <Register
                isPopupRegister={isPopupRegister}
                closePopup={closePopup}
                openLoginPopup={openLoginPopup}
            />
            <ForgotPassword
                closePopup={closePopup}
                openLoginPopup={openLoginPopup}
                isPopupForgotPassword={isPopupForgotPassword}
            />
            <PopupBookNow
                isPopupBookNow={isPopupBookNow}
                closePopup={closePopup}
                selectedRoomName={selectedRoomName}
            />
            <NotificationManager />
            {children}
            <Footer />
            <Back_Top />
        </div>
    );
};

// Layout cho các route admin
const AdminLayout = ({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
};

// Layout cho các route staff
const StaffLayout = ({ children }) => {
    return (
        <div>
            {children}
        </div>
    );
};

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

const App = () => {
    const [isPopupLogin, setIsPopupLogin] = useState(false);
    const [isPopupRegister, setIsPopupRegister] = useState(false);
    const [isPopupForgotPassword, setIsPopupForgotPassword] = useState(false);
    const [isPopupBookNow, setIsPopupBookNow] = useState(false);
    const [selectedRoomName, setSelectedRoomName] = useState('');

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
        const user = Cookies.get('user');
        if (!user) {
            setIsPopupLogin(true);
            return false;
        }
        return true;
    };

    const checkLogins = (roomName) => {
        if (!checkLogin()) {
            setIsPopupLogin(true);
            return false;
        }

        setIsPopupBookNow(true);
        setSelectedRoomName(roomName);
        return true;
    };

    return (
        <PopupContext.Provider value={{ closePopup }}>
            <AuthProvider>
                <Router>
                    <AuthHandler />
                    <Routes>
                        {/* Các route công khai */}
                        <Route
                            path="/"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Home />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/booking"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Booking
                                        checkLogin={checkLogin}
                                        checkLogins={checkLogins}
                                        isPopupBookNow={isPopupBookNow}
                                        closePopup={closePopup}
                                    />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Account openLoginPopup={openLoginPopup} />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/About"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <AboutUs />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/Ourhotels"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <OurHotels />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/Rooms"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Rooms checkLogins={checkLogins} />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/Contact"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Contact />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="/Services"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <ServicePage />
                                </PublicLayout>
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <PublicLayout
                                    openLoginPopup={openLoginPopup}
                                    isPopupLogin={isPopupLogin}
                                    isPopupRegister={isPopupRegister}
                                    isPopupForgotPassword={isPopupForgotPassword}
                                    isPopupBookNow={isPopupBookNow}
                                    closePopup={closePopup}
                                    openRegisterPopup={openRegisterPopup}
                                    openForgotPassword={openForgotPassword}
                                    selectedRoomName={selectedRoomName}
                                >
                                    <Home />
                                </PublicLayout>
                            }
                        />

                        {/* Route Admin */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                        <AdminDashboard />
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        >
                        <Route path="UserManagement" element={<UserManagement />} />
                        <Route path="RoomListManagement" element={<RoomListManagement />} />
                        <Route path="EmployeeListManagement" element={<EmployeeListManagement />} />
                        <Route path="EditOffer" element={<EditOffer />} />
                        <Route path="tinh_nang4" element={<TinhNang4 />} />
                        <Route path="tinh_nang5" element={<TinhNang5 />} />
                        <Route path="RoomManagement" element={<RoomManagement />} />
                        </Route>
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/bookings"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/rooms"
                            element={
                                <ProtectedAdminRoute>
                                    <AdminLayout>
                                    </AdminLayout>
                                </ProtectedAdminRoute>
                            }
                        />

                        {/* Route Staff */}
                        <Route
                            path="/staff"
                            element={
                                <ProtectedStaffRoute>
                                    <StaffLayout>
                                        <StaffDashboard />
                                    </StaffLayout>
                                </ProtectedStaffRoute>
                            }
                        >
                            <Route
                                path="UserData"
                                element={
                                    <StaffUser />
                                }
                            />
                            <Route
                                path="BookingList"
                                element={
                                    <StaffBookings />
                                }
                            />
                            <Route
                                path="RoomList"
                                element={
                                    <StaffRooms />
                                }
                            />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </PopupContext.Provider>
    );
};

export default App;

ReactDOM.createRoot(document.getElementById('app')).render(<App />);