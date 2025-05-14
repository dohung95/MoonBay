import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSearch } from './SearchContext';
import Cookies from 'js-cookie';
import "../../../css/css_of_staff/StaffUser.css";

const StaffUser = () => {
    const [dataUser, setdataUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;
    const { searchQuery } = useSearch(); // Lấy searchQuery từ Context

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/dataUser', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                });
                setdataUser(response.data);
                setFilteredUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách người dùng');
                console.error("Error details:", err.response ? err.response.data : err.message);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = dataUser.filter(user =>
                user.name.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery) ||
                (user.phone && user.phone.toLowerCase().includes(searchQuery))
            );
            setFilteredUsers(filtered);
            setCurrentPage(1);
        } else {
            setFilteredUsers(dataUser); // Nếu không có tìm kiếm, hiển thị toàn bộ danh sách
            setCurrentPage(1);
        }
    }, [searchQuery, dataUser]);

    // Chỉnh sửa currentPage nếu vượt quá totalPages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [filteredUsers, currentPage, totalPages]);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="staff-user-page">
                <div className="staff-users-container">
                <div className="table-wrapper">
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
                        {filteredUsers.length === 0 ? (
                            <p className="no-data">Không tìm thấy người dùng nào.</p>
                        ) : currentData.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.role}</td>
                                <td><span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                    {user.status}
                                </span></td>
                                <td>{user.email_verified_at}</td>
                                <td>{user.provider}</td>
                                <td>{user.created_at}</td>
                                <td>{user.updated_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="pagination-controls">
                <button
                    className="btn btn-primary pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <i className="fas fa-chevron-left"></i> Previous
                </button>
                <span className="pagination-page">
                    Page {currentPage} / {totalPages}
                </span>
                <input
                    type="number"
                    className="page-input"
                    placeholder='1'
                    onChange={(e) => {
                        const pageNumber = Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), totalPages);
                        setCurrentPage(pageNumber);
                    }}
                    min="1"
                    max={totalPages}
                />
                <button
                    className="btn btn-primary pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next <i className="fas fa-chevron-right"></i>
                </button>
            </div>
            </div>
        </>
    );
};

export default StaffUser;