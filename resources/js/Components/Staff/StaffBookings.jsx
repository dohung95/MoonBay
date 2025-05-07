import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get('/api/bookings', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                });
                setBookings(response.data);
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách đặt phòng');
                setLoading(false);
                console.error(err);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="text-center mt-4">Đang tải...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="staff-bookings container mt-4">
            <h2 className="mb-4">Quản lý đặt phòng</h2>
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Phòng</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.userName}</td>
                            <td>{booking.roomName}</td>
                            <td>{new Date(booking.date).toLocaleDateString()}</td>
                            <td>
                                <button className="btn btn-warning btn-sm me-2">Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StaffBookings;