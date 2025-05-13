import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/UserManagement.css'; // File CSS đã được scoped

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users_manager?page=${currentPage}`);
                setUsers(response.data.data);
                setLastPage(response.data.last_page);
                setLoading(false);
            } catch (err) {
                toast.error('Unable to load customer list. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < lastPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:8000/api/users_manager/${id}`);
                setUsers(users.filter(user => user.id !== id));
                toast.success('User deleted successfully');
                if (users.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (err) {
                toast.error('Failed to delete user. Please try again later.');
            }
        }
    };

    return (
        <div className="user-management">
            <div className="container-fluid py-5 bg-light min-vh-100">
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold text-primary">
                        <i className="bi bi-people-fill me-2"></i>Customer Management
                    </h1>
                </div>

                {loading && (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-4">
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered align-middle">
                                    <thead className="table-primary">
                                        <tr>
                                            <th scope="col" className="text-center">No.</th>
                                            <th scope="col" className="text-center">ID</th>
                                            <th scope="col" className="text-center">Name</th>
                                            <th scope="col" className="text-center">Email</th>
                                            <th scope="col" className="text-center">Phone</th>
                                            <th scope="col" className="text-center">Role</th>
                                            <th scope="col" className="text-center">Status</th>
                                            <th scope="col" className="text-center">Created At</th>
                                            <th scope="col" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((user, index) => (
                                                <tr key={user.id} className="hover-row">
                                                    <td className="text-center">{(currentPage - 1) * 10 + index + 1}</td>
                                                    <td className="text-center">{user.id}</td>
                                                    <td className="text-center">{user.name}</td>
                                                    <td className="text-center">{user.email}</td>
                                                    <td className="text-center">{user.phone || 'N/A'}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info">{user.role}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${
                                                                user.status === 'active'
                                                                    ? 'bg-success'
                                                                    : user.status === 'inactive'
                                                                    ? 'bg-warning'
                                                                    : 'bg-danger'
                                                            }`}
                                                        >
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {user.created_at
                                                            ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                                                                  day: '2-digit',
                                                                  month: '2-digit',
                                                                  year: 'numeric',
                                                              })
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="btn btn-danger btn-sm"
                                                            title="Delete User"
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center text-muted py-3">
                                                    No customers available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Phân trang */}
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center mt-4">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <span className="page-link">
                                            {currentPage} / {lastPage}
                                        </span>
                                    </li>
                                    <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleNextPage}
                                            disabled={currentPage === lastPage}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;