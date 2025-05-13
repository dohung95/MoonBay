import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/EmployeeListManagement.css'; // File CSS tùy chỉnh (nếu cần)

const EmployeeListManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/staff_manager?page=${currentPage}`);
                // Lọc dữ liệu để chỉ lấy users có role là 'staff'
                const staffUsers = response.data.data.filter(user => user.role.toLowerCase() === 'staff');
                setUsers(staffUsers);
                setLastPage(response.data.last_page);
                setLoading(false);
            } catch (err) {
                toast.error('Unable to load staff list. Please try again later.');
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
        if (window.confirm('Are you sure you want to delete this staff?')) {
            try {
                await axios.delete(`http://localhost:8000/api/staff_manager/${id}`);
                setUsers(users.filter(user => user.id !== id));
                toast.success('Staff deleted successfully');
                if (users.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (err) {
                toast.error('Failed to delete staff. Please try again later.');
            }
        }
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
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
            />
            <div className="text-center mb-4">
                <h1 className="display-4 text-primary fw-bold">Staff List Management</h1>
            </div>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {!loading && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col" className="text-center">No.</th>
                                        <th scope="col" className="text-center">ID</th>
                                        <th scope="col" className="text-center">Name</th>
                                        <th scope="col" className="text-center">Email</th>
                                        <th scope="col" className="text-center">Phone Number</th>
                                        <th scope="col" className="text-center">Role</th>
                                        <th scope="col" className="text-center">Status</th>
                                        <th scope="col" className="text-center">Created At</th>
                                        <th scope="col" className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="text-center">
                                                    {(currentPage - 1) * 10 + index + 1}
                                                </td>
                                                <td className="text-center">{user.id}</td>
                                                <td className="text-center">{user.name}</td>
                                                <td className="text-center">{user.email}</td>
                                                <td className="text-center">{user.phone || 'N/A'}</td>
                                                <td className="text-center">{user.role}</td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${user.status === 'active'
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
                                                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                                                        : 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted">
                                                No staff members available.
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
                                        <span aria-hidden="true">«</span>
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
                                        <span aria-hidden="true">»</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeListManagement;