import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearch } from './SearchContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffBookingList.css';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);

    // Nếu giá nhỏ hơn 10.000 thì giả định là "nghìn đồng" (ví dụ: 500 = 500k)
    const amountInDong = amount < 10000 ? amount * 1000 : amount;

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0, // VND không có số lẻ
    }).format(amountInDong);
};


const StaffBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 6,
        total: 0,
    });
    const { searchQuery, setSearchQuery } = useSearch(); // Lấy searchQuery và setSearchQuery từ SearchContext
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search query to improve performance
    useEffect(() => {
        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
        }
        
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, 300); // 300ms debounce - nhanh hơn cho search

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle search with debounce effect
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Reset to first page when searching
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    useEffect(() => {
        const fetchBookings = async () => {
            // Chỉ show loading khi lần đầu load hoặc chuyển trang, không show khi search
            const isInitialLoad = pagination.currentPage === 1 && !debouncedSearchQuery;
            const isPagination = pagination.currentPage > 1;
            
            if (isInitialLoad || isPagination) {
                setLoading(true);
                // Thêm độ trễ để hiển thị hiệu ứng loading chỉ khi cần thiết
                await new Promise(resolve => setTimeout(resolve, 400));
            }

            try {
                const token = Cookies.get('auth_token');
                if (!token) {
                    throw new Error('Không tìm thấy token xác thực');
                }

                const response = await axios.get('/api/bookingList', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        per_page: pagination.perPage,
                        page: pagination.currentPage,
                        search: debouncedSearchQuery || undefined, // Gửi debouncedSearchQuery nếu có
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
                    perPage: response.data.per_page || pagination.perPage,
                    total: response.data.total || 0,
                });
                
                // Chỉ tắt loading nếu đã bật
                if (isInitialLoad || isPagination) {
                    setLoading(false);
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách đặt phòng';
                setError(errorMessage);
                console.error("Error details:", err.response ? err.response.data : err.message);
                setBookings([]);
                setLoading(false);
            }
        };
        fetchBookings();
    }, [pagination.currentPage, debouncedSearchQuery]);

    const totalPages = pagination.lastPage;

    return (
        <>
            <div className="staff-bookinglist">
                <h2 className="staff-bookinglist-title">Booking List</h2>
                <p className="staff-room-description">
                    Manage room information, including room status.
                </p>
                <div className="staff-booking-search-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, room type..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="staff-search-input"
                        />
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2" />
                        <p>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger mt-4">{error}</div>
                ) : (
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
                                        <td colSpan="11" className="booking-no-data">No bookings found.</td>
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
                                        <td>{new Date(booking.checkin_date).toLocaleDateString()}</td>
                                        <td>{new Date(booking.checkout_date).toLocaleDateString()}</td>
                                        <td>{formatCurrency(booking.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="staff-bookinglist-pagination">
                    <button
                        className="staff-bookinglist-page-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                        disabled={pagination.currentPage === 1}
                    >
                        &lt;
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx + 1}
                            className={`staff-bookinglist-page-btn ${pagination.currentPage === idx + 1 ? 'active' : ''}`}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: idx + 1 }))}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        className="staff-bookinglist-page-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
                        disabled={pagination.currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </>
    );
};

export default StaffBookings;