import React, { useState, useEffect, useContext } from "react";
import '../../css/my_css/PopupBookNow.css'
import { AuthContext } from "./AuthContext.jsx";
import axios from "axios";
import PopUp_deposit from "./PopUp_deposit.jsx";

const PopupBookNow = ({ closePopup, isPopupBookNow, selectedRoomName }) => {
    const { user } = useContext(AuthContext);
    const [roomTypes, setRoomTypes] = useState([]);
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

    // Reset formData khi popup đóng
    useEffect(() => {
        if (!isPopupBookNow) {
            setFormData({
                checkin: '',
                checkout: '',
                roomType: '',
                room: 1, // Reset room về 1 khi đóng popup
                children: 0,
                member: 1,
                price: '0',
                Total_price: '0',
            });
            setSelectedRoomPrice(0);
        }
    }, [isPopupBookNow]);

    // Cập nhật roomType khi popup mở hoặc selectedRoomName thay đổi
    useEffect(() => {
        if (isPopupBookNow && selectedRoomName && roomTypes.length > 0) {
            const defaultRoom = roomTypes.find(room => room.name === selectedRoomName);
            if (defaultRoom) {
                const price = defaultRoom.price;
                const total = Total_price(price, formData.room);
                setFormData((prevData) => ({
                    ...prevData,
                    roomType: defaultRoom.name.toString(),
                    price: price.toString(),
                    Total_price: total,
                }));
                setSelectedRoomPrice(price);
            }
        }
    }, [isPopupBookNow, selectedRoomName, roomTypes, formData.room]);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    // Tính thời gian hiện tại và ngày kế tiếp
    const now = new Date();

    // Fetch room types from the API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await axios.get('/api/room_types');
                let formattedRooms = [];
                if (Array.isArray(response.data)) {
                    formattedRooms = response.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price
                    }));
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    formattedRooms = response.data.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price
                    }));
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

    // Định dạng thời gian cho input datetime-local (YYYY-MM-DDThh:mm)
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year}T${hours}:${minutes}`;
    };

    // Giá trị min cho checkin (ngày kế tiếp)
    const minCheckin = formatDateTime(now);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        if (id === 'roomType') {
            const selectedRoom = roomTypes.find((room) => room.id === parseInt(value));
            const price = selectedRoom ? selectedRoom.price : 0;
            setSelectedRoomPrice(price);
        }
    };

    const handleBookNow = async (e) => {
        e.preventDefault();

        if (!user.id) {
            checkLogin();
            return;
        }

        // Kiểm tra các trường bắt buộc
        if (!formData.checkin || !formData.checkout) {
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

        setIsPopUp_deposit(true);
    };

    const handlePopupConfirm = async (confirmed) => {
        if (confirmed) {
            try {
                const response = await axios.post('/api/booking', {
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    room_type: formData.roomType,
                    number_of_rooms: formData.room,
                    children: formData.children,
                    member: formData.member,
                    checkin_date: formData.checkin,
                    checkout_date: formData.checkout,
                    price: formData.price,
                    total_price: formData.Total_price,
                });

                if (response.status === 201) {
                    window.showNotification("Booking created successfully!", "success");
                    closePopup();
                    setIsPopUp_deposit(false);
                }
            } catch (error) {
                console.error('Error creating booking:', error.response || error);
                window.showNotification("Failed to create booking", "error");
                setTimeout(() => {
                    window.showNotification("Pls add the phone number if you don't have", "error");
                }, 4000);
            }
        }
        setIsPopUp_deposit(false); // Đóng popup dù có xác nhận hay không
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false); // Đóng popup mà không xác nhận
    };

    return (
        <>
            {isPopupBookNow && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" style={{ color: 'black' }} onClick={closePopup}>
                            ×
                        </button>
                        <h2>Book Now</h2>
                        <form action="/booking" >   {/* method="POST" */}
                            <div className="mb-3">
                                <label htmlFor="checkin" className="form-label">Check-in Date:</label>
                                <input type="datetime-local" id="checkin" name="checkin" className="form-control" min={minCheckin} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="checkout" className="form-label">Check-out Date:</label>
                                <input type="datetime-local" id="checkout" name="checkout" className="form-control" onChange={handleChange}
                                    min={
                                        formData.checkin
                                            ? formatDateTime(new Date(new Date(formData.checkin).setHours(new Date(formData.checkin).getHours() + 1)))
                                            : minCheckin
                                    }
                                    required />
                            </div>
                            <div>
                                <label htmlFor="roomType" className="form-label">Room Type:</label>
                                <input type="text" id="roomType" name="roomType" className="form-control bold-placeholder" placeholder={formData.roomType} readOnly />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="room" className="form-label">Number of Rooms:</label>
                                <select name="room" id="room" className="form-select" onChange={handleChange}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="children" className="form-label">Children Ages(0-11):</label>
                                <input type="number" id="children" name="children" className="form-control" placeholder="0" min="0" max="11" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="member" className="form-label">Member:</label>
                                <input type="number" id="member" name="member" className="form-control" placeholder="1" min="1" onChange={handleChange} />
                            </div>
                            <div className="view-price-popup">
                                <p>
                                    The {selectedRoomName}: {selectedRoomPrice} /night
                                </p>
                                <p style={{ marginTop: '5px', marginBottom: '10px' }} >Total Price: {Total_price(selectedRoomPrice, formData.room)}</p>
                                <p>Deposit (20%): {(parseFloat(formData.Total_price) * 0.2).toFixed(2)}$</p>
                            </div>
                            <button onClick={handleBookNow} className="btn btn-primary w-100">Submit</button>
                            {isPopUp_deposit && (
                                <PopUp_deposit
                                    onConfirm={handlePopupConfirm}
                                    onClose={handlePopupClose}
                                />
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
export default PopupBookNow;