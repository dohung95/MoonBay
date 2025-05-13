import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const StaffUser = () => {
    const [dataUser, setdataUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/dataUser', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                    params: { role: 'user' } // Tham số query (có thể bỏ nếu backend đã xử lý)
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách người dùng');
                console.error("Error details:", err.response ? err.response.data : err.message);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="staff-users-container">
            <h2 className="staff-users-title">Quản lý người dùng</h2>
            <table className="staff-users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Email_verified_at</th>
                        <th>Provider</th>
                        <th>Created_at</th>
                        <th>Updated_at</th>
                    </tr>
                </thead>
                <tbody>
                    {dataUser.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.role}</td>
                            <td>{user.status}</td>
                            <td>{user.email_verified_at}</td>
                            <td>{user.provider}</td>
                            <td>{user.created_at}</td>
                            <td>{user.updated_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
                .staff-users-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: Arial, sans-serif;
                }

                .staff-users-title {
                    font-size: 24px;
                    color: #333;
                    text-align: center;
                    margin-bottom: 20px;
                }

                .staff-users-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .staff-users-table th,
                .staff-users-table td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                .staff-users-table th {
                    background-color: #007bff;
                    color: white;
                    font-weight: bold;
                }

                .staff-users-table tr:nth-child(even) {
                    background-color: #f8f9fa;
                }

                .staff-users-table tr:hover {
                    background-color: #e9ecef;
                    transition: background-color 0.3s;
                }

                .loading {
                    text-align: center;
                    font-size: 18px;
                    color: #666;
                    padding: 20px;
                }

                .error {
                    text-align: center;
                    font-size: 18px;
                    color: #dc3545;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
};

export default StaffUser;