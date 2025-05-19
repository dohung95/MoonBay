import React, { useState, useEffect, useContext, useRef } from "react";
import '../../css/my_css/booking.css';
import BookNow from "./BookNow.jsx";
import { AuthContext } from "./AuthContext.jsx";
import axios from "axios";
import Banner from "./banner.jsx";
import { useLocation } from "react-router-dom";
import PopUp_deposit from "./PopUp_deposit.jsx";
import PriceHolidayTet from "./PriceHolidayTet.jsx";
import dayjs from 'dayjs';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Booking = ({ checkLogin, checkLogins }) => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
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
        Total_price: '0',
    });
    const [isPopUp_deposit, setIsPopUp_deposit] = useState(false);
    const [priceNotification, setPriceNotification] = useState('');

    const Total_price = (price, room) => {
        return parseFloat(price) * parseInt(room);
    };

    const CalculatorDays = (checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) {
            return 0;
        }
        return Math.ceil(Math.abs(new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    }

    const calculateExactTotalPrice = (basePrice, checkin, checkout) => {
        if (!checkin || !checkout || !dayjs(checkin).isValid() || !dayjs(checkout).isValid()) {
            return 0;
        }
        const startDate = dayjs(checkin);
        const endDate = dayjs(checkout);
        let total = 0;
        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            const adjusted = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD')) || basePrice;
            total += adjusted;
        }
        return total;
    };

    const maxCapacity = roomTypes.length > 0 ? roomTypes.find((roomType) => roomType.name === formData.roomType)?.capacity || 0 : 0;
    const Maxmember = () => formData.room * maxCapacity;

    const now = new Date();
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const minCheckin = formatDateTime(now);

    const handleChange = (event) => {
        const { id, value } = event.target;
        const newValue = id === "member" ? parseInt(value) || 0 : value;

        setFormData((prevData) => {
            const updatedData = {
                ...prevData,
                [id]: value,
            };

            if (id === 'roomType' || id === 'checkin' || id === 'checkout') {
                const selectedRoom = roomTypes.find((room) => room.name === (id === 'roomType' ? value : formData.roomType));
                const basePrice = selectedRoom ? selectedRoom.price : 0;

                const totalExact = calculateExactTotalPrice(
                    basePrice,
                    id === 'checkin' ? value : formData.checkin,
                    id === 'checkout' ? value : formData.checkout
                );

                updatedData.Total_price = (totalExact * updatedData.room).toString();
                setSelectedRoomPrice(basePrice);
                updatedData.price = basePrice.toString();

                // hàm thông báo ngày lễ cuối tuần tăng giá
               const checkinDate = id === 'checkin' ? value : formData.checkin;
                const checkoutDate = id === 'checkout' ? value : formData.checkout;
                let notification = '';

                if (checkinDate && checkoutDate && dayjs(checkinDate).isValid() && dayjs(checkoutDate).isValid()) {
                    const startDate = dayjs(checkinDate);
                    const endDate = dayjs(checkoutDate);
                    const specialDays = [];

                    for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
                        const adjustedPrice = PriceHolidayTet(basePrice, date.format('YYYY-MM-DD'));
                        const isBasePrice = adjustedPrice === basePrice;
                        if (!isBasePrice) { // Chỉ thêm nếu giá điều chỉnh khác giá cơ bản
                            const isWeekend = [5, 6].includes(date.day()); // Thứ Sáu (5) hoặc Thứ Bảy (6)
                            const isHoliday = adjustedPrice / basePrice === 1.5; // Tăng 50% cho ngày lễ/liền kề
                            if (isWeekend || isHoliday) { // Chỉ thêm ngày là cuối tuần hoặc ngày lễ
                                specialDays.push({
                                    date: date.format('DD/MM/YYYY'),
                                    isWeekend,
                                    isHoliday,
                                    price: adjustedPrice,
                                });
                            }
                        }
                    }

                    if (specialDays.length > 0) {
                        notification = specialDays.map(day => {
                            const type = day.isWeekend && day.isHoliday ? 'Weekend & Holiday' : (day.isWeekend ? 'Weekend' : 'Holiday');
                            return `${day.date} (${type}): Price is ${formatCurrency(day.price * 1000)}/night`;
                        }).join('\n');
                    }
                }

                setPriceNotification(notification);

                if (id === 'roomType') {
                    const available = rooms.filter(r => r.type === value && r.status === 'available').length;
                    window.showNotification(
                        available ? `${available} room${available > 1 ? 's' : ''} available` : 'No rooms available, please choose another room type or call hotline',
                        available ? 'success' : 'error'
                    );
                }
            } else if (id === 'room') {
                updatedData.Total_price = (parseFloat(formData.Total_price) / parseInt(formData.room) * parseInt(value)).toString();
            }

            if (id === "member" && newValue > Maxmember(updatedData.room)) {
                window.showNotification(`Maximum capacity is ${Maxmember(updatedData.room)} member${Maxmember(updatedData.room) > 1 ? 's' : ''} for ${updatedData.room} room${updatedData.room > 1 ? 's' : ''}. Please reduce the number of members.`, "error");
            }

            const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
            if (id === "room" && newValue > availableRooms) {
                window.showNotification(`Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available`, "error");
            }

            return updatedData;
        });
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user) {
            checkLogin();
            return;
        }

        if (!formData.checkin || !formData.checkout || !formData.roomType || !formData.member) {
            window.showNotification("Please fill in all required fields.", "error");
            return;
        }

        const checkinDate = new Date(formData.checkin);
        const checkoutDate = new Date(formData.checkout);
        const currentDate = new Date();

        if (checkinDate < currentDate) {
            window.showNotification("Check-in time cannot be in the past.", "error");
            return;
        }

        const minCheckoutDate = new Date(checkinDate);
        minCheckoutDate.setHours(checkinDate.getHours() + 1);
        if (checkoutDate <= minCheckoutDate) {
            window.showNotification("Check-out time must be at least 1 hour after check-in.", "error");
            return;
        }

        if (parseInt(formData.member) > Maxmember(formData.room) || parseInt(formData.member) <= 0) {
            window.showNotification(`Cannot book. Number of members (${formData.member}) exceeds room capacity (${Maxmember(formData.room)}).`, "error");
            return; // Ngăn không mở popup nếu vượt quá capacity
        }

        const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available').length;
        if (availableRooms < 1) {
            window.showNotification("No rooms available for booking.", "error");
            return;
        } else if (availableRooms < parseInt(formData.room)) {
            window.showNotification(`Only ${availableRooms} room${availableRooms > 1 ? 's' : ''} available, but you selected ${formData.room}.`, "error");
            return;
        }

        setIsPopUp_deposit(true);
    };

    const handlePopupConfirm = async (confirmed) => {
        if (confirmed) {
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
                    total_price: Total_price(selectedRoomPrice, formData.room) * CalculatorDays(formData.checkin, formData.checkout),
                    checkin_date: formData.checkin,
                    checkout_date: formData.checkout,
                });

                if (response.status === 201) {
                    window.showNotification("Booking created successfully!", "success");

                    const availableRooms = rooms.filter(r => r.type === formData.roomType && r.status === 'available');
                    for (let i = 0; i < parseInt(formData.room) && i < availableRooms.length; i++) {
                        await axios.put(`/api/rooms/${availableRooms[i].id}`, { status: 'booked' });
                    }

                    setRooms(prevRooms => prevRooms.map(room =>
                        availableRooms.some(ar => ar.id === room.id) ? { ...room, status: '' } : room
                    ));

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
                    setPriceNotification('');
                    setSelectedRoomPrice(0);
                    if (checkinRef.current) checkinRef.current.value = '';
                    if (checkoutRef.current) checkoutRef.current.value = '';
                }
            } catch (error) {
                console.error('Error creating booking:', error.response || error);
                window.showNotification("Failed to create booking", "error");
                setTimeout(() => {
                    window.showNotification("Please add the phone number if you don't have", "error");
                }, 4000);
            }
        }
        setIsPopUp_deposit(false);
    };

    const handlePopupClose = () => {
        setIsPopUp_deposit(false);
    };

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const [response, roomsRes] = await Promise.all([
                    axios.get('/api/room-types'),
                    axios.get('/api/rooms')
                ]);
                setRoomTypes(response.data.room_types || response.data);
                setRooms(roomsRes.data || []);
            } catch (error) {
                console.error('Error fetching room types:', error);
            }
        };
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1550);
        return () => clearTimeout(timer);
    }, []);

    const location = useLocation();
    const checkinRef = useRef(null);
    const checkoutRef = useRef(null);

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
            <div className="bg" id="booknow">
                <video autoPlay muted loop playsInline preload="auto" className="background-video video-container">
                    <source src="/images/Dat/rooms/background.mp4" type="video/mp4" />
                </video>
                <div className="container container-dat">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <form className="p-4 rounded text-light shadow booking-form" style={{ backgroundColor: "rgba(33, 37, 41, 0.9)" }}>
                            <h2 className="mb-4 text-center">Hotel Booking</h2>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="checkin" className="form-label">Check-in:</label>
                                    <input ref={checkinRef} value={formData.checkin} type="date" id="checkin" className="form-control" onChange={handleChange} min={minCheckin} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="checkout" className="form-label">Check-out:</label>
                                    <input ref={checkoutRef} value={formData.checkout} type="date" id="checkout" className="form-control" onChange={handleChange} min={formData.checkin ? formatDateTime(new Date(new Date(formData.checkin).setHours(new Date(formData.checkin).getHours() + 1))) : minCheckin} />
                                </div>
                            </div>
                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="room" className="form-label">Number of Rooms:</label>
                                    <select name="room" id="room" className="form-select" value={formData.room} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="roomType" className="form-label">Room Type:</label>
                                    <select id="roomType" className="form-select" value={formData.roomType} onChange={handleChange}>
                                        <option value="">Select room type</option>
                                        {roomTypes.map((roomType) => (
                                            <option key={roomType.id} value={roomType.name}>{roomType.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="children" className="form-label">Children Ages(0-11):</label>
                                    <input type="number" id="children" className="form-control" min="0" max="11" onChange={handleChange} placeholder="0" value={formData.children} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="member" className="form-label">Member:</label>
                                    <input type="number" id="member" className="form-control" min={0} max={Maxmember(formData.room)} onChange={handleChange} placeholder="1" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="view-price col-md-6">
                                    <p>Days: {CalculatorDays(formData.checkin, formData.checkout) || '0'}</p>
                                    <p>The {formData.roomType || 'room Type'}: {formatCurrency(selectedRoomPrice * 1000)}/night (base)</p>
                                    {priceNotification && (
                                        <p className="price-notification">
                                            {priceNotification}
                                        </p>
                                    )}
                                </div>
                                <div className="view-price col-md-6">
                                    <p>Deposit (20%): {formatCurrency((parseFloat(formData.Total_price) * 0.2) * 1000)}</p>
                                    <p>Total Price: {formatCurrency(parseFloat(formData.Total_price) * 1000)}</p>
                                </div>
                                <div className="mt-4">
                                    <button type="submit" className="btn btn-warning w-100" onClick={handleBooking}>Book Now</button>
                                </div>
                                {isPopUp_deposit && (
                                    <PopUp_deposit onConfirm={handlePopupConfirm} onClose={handlePopupClose} />
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <div>
                <BookNow checkLogins={checkLogins} />
            </div>
        </>
    );
};

export default Booking;
