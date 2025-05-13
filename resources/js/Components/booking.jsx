import React, { useState, useEffect, useContext } from "react";
import '../../css/my_css/booking.css';
import BookNow from "./BookNow.jsx";
import { AuthContext } from "./AuthContext.jsx"; // Import AuthContext
import axios from "axios";
import "./AuthContext.jsx"; // Giả sử bạn đã định nghĩa $user trong AuthContext
import Banner from "./banner.jsx";
import { useLocation } from "react-router-dom";
import PopUp_deposit from "./PopUp_deposit.jsx";

const Booking = ({ checkLogin, checkLogins, isPopupBookNow }) => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [roomTypes, setRoomTypes] = useState([]); // Thêm state để lưu danh sách room_types từ API
    const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
    const Total_price = (price, room) => {
        return parseFloat(price) * parseInt(room); // Đảm bảo tính toán với số
    };
    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
        roomType: '',
        room: 1,
        children: 0,
        member: 1,
        price: '0',
        Total_price: '0',
    });
    const [isPopUp_deposit, setIsPopUp_deposit] = useState(false); // State để quản lý popup
    const CalculatorDays = (checkin, checkout) => {
        return Math.ceil(Math.abs(new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24) + 1);
    }
    // Tính thời gian hiện tại và ngày kế tiếp
    const now = new Date();

    // Định dạng thời gian cho input datetime-local (YYYY-MM-DDThh:mm)
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    // Giá trị min cho checkin (ngày kế tiếp)
    const minCheckin = formatDateTime(now);

    const handleChange = (event) => {
        const { id, value } = event.target;
        const newValue = id === "member" ? parseInt(value) || 0 : value;

        const maxCapacity =
            roomTypes.length > 0
                ? roomTypes.find((roomType) => roomType.name === formData.roomType)?.capacity || 0
                : 0;

        setFormData((prevData) => {
            const updatedData = {
                ...prevData,
                [id]: value,
            };

            if (id === 'roomType') {
                const selectedRoom = roomTypes.find((room) => room.name === value);
                const price = selectedRoom ? selectedRoom.price : 0;
                setSelectedRoomPrice(price);
                updatedData.price = price.toString();
                updatedData.Total_price = Total_price(price, updatedData.room).toString();
            } else if (id === 'room') {
                updatedData.Total_price = Total_price(selectedRoomPrice, value).toString();
            }

            if (id === "member" && newValue > maxCapacity) {
                window.showNotification(`Maximum capacity is ${maxCapacity}. Please reduce the number of members.`, "error");
            }

            return updatedData;
        });
    };

    // Fetch room types from the API
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
                    window.showNotification('Invalid room types data', 'error');
                    return;
                }
                setRoomTypes(formattedRooms);
            } catch (error) {
                console.error('Error fetching room types:', error.response || error);
                window.showNotification('Failed to load room types', 'error');
            }
        };

        fetchRoomTypes();
    }, []);

    //effect loading
    useEffect(() => {
        // Giả lập thời gian tải nội dung (2 giây)
        const timer = setTimeout(() => {
            setIsLoading(false); // Kết thúc loading
        }, 1550);

        return () => clearTimeout(timer); // Dọn dẹp timer khi unmount component
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user.id) {
            checkLogin();
            return;
        }

        // Kiểm tra các trường bắt buộc
        if (!formData.checkin || !formData.checkout || !formData.roomType) {
            window.showNotification("Please fill in all required fields.", "error");
            return;
        }

        // Chuyển đổi checkin và checkout thành đối tượng Date
        const checkinDate = new Date(formData.checkin);
        const checkoutDate = new Date(formData.checkout);
        const currentDate = new Date();

        // Kiểm tra checkin không được nhỏ hơn thời gian hiện tại
        if (checkinDate < currentDate) {
            window.showNotification("Check-in time cannot be in the past.", "error");
            return;
        }

        // Kiểm tra checkout phải lớn hơn checkin (ít nhất 1 giờ)
        const minCheckoutDate = new Date(checkinDate);
        minCheckoutDate.setHours(checkinDate.getHours() + 1);
        if (checkoutDate <= minCheckoutDate) {
            window.showNotification("Check-out time must be at least 1 hour after check-in.", "error");
            return;
        }
        
        const maxCapacity =
            roomTypes.length > 0
                ? roomTypes.find((roomType) => roomType.name === formData.roomType)?.capacity || 0
                : 0;

        if (parseInt(formData.member) > maxCapacity) {
            window.showNotification(`Cannot book. Number of members (${formData.member}) exceeds room capacity (${maxCapacity}).`, "error");
            return; // Ngăn không mở popup nếu vượt quá capacity
        }

        setIsPopUp_deposit(true);
    };

    const handlePopupConfirm = async (confirmed) => {
        if (confirmed) {
            // cmt đoạn này lại sau khi có component thanh toán
            try {
                const selectedRoom = roomTypes.find((room) => room.name === formData.roomType);
                const roomTypeId = selectedRoom ? selectedRoom.id : null;
                const response = await axios.post('/api/booking', {
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    room_type: formData.roomType,
                    number_of_rooms: formData.room,
                    children: formData.children,
                    member: formData.member,
                    price: selectedRoomPrice,
                    total_price: Total_price(selectedRoomPrice, formData.room),
                    checkin_date: formData.checkin,
                    checkout_date: formData.checkout,
                });

                if (response.status === 201) {
                    window.showNotification("Booking created successfully!", "success");
                    setFormData({
                        checkin: '',
                        checkout: '',
                        roomType: '',
                        room: 1,
                        children: 0,
                        member: 1,
                        price: '0',
                        Total_price: '0',
                    });
                    setSelectedRoomPrice(0);
                }
            } catch (error) {
                console.error('Error creating booking:', error.response || error);
                window.showNotification("Failed to create booking", "error");
                setTimeout(() => {
                    window.showNotification("Pls add the phone number if you don't have", "error");
                }, 4000);
            }
            //----------------------------------------------------------------------------------
        }
        setIsPopUp_deposit(false); // Đóng popup dù có xác nhận hay không
    };

    const handlePopupClose = () => {
        setIsPopUp_deposit(false); // Đóng popup mà không xác nhận
    };

    // Scroll to the selected section
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <>
            <Banner title="Booking Now" description="Book your stay with us" />
            <div style={{}} className="bg" id="booknow" >
                <video autoPlay muted loop playsInline preload="auto" className="background-video video-container " >
                    <source src="/images/Dat/rooms/background.mp4" type="video/mp4" />
                </video>
                <div className="container container-dat">
                    {isLoading ? (
                        // Hiển thị hiệu ứng loading
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (

                        <form
                            className="p-4 rounded text-light shadow booking-form"
                            style={{ backgroundColor: "rgba(33, 37, 41, 0.9)" }}>
                            <h2 className="mb-4 text-center">Hotel Booking</h2>

                            {/* Thời gian Check-in / Check-out */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="checkin" className="form-label">Check-in:</label>
                                    <input type="datetime-local" id="checkin" className="form-control" onChange={handleChange} min={minCheckin} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="checkout" className="form-label">Check-out:</label>
                                    <input
                                        type="datetime-local"
                                        id="checkout"
                                        className="form-control"
                                        onChange={handleChange}
                                        min={
                                            formData.checkin
                                                ? formatDateTime(new Date(new Date(formData.checkin).setHours(new Date(formData.checkin).getHours() + 1)))
                                                : minCheckin
                                        }
                                    />
                                </div>
                            </div>

                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="room" className="form-label">Number of Rooms:</label>
                                    <select name="room" id="room" className="form-select" value={formData.room} onChange={handleChange}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="roomType" className="form-label">Room Type:</label>
                                    <select id="roomType" className="form-select" value={formData.roomType} onChange={handleChange}>
                                        <option value="">Select room type</option>
                                        {roomTypes.map((roomType) => (
                                            <option key={roomType.id} value={roomType.name}>
                                                {roomType.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Enter children's ages */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="children" className="form-label">Children Ages(0-11):</label>
                                    <input
                                        type="number"
                                        id="children"
                                        className="form-control"
                                        min="0"
                                        max="11"
                                        // value={formData.children}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="member" className="form-label">Member:</label>
                                    <input
                                        type="number"
                                        id="member"
                                        className="form-control"
                                        min={0}
                                        max={formData.roomType ? roomTypes.find((roomType) => roomType.name === formData.roomType).capacity : 0}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="view-price col-md-6">
                                    <p>
                                        Days: {CalculatorDays(formData.checkin, formData.checkout) || '0'}
                                    </p>
                                    <p>
                                        The {formData.roomType || 'room Type'}: {selectedRoomPrice}0 VNĐ/night
                                    </p>
                                </div>
                                <div className="view-price col-md-6">
                                    <p>Deposit (20%): {(parseFloat(formData.Total_price) * 0.2).toFixed(2)}0 VNĐ</p>
                                    <p>Total Price: {(formData.Total_price * parseInt(CalculatorDays(formData.checkin, formData.checkout) || '0'))}00 VNĐ</p>
                                </div>
                                <div className="mt-4">
                                    <button onClick={handleBooking} className="btn btn-warning w-100">Book Now</button>
                                </div>
                                {isPopUp_deposit && (
                                    <PopUp_deposit
                                        onConfirm={handlePopupConfirm}
                                        onClose={handlePopupClose}
                                    />
                                )}
                            </div>

                        </form>
                    )}
                </div>
            </div >
            <div >
                <BookNow checkLogins={checkLogins} />  {/* closePopup={closePopup} isPopupBookNow={isPopupBookNow}*/}
            </div>
        </>
    );
};

export default Booking;