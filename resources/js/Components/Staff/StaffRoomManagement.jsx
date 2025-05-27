import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StaffRoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ room_number: '', type: '', description: '', price: '', status: '' });
  const [editingId, setEditingId] = useState(null);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Số phòng mỗi trang

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/rooms');
      setRooms(res.data);
    } catch (error) {
      alert('Failed to load room list!');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/rooms/${editingId}`, form);
      setEditingId(null);
      setForm({ room_number: '', type: '', description: '', price: '', status: '' });
      fetchRooms();
    } catch (error) {
      alert('Failed to update room!');
    }
  };

  const handleEdit = (room) => {
    setForm(room);
    setEditingId(room.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:8000/api/rooms/${id}`);
        fetchRooms();
      } catch (error) {
        alert('Unable to delete room!');
      }
    }
  };

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const paginatedRooms = rooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="staff-room-management">
      <h2 className="staff-room-title">Room Management</h2>
      <div className="staff-room-table-container">
        {editingId && (
          <form onSubmit={handleSubmit} className="staff-room-edit-form">
            <div className="staff-room-form-row">
              <input name="room_number" placeholder="Room Number" value={form.room_number} onChange={handleChange} required disabled />
              <input name="type" placeholder="Room Type" value={form.type} onChange={handleChange} required />
              <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required type="number" />
              <input name="status" placeholder="Status" value={form.status} onChange={handleChange} required />
            </div>
            <div className="staff-room-form-actions">
              <button type="submit" className="btn update">Update</button>
              <button type="button" className="btn cancel" onClick={() => { setEditingId(null); setForm({ room_number: '', type: '', description: '', price: '', status: '' }); }}>Cancel</button>
            </div>
          </form>
        )}
        <table className="staff-room-data-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.map(room => (
              <tr key={room.id}>
                <td>{room.room_number}</td>
                <td>{room.type}</td>
                <td>{room.description}</td>
                <td>{room.price}</td>
                <td>
                  <span className={`staff-room-badge staff-room-badge-${room.status.toLowerCase()}`}>{room.status}</span>
                </td>
                <td>
                  <button className="btn btn-history staff-room-btn-history" onClick={() => handleEdit(room)}>Edit</button>
                  <button className="btn btn-note staff-room-btn-note" onClick={() => handleDelete(room.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="staff-room-pagination">
            <button
              className="staff-room-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >&#60;</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                className={`staff-room-page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(idx + 1)}
              >{idx + 1}</button>
            ))}
            <button
              className="staff-room-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >&#62;</button>
          </div>
        )}
      </div>
      <style>{`
        .staff-room-title {
          text-align: center;
          color: #2b5876;
          margin-bottom: 32px;
          letter-spacing: 2px;
          font-size: 2rem;
          font-weight: 700;
        }
        .staff-room-edit-form {
          background: #f7fafd;
          border-radius: 8px;
          padding: 16px 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(43,88,118,0.07);
          animation: fadeIn 0.5s;
        }
        .staff-room-form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .staff-room-form-row input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #b2bec3;
          border-radius: 4px;
          font-size: 15px;
          transition: border 0.2s;
        }
        .staff-room-form-row input:focus {
          border: 1.5px solid #2b5876;
          outline: none;
        }
        .staff-room-form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn {
          padding: 7px 18px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .btn.update {
          background: linear-gradient(90deg, #2b5876 0%, #4e4376 100%);
          color: #fff;
        }
        .btn.cancel {
          background: #b2bec3;
          color: #fff;
        }
        .staff-room-btn-history {
          background: #00b894;
          color: #fff;
          margin-right: 6px;
        }
        .staff-room-btn-note {
          background: #d63031;
          color: #fff;
        }
        .btn:hover {
          box-shadow: 0 2px 8px rgba(43,88,118,0.13);
          opacity: 0.92;
        }
        .staff-room-table-container {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 24px 18px 18px 18px;
          margin-bottom: 32px;
        }
        .staff-room-data-table {
          width: 100%;
          border-collapse: collapse;
          background: #f8fafc;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .staff-room-data-table th, .staff-room-data-table td {
          padding: 12px 14px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          font-size: 1rem;
        }
        .staff-room-data-table th {
          background: #e9f1fa;
          color: #2d3a4a;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: none;
          font-size: 1rem;
        }
        .staff-room-data-table tr:last-child td {
          border-bottom: none;
        }
        .staff-room-data-table td {
          color: #22223b;
          font-size: 1rem;
        }
        .staff-room-data-table tbody tr:hover {
          background: #e3f2fd;
          transition: background 0.18s;
        }
        .staff-room-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.98rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.5px;
        }
        .staff-room-badge-available { background: #00b894; }
        .staff-room-badge-occupied { background: #fdcb6e; color: #222; }
        .staff-room-badge-maintenance { background: #d63031; }
        .staff-room-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 22px 0 0 0;
          gap: 6px;
        }
        .staff-room-page-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 1rem;
          color: #374151;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          box-shadow: 0 1px 4px #1976d233;
          font-weight: 600;
        }
        .staff-room-page-btn.active, .staff-room-page-btn:hover {
          background: #0077ff;
          color: #fff;
        }
        .staff-room-page-btn:disabled {
          background: #e5e7eb;
          color: #bdbdbd;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .staff-room-table-container {
            padding: 12px 2px 12px 2px;
          }
          .staff-room-data-table th, .staff-room-data-table td {
            padding: 7px 4px;
            font-size: 0.95rem;
          }
        }
        @media (max-width: 600px) {
          .staff-room-table-container {
            padding: 6px 2px 12px 2px;
          }
          .staff-room-data-table th, .staff-room-data-table td {
            padding: 5px 2px;
            font-size: 0.92rem;
          }
          .staff-room-page-btn {
            padding: 6px 10px;
            font-size: 0.95rem;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}

export default StaffRoomManagement;