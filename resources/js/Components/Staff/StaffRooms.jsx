import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const StaffRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('/api/rooms', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                });
                setRooms(response.data);
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách phòng');
                setLoading(false);
                console.error(err);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return <div className="text-center mt-4">Đang tải...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="staff-rooms container mt-4">
            <h2 className="mb-4">Quản lý phòng</h2>
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Tên phòng</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>{room.name}</td>
                            <td>{room.type}</td>
                            <td>{room.price}</td>
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

export default StaffRooms;