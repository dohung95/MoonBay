import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [lastPage, setLastPage] = useState(1); // Tổng số trang

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users_manager?page=${currentPage}`);
                setUsers(response.data.data); // Lấy dữ liệu từ response.data.data
                setLastPage(response.data.last_page); // Lấy tổng số trang
                setLoading(false);
            } catch (err) {
                setError('Unable to load customer list. Please try again later.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage]); // Gọi lại API khi currentPage thay đổi

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2">
            <div align="center" style={{ padding: '0.5% 0' }}>
                <b style={{ fontSize: '30px' }}>Customer List</b>
            </div>

            {loading && <p>Loading data...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="w-full max-w-5xl overflow-x-auto" align="center">
                    <table className="min-w-full table-auto border-2 divide-y" style={{ borderColor: "#9ebed1" }}>
                        <thead>
                            <tr className="border-2 px-4 py-2">
                                <th className="border-2 px-4 py-2">No.</th> {/* Cột số thứ tự */}
                                <th className="border-2 px-4 py-2">ID</th>
                                <th className="border-2 px-4 py-2">Name</th>
                                <th className="border-2 px-4 py-2">Email</th>
                                <th className="border-2 px-4 py-2">Phone number</th>
                                <th className="border-2 px-4 py-2">Role</th>
                                <th className="border-2 px-4 py-2">Status</th>
                                <th className="border-2 px-4 py-2">Created_at</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user.id} className="border-2 px-4 py-2">
                                        {/* Tính số thứ tự: (trang hiện tại - 1) * số hàng mỗi trang + chỉ số + 1 */}
                                        <td className="border-2 px-4 py-2">
                                            {(currentPage - 1) * 10 + index + 1}
                                        </td>
                                        <td className="border-2 px-4 py-2">{user.id}</td>
                                        <td className="border-2 px-4 py-2">{user.name}</td>
                                        <td className="border-2 px-4 py-2">{user.email}</td>
                                        <td className="border-2 px-4 py-2">{user.phone || 'N/A'}</td>
                                        <td className="border-2 px-4 py-2">{user.role}</td>
                                        <td className="border-2 px-4 py-2">{user.status}</td>
                                        <td className="border-2 px-4 py-2">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-2 px-4 text-center">
                                        There are no customers.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="mt-4 flex justify-center items-center space-x-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded ${currentPage === 1
                                    ? 'bg-gray-300 text-black'
                                    : 'bg-blue-500 text-black'
                                }`}
                        >
                            <b>«</b>
                        </button>
                        <span>
                            &nbsp;{currentPage} / {lastPage}&nbsp;
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === lastPage}
                            className={`px-4 py-2 rounded ${currentPage === lastPage
                                    ? 'bg-gray-300 text-black'
                                    : 'bg-blue-500 text-black'
                                }`}
                        >
                            <b>»</b>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default UserManagement;