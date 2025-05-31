import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearch } from './SearchContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../css/css_of_staff/StaffBookingList.css';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);
    const amountInDong = amount < 10000 ? amount * 1000 : amount;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
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
    const { searchQuery, setSearchQuery } = useSearch();
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [isSearching, setIsSearching] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

    // Debounce search query
    useEffect(() => {
        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
        }
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setIsSearching(false);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            // Chỉ show loading khi lần đầu load hoặc chuyển trang, không show khi search
            const isInitialLoad = pagination.currentPage === 1 && !debouncedSearchQuery;
            const isPagination = pagination.currentPage > 1;
            if (isInitialLoad || isPagination) {
                setLoading(true);
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
                        search: debouncedSearchQuery || undefined,
                    },
                });

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

                bookingsData.sort((a, b) => {
                    const dateA = a.created_at || a.id;
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
                if (isInitialLoad) {
                    setIsInitialLoad(false);
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

    // Generate pagination buttons
    const getPaginationButtons = () => {
        const { currentPage, lastPage } = pagination;
        const maxButtons = 5; // Show max 5 page buttons
        const buttons = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(lastPage, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // Add "First" button
        if (startPage > 1) {
            buttons.push(
                <button
                    key="first"
                    className="btn btn-outline-primary mx-1"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                >
                    First
                </button>
            );
        }

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`btn ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: i }))}
                >
                    {i}
                </button>
            );
        }

        // Add "Last" button
        if (endPage < lastPage) {
            buttons.push(
                <button
                    key="last"
                    className="btn btn-outline-primary mx-1"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: lastPage }))}
                >
                    Last
                </button>
            );
        }

        return buttons;
    };

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
                    {pagination.lastPage > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <div className="btn-group">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                                        disabled={pagination.currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {getPaginationButtons()}
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, pagination.lastPage) }))}
                                        disabled={pagination.currentPage === pagination.lastPage}
                                    >
                                        Next
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffBookings;