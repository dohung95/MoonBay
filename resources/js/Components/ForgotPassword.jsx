import React, { useState } from "react";
import axios from 'axios';
import '../../css/my_css/ForgotPassword.css'

const ForgotPassword = ({ isPopupForgotPassword, closePopup, openLoginPopup }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        console.log("Email input:", email);
        setLoading(true);
        try {
            const response = await axios.post('/api/ForgotPassword', { email });
            if (response.status === 200) {
                setMessage('Reset link sent to your email.');
            }
        } catch (error) {
            console.error("Forgot Password error:", error.response || error);
            setMessage(error.response?.data?.message || 'Error occurred.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {isPopupForgotPassword && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup}>
                            ×
                        </button>
                        <h2>Forgot Password</h2>
                        <form onSubmit={handleForgotPassword}>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            {message && <p>{message}</p>}
                        </form>
                        <button className="btn btn-primary" onClick={openLoginPopup}>Back to Login</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ForgotPassword;