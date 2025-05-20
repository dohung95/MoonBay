import React, { useState, useEffect, useRef } from 'react';
import { format, getDaysInMonth, addMonths, subMonths, startOfDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Tooltip } from 'bootstrap';
import '../../../css/css_of_admin/ManageBooking.css';

const ManageBookings = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({});
  const tableRef = useRef(null);
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  // Fetch all rooms from paginated API
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      let allRooms = [];
      let page = 1;
      const perPage = 10;

      try {
        while (true) {
          const response = await axios.get('http://localhost:8000/api/room_list', {
            params: { per_page: perPage, page },
          });
          const { data, last_page } = response.data;
          allRooms = [...allRooms, ...data.map(item => ({
            id: item.id,
            room_number: item.room_number,
          }))];
          if (page >= last_page) break;
          page++;
        }
        setRooms(allRooms);
      } catch (error) {
        console.error('Error fetching room list:', error);
        setError('Failed to load room list');
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch bookings for the current month
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      let allBookings = [];
      let page = 1;
      const perPage = 30;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      try {
        while (true) {
          const response = await axios.get('http://localhost:8000/api/booking_manager', {
            params: {
              per_page: perPage,
              page,
              checkin_date: format(startOfMonth, 'yyyy-MM-dd HH:mm:ss'),
              checkout_date: format(endOfMonth, 'yyyy-MM-dd HH:mm:ss'),
            },
          });
          const data = response.data;
          if (!Array.isArray(data)) {
            console.error('Expected data to be an array, received:', data);
            throw new Error('Invalid API response: data is not an array');
          }
          allBookings = [...allBookings, ...data.map(booking => ({
            ...booking,
            checkin_date: new Date(booking.checkin_date),
            checkout_date: new Date(booking.checkout_date),
          }))];
          if (data.length < perPage) break;
          page++;
        }
        console.log('Bookings:', allBookings);
        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentDate]);

  // Initialize Bootstrap tooltips and modal
  useEffect(() => {
    if (tableRef.current) {
      const tooltipTriggerList = tableRef.current.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new Tooltip(tooltipTriggerEl);
      });
    }
    if (modalRef.current && !modalInstanceRef.current) {
      modalInstanceRef.current = new Modal(modalRef.current, { backdrop: 'static' });
    }
    return () => {
      if (modalInstanceRef.current) {
        modalInstanceRef.current.dispose();
        modalInstanceRef.current = null;
      }
    };
  }, [bookings, rooms]);

  // Handle cell click to open edit modal
  const handleCellClick = (booking) => {
    if (booking) {
      setSelectedBooking(booking);
      setFormData({
        checkin_date: format(booking.checkin_date, 'yyyy-MM-dd'),
        checkout_date: format(booking.checkout_date, 'yyyy-MM-dd'),
      });
      if (modalInstanceRef.current) {
        modalInstanceRef.current.show();
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission to update booking
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Extract original time components
      const originalCheckin = new Date(selectedBooking.checkin_date);
      const originalCheckout = new Date(selectedBooking.checkout_date);
      
      // Parse new dates from formData
      const newCheckinDate = new Date(formData.checkin_date);
      const newCheckoutDate = new Date(formData.checkout_date);
      
      // Combine new dates with original times
      newCheckinDate.setHours(
        originalCheckin.getHours(),
        originalCheckin.getMinutes(),
        originalCheckin.getSeconds()
      );
      newCheckoutDate.setHours(
        originalCheckout.getHours(),
        originalCheckout.getMinutes(),
        originalCheckout.getSeconds()
      );

      const response = await axios.put(`http://localhost:8000/api/booking_manager/${selectedBooking.id}`, {
        checkin_date: format(newCheckinDate, 'yyyy-MM-dd HH:mm:ss'),
        checkout_date: format(newCheckoutDate, 'yyyy-MM-dd HH:mm:ss'),
      });
      setBookings(prev =>
        prev.map(b => (b.id === selectedBooking.id ? {
          ...b,
          ...response.data,
          checkin_date: new Date(response.data.checkin_date),
          checkout_date: new Date(response.data.checkout_date),
        } : b))
      );
      if (modalInstanceRef.current) {
        modalInstanceRef.current.hide();
      }
      setSelectedBooking(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous/next month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle hover to highlight column
  const handleMouseEnter = (column) => {
    if (column !== '0') {
      document.querySelectorAll(`[data-column="${column}"]`).forEach(el => {
        el.classList.add('highlight-column');
      });
    }
  };

  const handleMouseLeave = (column) => {
    if (column !== '0') {
      document.querySelectorAll(`[data-column="${column}"]`).forEach(el => {
        el.classList.remove('highlight-column');
      });
    }
  };

  // Check if a room is booked on a specific day and return booking info
  const isRoomBooked = (room, day) => {
    const targetDate = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const booking = bookings.find(booking => {
      if (booking.room_id !== room.id) return false;
      const checkin = startOfDay(booking.checkin_date);
      const checkout = startOfDay(booking.checkout_date);
      const isBooked = (isSameDay(targetDate, checkin) || isAfter(targetDate, checkin)) &&
                       (isSameDay(targetDate, checkout) || isBefore(targetDate, checkout));
      return isBooked;
    });
    console.log(`Room ${room.room_number}, Day ${day}, Booking:`, booking);
    return booking;
  };

  // Format booking info for tooltip
  const formatBookingInfo = (booking) => {
    if (!booking) return '';
    return `
      <div style="text-align: left;">
        <strong>Name:</strong> ${booking.name}<br>
        <strong>Phone:</strong> ${booking.phone}<br>
        <strong>Check-in:</strong> ${format(booking.checkin_date, 'yyyy-MM-dd HH:mm:ss')}<br>
        <strong>Check-out:</strong> ${format(booking.checkout_date, 'yyyy-MM-dd HH:mm:ss')}
      </div>
    `;
  };

  // Render calendar table
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="table-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <table ref={tableRef} className="table table-bordered table-sm w-100" style={{ tableLayout: 'fixed' }}>
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-center align-middle" style={{ width: '80px', fontSize: '0.8rem' }} data-column="0">
                    Room
                  </th>
                  {days.map(day => (
                    <th
                      key={day}
                      scope="col"
                      className="text-center align-middle"
                      style={{ width: `calc((100% - 80px) / ${days.length})`, fontSize: '0.8rem' }}
                      data-column={day}
                      onMouseEnter={() => handleMouseEnter(day.toString())}
                      onMouseLeave={() => handleMouseLeave(day.toString())}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.length > 0 ? (
                  rooms.map(room => (
                    <tr key={`room-${room.id}`}>
                      <td
                        className="text-center align-middle fw-bold"
                        style={{ width: '80px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        data-column="0"
                      >
                        {room.room_number}
                      </td>
                      {days.map(day => {
                        const booking = isRoomBooked(room, day);
                        return (
                          <td
                            key={`room-${room.id}-day-${day}`}
                            className={`text-center align-middle ${booking ? 'bg-danger text-white' : 'bg-white'}`}
                            style={{ height: '30px', fontSize: '0.7rem', cursor: booking ? 'pointer' : 'default' }}
                            data-column={day}
                            onMouseEnter={() => handleMouseEnter(day.toString())}
                            onMouseLeave={() => handleMouseLeave(day.toString())}
                            onClick={() => handleCellClick(booking)}
                            data-bs-toggle={booking ? 'tooltip' : ''}
                            data-bs-html="true"
                            data-bs-title={booking ? formatBookingInfo(booking) : ''}
                          >
                            {booking ? '' : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={days.length + 1} className="text-center">
                      No rooms available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Edit Booking Modal */}
            <div
              className="modal fade"
              id="editBookingModal"
              tabIndex="-1"
              aria-labelledby="editBookingModalLabel"
              aria-hidden="true"
              ref={modalRef}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="editBookingModalLabel">Edit Booking Dates</h5>
                    <button type="button" className="btn-close" onClick={() => modalInstanceRef.current.hide()} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {selectedBooking && (
                      <form onSubmit={handleUpdateBooking}>
                        <div className="mb-3">
                          <label htmlFor="checkin_date" className="form-label">Check-in Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="checkin_date"
                            name="checkin_date"
                            value={formData.checkin_date || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="checkout_date" className="form-label">Check-out Date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="checkout_date"
                            name="checkout_date"
                            value={formData.checkout_date || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Updating...' : 'Update Dates'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container my-4 booking-show">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={prevMonth} className="btn btn-primary btn-sm">Previous Month</button>
        <h1 className="h3 fw-bold">
          {format(currentDate, 'MMMM yyyy', { locale: enUS })}
        </h1>
        <button onClick={nextMonth} className="btn btn-primary btn-sm">Next Month</button>
      </div>
      {renderCalendar()}
    </div>
  );
};

export default ManageBookings;