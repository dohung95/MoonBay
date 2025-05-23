import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSearch } from './SearchContext';
import Cookies from 'js-cookie';
import "../../../css/css_of_staff/StaffUser.css";

const StaffUser = () => {
    const [dataUser, setDataUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 30,
        total: 0,
    });
    const { searchQuery } = useSearch(); // Lấy searchQuery từ Context
    const itemsPerPage = 20; // Đồng bộ với backend

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/dataUser', {
                    headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` },
                    params: {
                        per_page: itemsPerPage,
                        page: pagination.currentPage,
                        search: searchQuery || undefined,
                    },
                });
                const { data, current_page, last_page, per_page, total } = response.data;
                setDataUser(data || []);
                setPagination({
                    currentPage: current_page,
                    lastPage: last_page,
                    perPage: per_page,
                    total: total,
                });
                setLoading(false);
            } catch (err) {
                setError('Lỗi khi lấy danh sách người dùng');
                console.error("Error details:", err.response ? err.response.data : err.message);
                setLoading(false);
            }
        };
        fetchUsers();
    }, [pagination.currentPage, searchQuery]); // Chạy lại khi currentPage hoặc searchQuery thay đổi

    const totalPages = pagination.lastPage;

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
                                {dataUser.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="no-data">Không tìm thấy người dùng nào.</td>
                                    </tr>
                                ) : dataUser.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>{user.role}</td>
                                        <td><span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                            {user.status}
                                        </span></td>
                                        <td>{user.email_verified_at || 'N/A'}</td>
                                        <td>{user.provider || 'N/A'}</td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pagination-controls">
                    <button
                        className="btn btn-primary pagination-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                        disabled={pagination.currentPage === 1}
                    >
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <span className="pagination-page">
                        Page {pagination.currentPage} / {totalPages}
                    </span>
                    <input
                        type="number"
                        className="page-input"
                        placeholder="1"
                        value={pagination.currentPage}
                        onChange={(e) => {
                            const pageNumber = Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), totalPages);
                            setPagination(prev => ({ ...prev, currentPage: pageNumber }));
                        }}
                        min="1"
                        max={totalPages}
                    />
                    <button
                        className="btn btn-primary pagination-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
                        disabled={pagination.currentPage === totalPages}
                    >
                        Next <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default StaffUser;