import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearch } from './SearchContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffBookingList.css';

const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 30,
        total: 0,
    });
    const { searchQuery } = useSearch(); // Lấy searchQuery từ SearchContext
    const itemsPerPage = 30;

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const token = Cookies.get('auth_token');
                if (!token) {
                    throw new Error('Không tìm thấy token xác thực');
                }

                const response = await axios.get('/api/bookingList', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        per_page: itemsPerPage,
                        page: pagination.currentPage,
                        search: searchQuery || undefined, // Gửi searchQuery nếu có
                    },
                });

                // Kiểm tra và trích xuất dữ liệu
                let bookingsData = [];
                if (Array.isArray(response.data)) {
                    bookingsData = response.data;
                } else if (response.data && Array.isArray(response.data.bookings)) {
                    bookingsData = response.data.bookings;
                } else if (response.data && Array.isArray(response.data.data)) {
                    bookingsData = response.data.data;
                } else {
                    console.warn("Dữ liệu không phải mảng, gán mảng rỗng:", response.data);
                    bookingsData = [];
                }

                // Sắp xếp dữ liệu mới nhất, kiểm tra cột tồn tại
                bookingsData.sort((a, b) => {
                    const dateA = a.created_at || a.id; // Fallback nếu không có created_at
                    const dateB = b.created_at || b.id;
                    return typeof dateA === 'number' ? dateB - dateA : new Date(dateB) - new Date(dateA);
                });

                setBookings(bookingsData);
                setPagination({
                    currentPage: response.data.current_page || 1,
                    lastPage: response.data.last_page || 1,
                    perPage: response.data.per_page || itemsPerPage,
                    total: response.data.total || 0,
                });
                setLoading(false);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách đặt phòng';
                setError(errorMessage);
                console.error("Error details:", err.response ? err.response.data : err.message);
                setBookings([]);
                setLoading(false);
            }
        };
        fetchBookings();
    }, [pagination.currentPage, searchQuery]);

    const totalPages = pagination.lastPage;

    if (loading) return <div className="text-center mt-4">Đang tải...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <>
            <div className="staff-bookinglist">
                <div className="table-wrapper">
                    <table className="staff-bookinglist-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name User</th>
                                <th>Email User</th>
                                <th>Phone User</th>
                                <th>Room Type</th>
                                <th>Number of Rooms</th>
                                <th>Children</th>
                                <th>Member</th>
                                <th>Check in</th>
                                <th>Check out</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="no-data">Không tìm thấy đặt phòng nào.</td>
                                </tr>
                            ) : bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                    <td>{booking.name}</td>
                                    <td>{booking.email}</td>
                                    <td>{booking.phone || 'N/A'}</td>
                                    <td>{booking.room_type}</td>
                                    <td>{booking.number_of_rooms}</td>
                                    <td>{booking.children}</td>
                                    <td>{booking.member}</td>
                                    <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                                    <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                                    <td>{booking.total_price ? `${booking.total_price}0 VNĐ` : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="pagination-booklist-staff">
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

export default StaffBookings;