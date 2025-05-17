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
    <div className="room-management-container">
      <h2>Room Management</h2>
      {editingId && (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <input name="room_number" placeholder="Room Number" value={form.room_number} onChange={handleChange} required disabled />
            <input name="type" placeholder="Room Type" value={form.type} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required type="number" />
            <input name="status" placeholder="Status" value={form.status} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn update">Update</button>
            <button type="button" className="btn cancel" onClick={() => { setEditingId(null); setForm({ room_number: '', type: '', description: '', price: '', status: '' }); }}>Cancel</button>
          </div>
        </form>
      )}
      <table className="wow-table">
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
                <span className={`status-badge status-${room.status.toLowerCase()}`}>{room.status}</span>
              </td>
              <td>
                <button className="btn edit" onClick={() => handleEdit(room)}>Edit</button>
                <button className="btn delete" onClick={() => handleDelete(room.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >&#60;</button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`page-btn${currentPage === idx + 1 ? ' active' : ''}`}
              onClick={() => handlePageChange(idx + 1)}
            >{idx + 1}</button>
          ))}
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >&#62;</button>
        </div>
      )}
      <style>{`
        .room-management-container {
          max-width: 1000px;
          margin: 40px auto;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          padding: 32px 24px;
        }
        h2 {
          text-align: center;
          color: #2b5876;
          margin-bottom: 32px;
          letter-spacing: 2px;
        }
        .edit-form {
          background: #f7fafd;
          border-radius: 8px;
          padding: 16px 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(43,88,118,0.07);
          animation: fadeIn 0.5s;
        }
        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .form-row input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #b2bec3;
          border-radius: 4px;
          font-size: 15px;
          transition: border 0.2s;
        }
        .form-row input:focus {
          border: 1.5px solid #2b5876;
          outline: none;
        }
        .form-actions {
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
        .btn.edit {
          background: #00b894;
          color: #fff;
          margin-right: 6px;
        }
        .btn.delete {
          background: #d63031;
          color: #fff;
        }
        .btn:hover {
          box-shadow: 0 2px 8px rgba(43,88,118,0.13);
          opacity: 0.92;
        }
        .wow-table {
          width: 100%;
          border-collapse: collapse;
          background: #f7fafd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(43,88,118,0.07);
        }
        .wow-table th, .wow-table td {
          padding: 12px 10px;
          text-align: center;
        }
        .wow-table th {
          background: linear-gradient(90deg, #2b5876 0%, #4e4376 100%);
          color: #fff;
          font-size: 16px;
          letter-spacing: 1px;
        }
        .wow-table tr {
          transition: background 0.2s;
        }
        .wow-table tbody tr:hover {
          background: #e3f0ff;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }
        .status-available { background: #00b894; }
        .status-occupied { background: #fdcb6e; color: #222; }
        .status-maintenance { background: #d63031; }
        /* Pagination styles */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 24px;
          gap: 6px;
        }
        .page-btn {
          background: #f7fafd;
          border: 1.5px solid #2b5876;
          color: #2b5876;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .page-btn.active, .page-btn:hover {
          background: #2b5876;
          color: #fff;
        }
        .page-btn:disabled {
          background: #e0e0e0;
          color: #b2bec3;
          cursor: not-allowed;
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