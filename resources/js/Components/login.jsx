import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/my_css/login.css';
import { AuthContext } from './AuthContext.jsx';
import Cookies from 'js-cookie';

// Cấu hình Axios cho Sanctum SPA mode
axios.defaults.withCredentials = true;

const Login = ({ isPopupLogin, closePopup, openRegisterPopup, openForgotPassword }) => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login, setUser } = useContext(AuthContext); // Lấy login từ AuthContext
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [id]: '',
            general: '',
        }));
    };

    const handleOverlayClick = (e) => {
        if (isPopupLogin && e.target.classList.contains("popup-overlay") && closePopup) {
            closePopup();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        const newErrors = {};

        if (!formData.email) {
            isValid = false;
            newErrors.email = "Email is required.";
        }

        if (!formData.password) {
            isValid = false;
            newErrors.password = "Password is required.";
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // Bước 1: Lấy CSRF token từ Laravel Sanctum
            const csrfResponse = await axios.get('/sanctum/csrf-cookie', { withCredentials: true });

            // Bước 2: Gửi yêu cầu đăng nhập
            const response = await axios.post('/login', {
                email: formData.email,
                password: formData.password,
            }, { withCredentials: true });


            // Bước 3: Lưu thông tin người dùng vào AuthContext
            const userData = response.data.user;
            login(userData);

            if (response.data.token) {
                Cookies.set('auth_token', response.data.token, { expires: 30 });
            }

            Cookies.set('user', JSON.stringify(userData), {
                expires: 30,
                path: '/',
                sameSite: 'Lax',
                secure: false,
            });

            if (response.data.token) {
                Cookies.set('auth_token', response.data.token, {
                    expires: 30,
                    path: '/',
                    sameSite: 'Lax',
                    secure: false,
                });
            }



            // Bước 4: Chuyển hướng sau khi đăng nhập thành công
            window.showNotification("Login successful!", "success");
            if (isPopupLogin && closePopup) {
                closePopup();
            }
        } catch (error) {
            console.error("Login error:", error.response || error);
            setErrors({
                ...newErrors,
                general: "Email or password is incorrect.",
            });
            window.showNotification("Login failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý query string từ redirect Google
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/google/login');
            if (response.status === 200 && response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Google login error:', error.response || error);
            console.error('Failed to initiate Google login:' + (error.response?.data?.message || error.message), error);
            window.showNotification('Failed to initiate Google login: ', 'error');
        }
    };

    return (
        <>
            {isPopupLogin && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" style={{ color: 'black' }} onClick={closePopup}>&times;</button>
                        <h2>Login</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="input-container">
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder=" "
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <label className="form-input-label">Email</label>
                            </div>
                            {errors.email && <div className="error-message">{errors.email}</div>}
                            <div className="input-container">
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder=" "
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <label className="form-input-label">Password</label>
                            </div>
                            {errors.password && <div className="error-message">{errors.password}</div>}
                            {errors.general && <div className="error-message">{errors.general}</div>}
                            <div className="switch-to-register">
                                <p>
                                    <Link onClick={openForgotPassword} to="#">Forgot Password</Link>
                                </p>
                                <p>
                                    Don't have an account?{" "}
                                    <Link onClick={openRegisterPopup} to="#">Register</Link>
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <hr />

                        <div className="social-login">
                            <button onClick={handleGoogleLogin} className="google-login-btn">Sign in with Google</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;