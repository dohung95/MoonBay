// Components/Admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../../css/AdminDashboard.css'; // Đường dẫn đến file CSS của bạn

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1>Bảng điều khiển Admin</h1>
            <nav className="admin-nav">
                <Link to="/admin/users">Quản lý người dùng</Link>
                <Link to="/admin/bookings">Quản lý đặt phòng</Link>
                <Link to="/admin/rooms">Quản lý phòng</Link>
            </nav>
            <div className="admin-content">
                <p>Chào mừng đến với bảng điều khiển Admin!</p>
            </div>
        </div>
    );
};

export default AdminDashboard;