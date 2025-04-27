import React , { useEffect } from "react";
import '../../css/my_css/PopupBookNow.css'


const PopupBookNow = ({closePopup, isPopupBookNow}) => {

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            closePopup();
        }
    };

    return (
        <> 
            {isPopupBookNow && (
                <div className="popup-overlay" onClick={handleOverlayClick}>
                    <div className="popup-content">
                        <button className="close-popup-btn" onClick={closePopup}>
                            ×
                        </button>
                        <h2>Book Now</h2>
                        <form action="/booking" >   {/* method="POST" */}
                            <div className="mb-3">
                                <label htmlFor="checkin" className="form-label">Check-in Date:</label>
                                <input type="date" id="checkin" name="checkin" className="form-control" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="checkout" className="form-label">Check-out Date:</label>
                                <input type="date" id="checkout" name="checkout" className="form-control" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="room" className="form-label">Number of Rooms:</label>
                                <select name="room" id="room" className="form-select" required>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="children" className="form-label">Children(0-11):</label>
                                <input type="number" id="children" name="children" className="form-control" min="0" max="11" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="member" className="form-label">Member:</label>
                                <input type="number" id="member" name="member" className="form-control" required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
export default PopupBookNow;