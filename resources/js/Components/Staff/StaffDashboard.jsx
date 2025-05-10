import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/StaffDashboard.css';

const StaffDashboard = () => {
    return (
        <div className="staff-dashboard container mt-4">
            <h1 className="mb-4">Bảng điều khiển Nhân viên</h1>
            <nav className="staff-nav mb-4">
                <Link to="/staff/bookings" className="btn btn-primary me-2">Quản lý đặt phòng</Link>
                <Link to="/staff/rooms" className="btn btn-primary">Quản lý phòng</Link>
            </nav>
            <div className="staff-content card p-4">
                <p>Chào mừng đến với bảng điều khiển Nhân viên! Chọn một mục từ menu để bắt đầu quản lý.</p>
            </div>
        </div>
    );
};

export default StaffDashboard;