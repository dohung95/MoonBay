import React, { useState, useEffect, useContext, useCallback } from "react";
import '../../css/my_css/PopupBookNow.css';
import { AuthContext } from "./AuthContext.jsx";
import axios from "axios";
import PopUp_deposit from "./PopUp_deposit.jsx";
import debounce from 'lodash/debounce';
import PriceHolidayTet from "./PriceHolidayTet.jsx";
import dayjs from 'dayjs';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PopupBookNow = ({ closePopup, isPopupBookNow, selectedRoomName }) => {
    const { user } = useContext(AuthContext);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
        roomType: '',
        room: 1,
        children: 0,
        member: 1,
        price: '0',
        total_price: '0',
    });
    const [isPopUp_deposit, setIsPopUp_deposit] = useState(false);

    const CalculatorDays = (checkin, checkout) => {
        return Math.ceil(Math.abs(new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    }

    const calculateExactTotalPrice = (basePrice, checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) return 0;

        const startDate = dayjs(checkin);
        const endDate = dayjs(checkout);
        let total = 0;

        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            const adjusted = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD')) || basePrice;
            total += adjusted;
        }
        return total;
    };

    const Total_price = (basePrice, room, checkin, checkout) => {
        const totalPerRoom = calculateExactTotalPrice(basePrice, checkin, checkout);
        return totalPerRoom * parseInt(room);
    };

    const maxCapacity = roomTypes.find(rt => rt.name === formData.roomType)?.capacity || 0;
    const Maxmember = () => formData.room * maxCapacity;

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room_types'),
                    axios.get('/api/rooms')
                ]);

                const roomData = Array.isArray(response.data) ? response.data :
                    response.data.data || [];

                setRoomTypes(roomData);
                setRooms(roomsRes.data || []);
            } catch (error) {
                console.error("Failed to fetch room types:", error);
                window.showNotification("Error loading room types", "error");
            }
        };
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (!isPopupBookNow) {
            setFormData({
                checkin: '',
                checkout: '',
                roomType: '',
                room: 1,
                children: 0,
                member: 1,
                price: '0',
                total_price: '0',
            });
            setSelectedRoomPrice(0);
        }
    }, [isPopupBookNow]);

    useEffect(() => {
        if (isPopupBookNow && selectedRoomName && roomTypes.length > 0) {
            const defaultRoom = roomTypes.find(room => room.name === selectedRoomName);
            if (defaultRoom) {
                const price = defaultRoom.price;
                const total = Total_price(price, formData.room, formData.checkin, formData.checkout);
                setFormData(prev => ({
                    ...prev,
                    roomType: defaultRoom.name,
                    price: price.toString(),
                    total_price: total.toString()
                }));
                setSelectedRoomPrice(price);
            }
        }
    }, [isPopupBookNow, selectedRoomName, roomTypes, formData.checkin, formData.checkout, formData.room]);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    // Fetch room types from the API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {

                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room_types'),
                    axios.get('/api/rooms')
                ]);
                let formattedRooms = [];
                if (Array.isArray(response.data)) {
                    formattedRooms = response.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price,
                        capacity: room.capacity || 0
                    }));
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    formattedRooms = response.data.data.map(room => ({
                        id: room.id,
                        name: room.name,
                        price: room.price,
                        capacity: room.capacity || 0
                    }));
                } else {
                    console.error('Unexpected data structure:', response.data);
                    window.showNotification('Invalid room types data', 'error');
                    return;
                }
                setRoomTypes(formattedRooms);
                setRooms(roomsRes.data || []);
            } catch (error) {
                console.error('Error fetching room types:', error.response || error);
                window.showNotification('Failed to load room types', 'error');
            }
        };

        fetchRoomTypes();
    }, []);

    const handleChange = useCallback(
        debounce((event) => {
            const { id, value } = event.target;
            const newValue = id === "member" ? parseInt(value) || 0 : value;

            setFormData((prevData) => ({
                ...prevData,
                [id]: value,
            }));

            if (id === 'room') {
                const total = Total_price(selectedRoomPrice, value).toString();
                setFormData((prevData) => ({
                    ...prevData,
                    total_price: total,
                }));
            }
            
            if (id === "member" && newValue > Maxmember(formData.room)) {
                window.showNotification(`Maximum capacity is ${Maxmember(formData.room)} member${Maxmember(formData.room) > 1 ? 's' : ''} for ${formData.room} room${formData.room > 1 ? 's' : ''}. Please reduce the number of members.`, "error");
            }

            if (id === 'roomType') {
                const selectedRoom = roomTypes.find((room) => room.id === parseInt(value));
                const price = selectedRoom ? selectedRoom.price : 0;
                setSelectedRoomPrice(price);
            }

        }, 300),
        [selectedRoomPrice, roomTypes, selectedRoomName]
    );

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const now = new Date();
    const minCheckin = formatDateTime(now);

    const handleBookNow = async (e) => {
        e.preventDefault();

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

        if (parseInt(formData.member) > Maxmember(formData.room) || parseInt(formData.member) <= 0) {
            window.showNotification(`Cannot book. Number of members (${formData.member}) exceeds room capacity (${Maxmember(formData.room)}).`, "error");
            return;
        }

        const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
        if (availableRooms < 1) {
            window.showNotification("No rooms available for booking.", "error");
            return;
        } else if (availableRooms < parseInt(formData.room)) {
            window.showNotification(`Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available, but you selected ${formData.room}.`, "error");
            return;
        }

        window.showNotification(`${availableRooms} room${availableRooms > 1 ? 's' : ''} available for booking.`, "success");
        setIsPopUp_deposit(true);
    };

    const handlePopupConfirm = async (confirmed) => {
        if (confirmed) {
            // cmt đoạn này lại sau khi có component thanh toán 
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
                    total_price: formData.total_price,
                });

                if (response.status === 201) {
                    window.showNotification("Booking created successfully!", "success");

                    const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available');
                    for (let i = 0; i < parseInt(formData.room) && i < availableRooms.length; i++) {
                        await axios.put(`/api/rooms/${availableRooms[i].id}`, { status: "booked" })
                            .then(() => console.log(`Updated room ${availableRooms[i].id} status to null`))
                            .catch(err => console.error(`Error updating room ${availableRooms[i].id}:`, err));
                    }

                    // Cập nhật state rooms cục bộ
                    setRooms(prev => prev.map(room =>
                        availableRooms.some(ar => ar.id === room.id) ? { ...room, status: null } : room
                    ));

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
            //----------------------------------------------------------------------------------
        }
        setIsPopUp_deposit(false);
    };

    const handlePopupClose = () => {
        setIsPopUp_deposit(false);
    };

    return (
        <>
            {isPopupBookNow && (
                <div className="popup-overlay" onClick={(e) => e.target.classList.contains("popup-overlay") && closePopup()}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup}>×</button>
                        <h2>Book Now</h2>
                        <form>
                            <div className="mb-3">
                                <label htmlFor="checkin" className="form-label">Check-in Date:</label>
                                <input type="datetime-local" id="checkin" className="form-control" min={minCheckin} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="checkout" className="form-label">Check-out Date:</label>
                                <input type="datetime-local" id="checkout" className="form-control" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label>Room Type:</label>
                                <input type="text" className="form-control" value={formData.roomType} readOnly />
                            </div>
                            <div className="mb-3">
                                <label>Number of Rooms:</label>
                                <select id="room" className="form-select" value={formData.room} onChange={handleChange}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>Children (0–11):</label>
                                <input type="number" id="children" className="form-control" min="0" max="11" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label>Member:</label>
                                <input type="number" id="member" className="form-control" min="1" max={Maxmember()} onChange={handleChange} />
                            </div>

                            <div className="view-price-popup info-row">
                                <p className="info-item">Days: {CalculatorDays(formData.checkin, formData.checkout) || '0'}</p>
                                <p className="info-item">Base Price: {formatCurrency(selectedRoomPrice * 1000)}/night</p>
                                <p className="info-item">Deposit (20%): {formatCurrency(parseFloat(formData.total_price) * 0.2 * 1000)}</p>
                                <p className="info-item">Total Price: {formatCurrency(parseFloat(formData.total_price) * 1000)}</p>
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
};

export default PopupBookNow;
