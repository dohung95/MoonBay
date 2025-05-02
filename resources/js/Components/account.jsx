import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/my_css/account.css';


const Account = () => {
    const { user, token, updateUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [latestBooking, setLatestBooking] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user === null) {
            // Chờ AuthContext khôi phục user
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
                // console.log('Fetching bookings...', user.id);
                const response = await axios.get(`/api/users/${user.id}/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // console.log('Bookings:', response.data.bookings);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.get('/sanctum/csrf-cookie');

        try {
            const response = await axios.put(`/api/users/${user.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Cập nhật user trong AuthContext
            updateUser(response.data.user);
            setIsEditing(false);
            window.showNotification('Profile updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            window.showNotification('Failed to update profile' || 'An error occurred.', 'error');
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

    if (loading) return <div className="container_account"><p className="text-center text-black mt-5">Loading...</p></div>;
    if (error) return <div className="container_account"><p className="text-center text-black mt-5">{error}</p></div>;

    return (
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
                                    <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">Phone:</label>
                                    <input type="text" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                                </div>
                                <button type="submit" className="btn btn-primary">Save</button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
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
                                                <strong >Phone:</strong> <span className="text-muted">{user.phone}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        <h2 className="mt-3 mb-3">Your Bookings</h2>
                        {bookings.length > 0 ? (
                            <div className='bookings-container'>
                                {bookings.map((booking) => (
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
                                                        <strong>Children:</strong> <span className="text-muted">{booking.children}</span>
                                                    </span>
                                                    <span className="info-item">
                                                        <strong>Member:</strong> <span className="text-muted">{booking.member}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="card-text text-danger mt-2">
                                                <strong>Price:</strong> <span>${booking.price}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center">No bookings found.</p>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;