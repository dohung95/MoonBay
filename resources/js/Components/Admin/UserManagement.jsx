import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/UserManagement.css';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2">
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
            <div align="center" style={{ padding: '0.5% 0' }}>
                <b style={{ fontSize: '30px' }}>Customer List</b>
            </div>

            {loading && <p>Loading data...</p>}

            {!loading && (
                <div className="w-full max-w-5xl overflow-x-auto" align="center">
                    <table className="min-w-full table-auto border-2 divide-y" style={{ borderColor: "#9ebed1" }}>
                        <thead>
                            <tr className="border-2 px-4 py-2">
                                <th className="border-2 px-4 py-2">No.</th>
                                <th className="border-2 px-4 py-2">ID</th>
                                <th className="border-2 px-4 py-2">Name</th>
                                <th className="border-2 px-4 py-2">Email</th>
                                <th className="border-2 px-4 py-2">Phone number</th>
                                <th className="border-2 px-4 py-2">Role</th>
                                <th className="border-2 px-4 py-2">Status</th>
                                <th className="border-2 px-4 py-2">Created_at</th>
                                <th className="border-2 px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user.id} className="border-2 px-4 py-2">
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
                                        <td className="border-2 px-4 py-2">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                style={{ backgroundColor: '#da3e3eab' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="py-2 px-4 text-center">
                                        There are no customers.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="mt-4 flex justify-center items-center space-x-4 next_hung">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded ${currentPage === 1
                                ? 'bg-gray-300 text-black'
                                : 'bg-blue-500 text-black'
                            }`} style={{border:'none'}}
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
                            }`} style={{border:'none'}}
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