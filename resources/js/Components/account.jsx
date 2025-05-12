import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/my_css/account.css';
import Banner from './banner';




const Account = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [latestBooking, setLatestBooking] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user === null) {
            return;
        }

        if (!user || !user.id) {
            setError('Please log in to view your information.');
            setLoading(false);
            return;
        }

        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        });

        setLoading(false);
    }, [user]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!user || !user.id || !token) return;
                const response = await axios.get(`/api/users/${user.id}/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const sortedBookings = response.data.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setBookings(sortedBookings);
                setLatestBooking(sortedBookings[0] || null);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bookings:', err.response || err.message);
                setError('Failed to load bookings. Please try again.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.get('/sanctum/csrf-cookie');

        try {
            const response = await axios.put(`/api/users/${user.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            updateUser(response.data.user);
            setIsEditing(false);
            window.showNotification('Profile updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            window.showNotification('Failed to update profile', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            window.showNotification('New password and confirmation do not match.', 'error');
            return;
        }

        try {
            // console.log('Token being sent:', token); // Debug token
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            const response = await axios.post(
                `/api/users/${user.id}/change-password`,
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Sử dụng remember_token
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            setIsChangingPassword(false);
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            window.showNotification('Password changed successfully!', 'success');
        } catch (err) {
            console.error('Error changing password:', err.response?.data || err.message);
            window.showNotification('Failed to change password', 'error');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
    };

    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    };

    const handleCancelBooking = async (id) => {
        console.log(`Canceling booking with ID: ${id}`);
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                const booking = bookings.find((b) => b.id === id);
                const checkinDate = new Date(booking.checkin_date);
                const now = new Date();

                // Đảm bảo so sánh thời gian đầy đủ
                if (now >= checkinDate) {
                    window.showNotification('Cannot cancel booking. Check-in time has passed or is due.', 'error');
                    return;
                }

                const response = await axios.delete(`/api/bookings/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setBookings(bookings.filter((booking) => booking.id !== id));
                window.showNotification('Booking cancelled successfully!', 'success');
            } catch (err) {
                console.error('Error cancelling booking:', err.response?.data || err.message);
                window.showNotification(err.response?.data?.message || 'Failed to cancel booking', 'error');
            }
        }
    };

    if (loading) return <div className="container_account"><p className="text-center text-black mt-5">Loading...</p></div>;
    if (error) return <div className="container_account"><p className="text-center text-black mt-5">{error}</p></div>;

    // Kiểm tra xem người dùng có đăng nhập bằng Google không
    const isLocalAccount = user.provider !== 'google';

    return (
        <>
            <Banner title="Information Account" />
            <div className="container_account">
                <div className="card">
                    <div className="account-wrapper">
                        <div className="account-left">
                            <img src={user.avatar || '/images/default-avatar.jpg'} alt="Avatar" className="rounded-circle account-avatar" onError={(e) => (e.target.src = '/images/default-avatar.jpg')} />
                            <h2 className="account-name">{user.name || 'Unknown User'}</h2>
                        </div>
                        <div className="account-right">
                            <h1 className="text-center mb-4">Account</h1>
                            {isEditing ? (
                                <form className="edit-form" onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Name:</label>
                                        <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email:</label>
                                        <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={user.provider === 'google'} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Phone:</label>
                                        <input type="text" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                </form>
                            ) : isChangingPassword ? (
                                <form className="edit-form" onSubmit={handleChangePassword}>
                                    <div className="mb-3">
                                        <label htmlFor="current_password" className="form-label">Current Password:</label>
                                        <input type="password" id="current_password" name="current_password" className="form-control" value={passwordData.current_password} onChange={handlePasswordChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="new_password" className="form-label">New Password:</label>
                                        <input type="password" id="new_password" name="new_password" className="form-control" value={passwordData.new_password} onChange={handlePasswordChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="new_password_confirmation" className="form-label">Confirm New Password:</label>
                                        <input type="password" id="new_password_confirmation" name="new_password_confirmation" className="form-control" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Change Password</button>
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelPasswordChange}>Cancel</button>
                                </form>
                            ) : (
                                <div className="user-info-card shadow-sm mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className="user-details">
                                            <h5 className="card-title mb-3">User Information</h5>
                                            <div className="info-row">
                                                <span className="info">
                                                    <strong>Email:</strong> <span className="text-muted">{user.email}</span>
                                                </span>
                                                <span className="info">
                                                    <strong>Phone:</strong> <span className="text-muted">{user.phone}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <button className="btn btn-primary btn-sm me-2" onClick={() => setIsEditing(true)}>
                                                Edit Profile
                                            </button>
                                            {isLocalAccount && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => setIsChangingPassword(true)}>
                                                    Change Password
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h2 className="mt-3 mb-3">Your Bookings</h2>
                            {bookings.length > 0 ? (
                                <div className="bookings-container">
                                    {bookings.map((booking) => {
                                        const checkinDate = new Date(booking.checkin_date + 'Z');
                                        const now = new Date();
                                        const canCancel = checkinDate > now;
                                        return (
                                            <div key={booking.id} className="cards card-wrapper mb-3 shadow-sm">
                                                <div className="card-body">
                                                    <h5 className="card-title text-center">{booking.room_type}</h5>
                                                    <div className="card-text">
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Check-in:</strong> <span className="text-muted">{booking.checkin_date}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Check-out:</strong> <span className="text-muted">{booking.checkout_date}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Number of rooms:</strong> <span className="text-muted">{booking.number_of_rooms}</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Children Ages:</strong> <span className="text-muted">{booking.children}</span>
                                                            </span>
                                                            <span className="info-item">
                                                                <strong>Member:</strong> <span className="text-muted">{booking.member}</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Days:</strong> <span className="text-muted">{Math.ceil(Math.abs(new Date(booking.checkout_date) - new Date(booking.checkin_date)) / (1000 * 60 * 60 * 24) + 1)}</span>
                                                            </span>
                                                            <span className='info-item'>
                                                                <strong>Price:</strong> <span className="text-muted">{booking.price} VNĐ/night</span>
                                                            </span>
                                                            <span className="info-item">  
                                                                <strong>Deposit:</strong> <span className="text-muted">{(parseFloat(booking.total_price) * 0.2).toFixed(2)} VNĐ % of total price</span>
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-item">
                                                                <strong>Total Cost:</strong> <span className="text-muted">{booking.total_price} VNĐ</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {canCancel && (
                                                        <button
                                                            className="btn btn-danger btn-sm mt-3"
                                                            onClick={() => handleCancelBooking(booking.id)} 
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center">No bookings found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );


};

export default Account;