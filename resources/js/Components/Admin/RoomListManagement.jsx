import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../css/css_of_admin/RoomListManagement.css'; 

const RoomListManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/room_list?page=${currentPage}`);
                setRooms(response.data.data);
                setLastPage(response.data.last_page);
                setLoading(false);
            } catch (err) {
                toast.error('Unable to load room list. Please try again later.');
                setLoading(false);
            }
        };

        fetchRooms();
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
                <h1 className="display-4 text-primary fw-bold">Room List Management</h1>
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
                                        <th scope="col" className="text-center">Room Number</th>
                                        <th scope="col" className="text-center">Type</th>
                                        <th scope="col" className="text-center">Price (VND)</th>
                                        <th scope="col" className="text-center">Status</th>
                                        <th scope="col" className="text-center">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.length > 0 ? (
                                        rooms.map((room, index) => (
                                            <tr key={room.id}>
                                                <td className="text-center">
                                                    {(currentPage - 1) * 10 + index + 1}
                                                </td>
                                                <td className="text-center">{room.id}</td>
                                                <td className="text-center">{room.room_number}</td>
                                                <td className="text-center">{room.type}</td>
                                                <td className="text-center">
                                                    {new Intl.NumberFormat('vi-VN').format(room.price)}
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${room.status === 'available'
                                                            ? 'bg-success'
                                                            : room.status === 'booked'
                                                            ? 'bg-warning'
                                                            : 'bg-danger'
                                                        }`}
                                                    >
                                                        {room.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {room.created_at
                                                        ? new Date(room.created_at).toLocaleDateString('vi-VN')
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted">
                                                No rooms available.
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
                                        <span aria-hidden="true">&laquo;</span>
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
                                        <span aria-hidden="true">&raquo;</span>
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

export default RoomListManagement;