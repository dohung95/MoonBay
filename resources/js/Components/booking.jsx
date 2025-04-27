import React, { useState, useEffect, useContext } from "react";
import '../../css/my_css/booking.css';
import BookNow from "./BookNow.jsx";
import { AuthContext } from "./AuthContext.jsx"; // Import AuthContext
import axios from "axios";
import "./AuthContext.jsx"; // Giả sử bạn đã định nghĩa $user trong AuthContext
import Banner from "./banner.jsx";

const Booking = ({ checkLogin, checkLogins, isPopupBookNow, closePopup }) => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        checkin: '',
        checkout: '',
        roomType: '',
        room: 1,
        children: 0,
        member: 1,
    });

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    useEffect(() => {
        // Giả lập thời gian tải nội dung (2 giây)
        const timer = setTimeout(() => {
            setIsLoading(false); // Kết thúc loading
        }, 1550);

        return () => clearTimeout(timer); // Dọn dẹp timer khi unmount component
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            checkLogin();
            return;
        }

        // Kiểm tra các trường bắt buộc
        if (!formData.checkin || !formData.checkout || !formData.roomType ) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!user || !user.id) {
            alert("User is not logged in or ID is missing.");
            return;
        }

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
            });

            if (response.status === 201) {
                alert('Booking created successfully!');
            }
        } catch (error) {

            console.error('Error creating booking:', error.response || error);
            alert('Failed to create booking. Please try again.');

        }
    };

    return (
        <>
            <Banner title="Booking Now" description="Book your stay with us" />
            <div style={{}} className="bg" >
                <video autoPlay muted loop playsInline preload="auto" className="background-video video-container " >
                    <source src="/images/Dat/rooms/background.mp4" type="video/mp4" />
                </video>
                <div className="container" >
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
                                    <input type="date" id="checkin" className="form-control" value={formData.checkin} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="checkout" className="form-label">Check-out:</label>
                                    <input type="date" id="checkout" className="form-control" value={formData.checkout} onChange={handleChange} />
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
                                        <option value="single">Standard Room</option>
                                        <option value="double">Deluxe Room</option>
                                        <option value="family">Superior Room</option>
                                        <option value="presidential">Family Room</option>
                                        <option value="studio">Suite Room</option>
                                    </select>
                                </div>
                            </div>

                            {/* Enter children's ages */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="children" className="form-label">Children(0-11):</label>
                                    <input
                                        type="number"
                                        id="children"
                                        className="form-control"
                                        min="0"
                                        max="11"
                                        value={formData.children}
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
                                        min="1"
                                        value={formData.member}
                                        onChange={handleChange}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button onClick={handleBooking} className="btn btn-warning w-100">Book jhvguhvghvhgvNow</button>
                            </div>
                        </form>
                    )}
                </div>
            </div >
            <div >
                <BookNow checkLogins={checkLogins} isPopupBookNow={isPopupBookNow} />  {/* closePopup={closePopup} */}
            </div>
        </>
    );
};

export default Booking;