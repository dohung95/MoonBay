import React, { useState, useContext } from 'react'; // Thêm useContext
import { Link } from 'react-router-dom'; // Thêm Link nếu dùng thẻ <a> với onClick
import axios from 'axios'; // Thêm axios
import '../../css/my_css/login.css';
import { AuthContext } from './AuthContext.jsx'; // Thêm AuthContext

const Login = ({ isPopupLogin, closePopup, openRegisterPopup, openForgotPassword }) => {
    const [email, setEmail] = useState(''); // Thêm state email
    const [password, setPassword] = useState(''); // Thêm state password
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext); // Lấy login từ AuthContext

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        const newErrors = {};

        if (!email) {
            isValid = false;
            newErrors.email = "Email is required.";
        }

        if (!password) {
            isValid = false;
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);

        if (!isValid) return;

        try {
            const response = await axios.post("/api/login", {
                email,
                password,
            });

            if (response.status === 200) {
                const { user, token } = response.data;
                if (!user || !user.id) {
                    throw new Error("User data is incomplete: missing user");
                }
                if (!token) {
                    throw new Error("Token not found in response");
                }
                login(user, token);
                closePopup();
            } else {
                throw new Error("Unexpected response status: " + response.message);
            }
        } catch (error) {
            console.error("Login error:");
            console.log("Login error:", error);
            setErrors({
                ...newErrors,
                general:  "Email or password is incorrect.",
            });
        }
    };

    return (
        <>
            {isPopupLogin && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup}>
                            ×
                        </button>
                        <h2>Login</h2>

                        <form onSubmit={handleSubmit}> {/* Thêm onSubmit */}
                            <div className="input-container">
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder=" "
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label className="form-input-label">Email</label>
                            </div>
                            {errors.email && <div className="error-message">{errors.email}</div>} {/* Hiển thị lỗi email */}
                            <div className="input-container">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder=" "
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label className="form-input-label">Password</label>
                            </div>
                            {errors.password && <div className="error-message">{errors.password}</div>}
                            {errors.general && <div className="error-message">{errors.general}</div>}
                            <div className="switch-to-register">
                                <p onClick={openForgotPassword}><Link >ForgotPassword</Link></p>
                                <p>
                                    Don't have an account?{" "}
                                    <Link onClick={openRegisterPopup}>Register</Link>
                                </p>
                            </div>
                            <button type="submit" className="form-btn">Login</button>
                        </form>

                        <hr />

                        <div className="social-login">
                            <button className="google-login-btn">Sign in with Google</button>
                            <button className="facebook-login-btn">Sign in with Facebook</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;