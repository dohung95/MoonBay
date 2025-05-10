// Components/Admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách người dùng');
                setLoading(false);
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="admin-users">
            <h2>Quản lý người dùng</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleEdit(user.id)}>Sửa</button>
                                <button onClick={() => handleDelete(user.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    function handleEdit(userId) {
        // Logic sửa người dùng (chuyển đến form chỉnh sửa hoặc mở modal)
        console.log('Sửa người dùng:', userId);
    }

    function handleDelete(userId) {
        // Logic xóa người dùng (gọi API DELETE)
        console.log('Xóa người dùng:', userId);
    }
};

export default AdminUsers;