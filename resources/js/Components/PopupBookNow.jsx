    import React, { useState, useEffect, useContext } from "react";
    import '../../css/my_css/PopupBookNow.css'
    import { AuthContext } from "./AuthContext.jsx";
    import axios from "axios";

    const PopupBookNow = ({closePopup, isPopupBookNow, selectedRoomName}) => {
        const { user } = useContext(AuthContext);
        const [formData, setFormData] = useState({
                checkin: '',
                checkout: '',
                roomType: '',
                room: 1,
                children: 0,
                member: 1,
            });

        // Cập nhật roomType khi popup mở hoặc selectedRoomName thay đổi
        useEffect(() => {
            if (isPopupBookNow && selectedRoomName) {
                setFormData((prevData) => ({
                    ...prevData,
                    roomType: selectedRoomName, // Gán roomType từ selectedRoomName
                }));
            }
        }, [isPopupBookNow, selectedRoomName]);

        const handleOverlayClick = (e) => {
            if (e.target.classList.contains("popup-overlay")) {
                closePopup();
            }
        };

        // Tính thời gian hiện tại và ngày kế tiếp
        const now = new Date();
        

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
                    window.showNotification("Booking created successfully!", "success");
                    closePopup();
                }
            } catch (error) {

                console.error('Error creating booking:', error.response || error);
                setTimeout(() => {
                    window.showNotification("Failed to create booking", "error");
                }, 0);
            }
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
                                    <input type="datetime-local" id="checkin" name="checkin" className="form-control" min={minCheckin} onChange={handleChange} required/>
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
                                    <input type="number" id="member" name="member" className="form-control" placeholder="1" min="1"  onChange={handleChange}/>
                                </div>
                                <button onClick={handleBookNow}  className="btn btn-primary w-100">Submit</button>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }
    export default PopupBookNow;