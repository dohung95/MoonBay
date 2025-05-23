import React, { useState, useEffect, useContext } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../../css/css_of_staff/Staff_BookingRoom.css';
import { AuthContext } from '../AuthContext.jsx';
import ManageBookings from '../Admin/ManageBookings.jsx';

// Hàm định dạng tiền VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm tính số ngày
const calculateDays = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Hàm định dạng ngày
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Hàm kiểm tra ngày trong tuần hiện tại
const isWithinCurrentWeek = (date) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    const checkDate = new Date(date);
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

const Staff_BookingRooms = () => {
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors }, control, setValue, reset } = useForm({
        defaultValues: {
            user_id: user.id,
            name: '',
            email: '',
            phone: '',
            room_type: '',
            number_of_rooms: 1,
            children: 0,
            member: 1,
            checkin_date: '',
            checkout_date: '',
            total_price: 0,
            price: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]); // Danh sách đặt phòng
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));

    // Theo dõi các giá trị thay đổi
    const roomType = useWatch({ control, name: 'room_type' });
    const numberOfRooms = useWatch({ control, name: 'number_of_rooms' });
    const checkIn = useWatch({ control, name: 'checkin_date' });
    const checkOut = useWatch({ control, name: 'checkout_date' });
    const price = useWatch({ control, name: 'price' });
    const totalPrice = useWatch({ control, name: 'total_price' });

    // Fetch room types từ API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await axios.get('/api/room-types');
                let formattedRooms = [];
                if (Array.isArray(response.data)) {
                    formattedRooms = response.data;
                } else if (response.data && response.data.room_types && Array.isArray(response.data.room_types)) {
                    formattedRooms = response.data.room_types;
                } else {
                    console.error('Unexpected data structure:', response.data);
                    setError('Invalid room types data');
                    return;
                }
                setRoomTypes(formattedRooms);
            } catch (error) {
                console.error('Error fetching room types:', error.response || error);
                setError('Failed to load room types');
            }
        };
        fetchRoomTypes();
    }, []);

    // Fetch bookings từ API
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = Cookies.get('auth_token');
                if (!token) {
                    setError('Không tìm thấy token xác thực');
                    return;
                }

                const response = await axios.get('/api/bookingList', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookings(response.data.data || []);
            } catch (error) {
                console.error('Error fetching bookings:', error.response || error);
                setError('Failed to load bookings');
            }
        };
        fetchBookings();
    }, []);

    // Tính tổng giá tự động
    useEffect(() => {
        if (roomTypes.length > 0 && roomType && numberOfRooms && checkIn && checkOut) {
            const selectedRoom = roomTypes.find((room) => room.name === roomType);
            const pricePerRoom = parseFloat(selectedRoom?.price || 0);
            setSelectedRoomPrice(pricePerRoom * 1000);

            const roomsCount = parseInt(numberOfRooms) || 0;
            const days = calculateDays(checkIn, checkOut);
            const total = (pricePerRoom * 1000) * roomsCount * days;
            setValue('total_price', total);
            setValue('price', pricePerRoom * 1000);
        }
    }, [roomType, numberOfRooms, checkIn, checkOut, roomTypes, setValue]);

    // Tính max capacity dựa trên room_type
    const maxCapacity = roomTypes.length > 0 && roomType
        ? roomTypes.find((room) => room.name === roomType)?.capacity || 0
        : 1;
    const totalMaxCapacity = maxCapacity * (parseInt(numberOfRooms) || 1);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = Cookies.get('auth_token');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }

            // Gửi request đặt phòng
            const response = await axios.post('/api/Staff_booking', data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Fetch lại dữ liệu phòng và booking từ server để đồng bộ
            const bookingsResponse = await axios.get('/api/bookingList', { headers: { Authorization: `Bearer ${token}` } });
            setBookings(bookingsResponse.data.data || []);

            setSuccess('Đặt phòng thành công!');
            reset();

            // Automatically clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tạo đặt phòng';
            setError(errorMessage);
            console.error("Error details:", err.response ? err.response.data : err.message);

            // Automatically clear error message after 3 seconds
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Tính số đêm trực tiếp trong JSX
    const numberOfNights = calculateDays(checkIn, checkOut);

    const isBookNowDisabled = !roomType || !numberOfRooms || parseInt(numberOfRooms) === 0 || !checkIn || !checkOut || loading;

    // Lọc danh sách đặt phòng ngày hôm nay
    const todayBookings = bookings.filter((booking) => {
        const checkInDate = new Date(booking.checkin_date);
        const today = new Date();
        return checkInDate.toDateString() === today.toDateString();
    });

    // Lọc và sắp xếp danh sách đặt phòng trong tuần này
    const weeklyBookings = bookings
        .filter((booking) => {
            const checkInDate = new Date(booking.checkin_date);
            checkInDate.setHours(0, 0, 0, 0); // chuẩn hóa
            return checkInDate >= startOfWeek && checkInDate <= endOfWeek;
        })
        .sort((a, b) => {
            const dateA = new Date(a.checkin_date);
            const dateB = new Date(b.checkin_date);
            dateA.setHours(0, 0, 0, 0);
            dateB.setHours(0, 0, 0, 0);

            return (dateA < today && dateB < today) ? dateB - dateA : dateA - dateB;

            

        });
        
console.log("Start of week:", startOfWeek.toString());
            console.log("End of week:", endOfWeek.toString());
            bookings.forEach(b => console.log("Check-in:", b.checkin_date, "Parsed:", new Date(b.checkin_date).toString()));

    // Hàm kiểm tra booking đã qua
    const isPastBooking = (checkInDate) => {
        const bookingDate = new Date(checkInDate);
        bookingDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh ngày chính xác
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt giờ hôm nay về 00:00:00
        return bookingDate < today;
    };

    return (
        <div className="Staff_IndexPage">
            <div>
                <ManageBookings />
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <p className="mb-0 mx-2 room-type-block standard-room">from room 101-112: Standard Room</p>
                    <p className="mb-0 mx-2 room-type-block deluxe-room">from room 201-212: Deluxe Room</p>
                    <p className="mb-0 mx-2 room-type-block superior-room">from room 301-312: Superior Room</p>
                    <p className="mb-0 mx-2 room-type-block family-room">from room 401-412: Family Room</p>
                    <p className="mb-0 mx-2 room-type-block suite-room">from room 501-512: Suite Room</p>
                </div>

                <div className="alert alert-secondary" role="alert" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.5', margin: '30px 0' }}>
                    <h4 className="alert-heading" style={{ marginBottom: '15px', fontSize: '1.25rem', fontWeight: 'bold' }}>Color Legend</h4>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center', gap: '70px' }}>
                        <p style={{ color: '#ffc107', marginRight: '10px', marginBottom: '10px' }}>Yellow: Booking made, click to confirm check-in or view details</p>
                        <p style={{ color: 'green', marginRight: '10px', marginBottom: '10px' }}>Green: Customer checked in</p>
                        <p style={{ color: 'red', marginRight: '10px', marginBottom: '10px' }}>Red: Room maintenance</p>
                        <p style={{ color: 'gray', marginRight: '10px', marginBottom: '10px' }}>Gray: Room checked out</p>
                    </div>
                </div>
            </div>


            {/* Hiển thị danh sách đặt phòng ngày hôm nay */}
            <div className="mt-4">
                <h3>Today's Booking List ({new Date().toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })})</h3>
                {todayBookings.length === 0 ? (
                    <p>No bookings today.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email/ ID Number</th>
                                <th>Phone</th>
                                <th>Room Type</th>
                                <th>Number of Rooms</th>
                                <th>Members</th>
                                <th>Children</th>
                                <th>Check-in Date</th>
                                <th>Check-out Date</th>
                                <th>Total Price (VND)</th>
                                <th>Room IDs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.name}</td>
                                    <td>{booking.email}</td>
                                    <td>{booking.phone}</td>
                                    <td>{booking.room_type}</td>
                                    <td>{booking.number_of_rooms}</td>
                                    <td>{booking.member}</td>
                                    <td>{booking.children}</td>
                                    <td>{formatDate(booking.checkin_date)}</td>
                                    <td>{formatDate(booking.checkout_date)}</td>
                                    <td>{formatCurrency(booking.total_price)}</td>
                                    <td>{booking.room_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Hiển thị danh sách đặt phòng trong tuần này */}
            <div className="mt-4">
                <h3>List of bookings for the current week ({formatDate(startOfWeek)} - {formatDate(endOfWeek)})</h3>
                {weeklyBookings.length === 0 ? (
                    <p>No bookings for the current week.</p>
                ) : (
                    <div className="bookingStaff-table-container">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email/ ID Number</th>
                                    <th>Phone</th>
                                    <th>Room Type</th>
                                    <th>Number of Rooms</th>
                                    <th>Members</th>
                                    <th>Children</th>
                                    <th>Check-in Date</th>
                                    <th>Check-out Date</th>
                                    <th>Total Price (VND)</th>
                                    <th>Room IDs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeklyBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        style={{
                                            opacity: isPastBooking(booking.checkin_date) ? 0.3 : 1, // Làm mờ nếu ngày đã qua
                                        }}
                                    >
                                        <td>{booking.name}</td>
                                        <td>{booking.email}</td>
                                        <td>{booking.phone}</td>
                                        <td>{booking.room_type}</td>
                                        <td>{booking.number_of_rooms}</td>
                                        <td>{booking.member}</td>
                                        <td>{booking.children}</td>
                                        <td>{formatDate(booking.checkin_date)}</td>
                                        <td>{formatDate(booking.checkout_date)}</td>
                                        <td>{formatCurrency(booking.total_price)}</td>
                                        <td>{booking.room_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="Staff_BookingRooms-container container mt-4">
                <h2 className="Staff_BookingRooms-container-title mb-4">FORM BOOKING ROOM</h2>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <h6>Always refresh the page to check room status before booking for customers</h6>
                <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Customer name</label>
                            <input
                                type="text"
                                id="name"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                {...register('name', { required: 'Tên là bắt buộc' })}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">ID number/Passport</label>
                            <input
                                type="text"
                                id="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                {...register('email', {
                                    required: 'Số giấy tờ tùy thân là bắt buộc',
                                    pattern: {
                                        value: /^[a-zA-Z0-9-]{6,20}$/,
                                        message: 'Số giấy tờ không hợp lệ (6-20 ký tự, chỉ chữ, số và dấu gạch ngang)',
                                    },
                                })}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="text"
                                id="phone"
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                {...register('phone', {
                                    required: 'Số điện thoại là bắt buộc',
                                    pattern: {
                                        value: /^\d{10,11}$/,
                                        message: 'Số điện thoại phải có 10-11 chữ số',
                                    },
                                })}
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="room_type">Choose Room Type</label>
                            <select
                                id="room_type"
                                className={`form-control ${errors.room_type ? 'is-invalid' : ''}`}
                                {...register('room_type', { required: 'Vui lòng chọn loại phòng' })}
                            >
                                <option value="">what is your room</option>
                                {roomTypes.map((room) => (
                                    <option key={room.id} value={room.name}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                            {errors.room_type && <div className="invalid-feedback">{errors.room_type.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="number_of_rooms">How Many Room?</label>
                            <select id="number_of_rooms" className="form-control"
                                {...register('number_of_rooms', {
                                    required: 'Số lượng phòng là bắt buộc',
                                    min: { value: 1, message: 'Số lượng phòng phải lớn hơn 0' },
                                })}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                            {errors.number_of_rooms && <div className="invalid-feedback">{errors.number_of_rooms.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="member">How Many Member?</label>
                            <input
                                type="number"
                                id="member"
                                className={`form-control ${errors.member ? 'is-invalid' : ''}`}
                                min={1}
                                max={totalMaxCapacity}
                                {...register('member', {
                                    required: 'Số người lớn là bắt buộc',
                                    min: { value: 1, message: 'Phải có ít nhất 1 người lớn' },
                                    max: {
                                        value: totalMaxCapacity,
                                        message: `Số người lớn không được vượt quá sức chứa của phòng (${totalMaxCapacity})`,
                                    },
                                })}
                            />
                            {errors.member && <div className="invalid-feedback">{errors.member.message}</div>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="children">How Many Children?</label>
                            <input
                                type="number"
                                id="children"
                                className={`form-control ${errors.children ? 'is-invalid' : ''}`}
                                {...register('children', {
                                    required: 'Số trẻ em là bắt buộc',
                                    min: { value: 0, message: 'Số trẻ em không thể âm' },
                                })}
                            />
                            {errors.children && <div className="invalid-feedback">{errors.children.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="checkin_date">Check In Now</label>
                            <input
                                type="datetime-local"
                                id="checkin_date"
                                className={`form-control ${errors.checkin_date ? 'is-invalid' : ''}`}
                                {...register('checkin_date', {
                                    required: 'Ngày check-in là bắt buộc',
                                    validate: value => {
                                        const today = new Date().toISOString().split('T')[0];
                                        return value >= today || 'Ngày check-in không thể là ngày trong quá khứ';
                                    },
                                })}
                            />
                            {errors.checkin_date && <div className="invalid-feedback">{errors.checkin_date.message}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="checkout_date">What's Day Customer Check Out?</label>
                            <input
                                type="datetime-local"
                                id="checkout_date"
                                className={`form-control ${errors.checkout_date ? 'is-invalid' : ''}`}
                                {...register('checkout_date', {
                                    required: 'Ngày check-out là bắt buộc',
                                    validate: {
                                        afterCheckIn: (value, { checkin_date }) => {
                                            return value > checkin_date || 'Ngày check-out phải sau ngày check-in';
                                        },
                                    },
                                })}
                            />
                            {errors.checkout_date && <div className="invalid-feedback">{errors.checkout_date.message}</div>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Number Of Nights (/Night)</label>
                            <input type="text" id='numberOfNights' className="form-control"
                                value={numberOfNights || 0}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price of Room (VNĐ)</label>
                            <input type="text" id='price' className="form-control"
                                value={formatCurrency(price || 0)}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Price (VNĐ)</label>
                            <input
                                type="text"
                                id="total_price"
                                className="form-control"
                                value={formatCurrency(totalPrice || 0)}
                                readOnly
                            />
                            {errors.total_price && <div className="invalid-feedback">{errors.total_price.message}</div>}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary submit-btn" disabled={loading || isBookNowDisabled}>
                        {loading ? 'Đang xử lý...' : 'BOOK NOW'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Staff_BookingRooms;