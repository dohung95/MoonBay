import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/booking_manager');
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load booking data.');
        setBookings([]);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  const formatCurrency = (value) => {
    const number = Number(value);
    return isNaN(number)
      ? '₫0'
      : number.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
  };

  // Pagination logic
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center text-primary">Booking List</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover table-bordered table-striped">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Room Type</th>
              <th>Rooms</th>
              <th>Children</th>
              <th>Members</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Price</th>
              <th>Total Price</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.user_id}</td>
                  <td>{booking.name}</td>
                  <td>{booking.room_type}</td>
                  <td className="text-center">{booking.number_of_rooms}</td>
                  <td className="text-center">{booking.children}</td>
                  <td className="text-center">{booking.member}</td>
                  <td>{formatDate(booking.checkin_date)}</td>
                  <td>{formatDate(booking.checkout_date)}</td>
                  <td className="text-end">{formatCurrency(booking.price)}</td>
                  <td className="text-end fw-bold text-primary">{formatCurrency(booking.total_price)}</td>
                  <td>{formatDate(booking.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-center text-muted">No bookings available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Prev</button>
            </li>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(page)}>{page}</button>
                </li>
              );
            })}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ManageBookings;
