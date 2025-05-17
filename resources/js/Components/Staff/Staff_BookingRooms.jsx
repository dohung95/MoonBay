import React, { useState, useEffect, useContext } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../../css/css_of_staff/Staff_BookingRoom.css';
import { AuthContext } from '../AuthContext.jsx';

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
    const [isFetchingRooms, setIsFetchingRooms] = useState(false); // Thêm state để kiểm soát việc fetch rooms
    

    // Theo dõi các giá trị thay đổi
    const roomType = useWatch({ control, name: 'room_type' });
    const numberOfRooms = useWatch({ control, name: 'number_of_rooms' });
    const checkIn = useWatch({ control, name: 'checkin_date' });
    const checkOut = useWatch({ control, name: 'checkout_date' });
    const price = useWatch({ control, name: 'price' });
    const totalPrice = useWatch({ control, name: 'total_price' });

    // Hàm fetch rooms từ API
    const fetchRooms = async (token) => {
        try {
            setIsFetchingRooms(true); // Đánh dấu đang fetch
            const roomsResponse = await axios.get('/api/rooms', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(roomsResponse.data)) {
                setRooms(roomsResponse.data);
            } else {
                throw new Error('Invalid rooms data structure');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error.response || error);
            setError('Failed to load room availability data');
        } finally {
            setIsFetchingRooms(false); // Hoàn tất fetch
        }
    };

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

    // Fetch rooms ban đầu
    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (token) {
            fetchRooms(token);
        } else {
            setError('Không tìm thấy token xác thực');
        }
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

            // Cập nhật trạng thái phòng trong database
            const availableRooms = rooms.filter(r => r.type === data.room_type && r.status === 'available');
            for (let i = 0; i < parseInt(data.number_of_rooms) && i < availableRooms.length; i++) {
                await axios.put(`/api/rooms/${availableRooms[i].id}`, { status: null }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(`Updated room ${availableRooms[i].id} status to null`);
            }

            // Fetch lại dữ liệu phòng từ server để đồng bộ
            await fetchRooms(token);

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

    // Hàm đếm số phòng trống theo loại phòng
    const getAvailableCount = (roomTypeName) => {
        const count = rooms.filter(room => room.type === roomTypeName && room.status === 'available').length;
        return count;
    };

    // Hàm đếm số phòng đang bảo trì
    const getMaintenanceCount = (roomTypeName) => {
        return rooms.filter(room => room.type === roomTypeName && room.status === 'maintenance').length;
    };

    // Hàm đếm số phòng đang có người đặt (status null hoặc rỗng)
    const getBookedCount = (roomTypeName) => {
        return rooms.filter(room => room.type === roomTypeName && (!room.status || room.status === '')).length;
    };
const isBookNowDisabled = !roomType || !numberOfRooms || parseInt(numberOfRooms) > getAvailableCount(roomType) || getAvailableCount(roomType) === 0;
    return (
        <div className="Staff_IndexPage">
            <div className="Staff_BookingRooms-container container mt-4">
                <h2 className="Staff_BookingRooms-container-title mb-4">FORM BOOKING ROOM</h2>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
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
                                max={maxCapacity}
                                {...register('member', {
                                    required: 'Số người lớn là bắt buộc',
                                    min: { value: 1, message: 'Phải có ít nhất 1 người lớn' },
                                    max: {
                                        value: maxCapacity,
                                        message: `Số người lớn không được vượt quá sức chứa của phòng (${maxCapacity})`,
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

            <div className="table-container mt-4">
                <h3>Room Type Availability</h3>
                {isFetchingRooms ? (
                    <div>Loading rooms...</div>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Room Type</th>
                                <th>Available Rooms</th>
                                <th>Under Maintenance</th>
                                <th>Booked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roomTypes.map((roomType) => (
                                <tr key={roomType.id}>
                                    <td>{roomType.name}</td>
                                    <td>{getAvailableCount(roomType.name)}</td>
                                    <td>{getMaintenanceCount(roomType.name)}</td>
                                    <td>{getBookedCount(roomType.name)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Staff_BookingRooms;