import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearch } from './SearchContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffBookingList.css';


const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30; // Số lượng item mỗi trang, giống StaffUser
    const { searchQuery } = useSearch(); // Lấy searchQuery từ SearchContext

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    // lấy dữ liệu
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = Cookies.get('auth_token');
                if (!token) {
                    throw new Error('Không tìm thấy token xác thực');
                }

                const response = await axios.get('/api/bookingList', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Kiểm tra và trích xuất dữ liệu
                let bookingsData = [];
                if (Array.isArray(response.data)) {
                    bookingsData = response.data; // Nếu response.data là mảng
                } else if (response.data && Array.isArray(response.data.bookings)) {
                    bookingsData = response.data.bookings; // Nếu dữ liệu trong trường bookings
                } else if (response.data && Array.isArray(response.data.data)) {
                    bookingsData = response.data.data; // Nếu dữ liệu trong trường data
                } else {
                    console.warn("Dữ liệu không phải mảng, gán mảng rỗng:", response.data);
                    bookingsData = [];
                }

                // Sắp xếp dữ liệu mới nhất
                bookingsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setBookings(bookingsData);
                setLoading(false);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách đặt phòng';
                setError(errorMessage);
                console.error("Error details:", err.response ? err.response.data : err.message);
                setBookings([]); // Đặt lại bookings về mảng rỗng nếu có lỗi
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Tìm kiếm dữ liệu
    useEffect(() => {
        if (searchQuery) {
            const filtered = bookings.filter(booking => {
                if (!booking || typeof booking !== 'object') return false;
                return (
                    (booking.name && booking.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (booking.email && booking.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (booking.phone && booking.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (booking.room_type && booking.room_type.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            });
            setFilteredBookings(filtered);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        } else {
            setFilteredBookings(bookings);
            setCurrentPage(1); // Reset về trang 1 khi không tìm kiếm
        }
    }, [searchQuery, bookings]);

    // Điều chỉnh currentPage nếu vượt quá totalPages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [filteredBookings, currentPage, totalPages]);

    if (loading) return <div className="text-center mt-4">Đang tải...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <>
            <div className="staff-bookinglist">
                <div className='table-wrapper'>
                    <table className="staff-bookinglist-table">
                        <thead >
                            <tr>
                                <th>ID</th>
                                <th>Name User</th>
                                <th>Email User</th>
                                <th>Phone User</th>
                                <th>Room Type</th>
                                <th>Number of Rooms</th>
                                <th>children</th>
                                <th>member</th>
                                <th>Check in</th>
                                <th>Check out</th>
                                <th>price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="no-data">Không tìm thấy đặt phòng nào.</td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="no-data">Không có dữ liệu trên trang này.</td>
                                </tr>
                            ) : (
                                currentData.map(booking => (
                                    <tr key={booking.id}>
                                        <td>{booking.id}</td>
                                        <td>{booking.name}</td>
                                        <td>{booking.email}</td>
                                        <td>{booking.phone}</td>
                                        <td>{booking.room_type}</td>
                                        <td>{booking.number_of_rooms}</td>
                                        <td>{booking.children}</td>
                                        <td>{booking.member}</td>
                                        <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                                        <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                                        <td>{booking.total_price}0 VNĐ</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='pagination-booklist-staff'>
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

export default StaffBookings;