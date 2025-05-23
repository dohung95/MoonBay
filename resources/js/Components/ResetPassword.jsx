import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom"; // Để lấy token và email từ URL
import '../../css/my_css/ResetPassword.css';

const ResetPassword = ({  openLoginPopup }) => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Xóa thông báo cũ

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/reset-password', {
                token,
                email,
                password,
                password_confirmation: confirmPassword,
            }, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Nhận diện request AJAX
                },
            });

            if (response.status === 200) {
                setMessage('Password has been reset successfully. Redirecting to login...');
                setTimeout(() => {
                    openLoginPopup();
                    window.location.href = '/';
                }, 2000); // Thay đổi thời gian chờ nếu cần
                
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'An error occurred while resetting password.';
            console.error("Reset Password error:", error.response || error);
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBackHome = () => {
        window.location.href = '/';
    }

    return (
        <div className="resetPass-page">
            <div className="popup-overlay">
                <div className="popup-content">
                    <h2>Reset Password</h2>
                    <form onSubmit={handleResetPassword}>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email || ''}
                        />
                        <input
                            type="password"
                            className="form-input"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        {message && <p className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</p>}
                    </form>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handleBackHome}>Back to Login</button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;