import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TinhNang6 = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    axios.get('/api/room_types')
      .then(res => setRooms(res.data))
      .catch(err => console.error("Lỗi khi load danh sách phòng:", err));
  };

  const handleInputChange = (e) => {
    setEditingRoom({ ...editingRoom, [e.target.name]: e.target.value });
  };

  const handleEdit = (room) => {
    setEditingRoom({ ...room });
  };

  const handleSave = () => {
    if (!editingRoom) {
      console.error("Không có phòng nào đang được chỉnh sửa.");
      return;
    }

    console.log("Đã bấm nút Lưu", editingRoom);

    axios.put(`/api/room_types/${editingRoom.id}`, {
      name: editingRoom.name,
      capacity: editingRoom.capacity,
      price: editingRoom.price,
      description: editingRoom.description,
    })
      .then(() => {
        console.log("Cập nhật thành công");
        setEditingRoom(null);
        fetchRooms(); // reload danh sách sau khi cập nhật
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật:", error);
      });
  };

  return (
    <div className="p-6">
    <div className="max-w-5xl mx-auto border border-gray-300 rounded-lg shadow-lg p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Chỉnh sửa thông tin phòng</h2>
      {rooms.map((room) => (
        <div key={room.id} className="border p-4 mb-4 rounded bg-gray-50 shadow-sm">
          {editingRoom?.id === room.id ? (
            <>
              <input className="form-control mb-2" name="name" value={editingRoom.name} onChange={handleInputChange} />
              <input className="form-control mb-2" name="capacity" value={editingRoom.capacity} onChange={handleInputChange} type="number" />
              <input className="form-control mb-2" name="price" value={editingRoom.price} onChange={handleInputChange} type="number" />
              <textarea className="form-control mb-2" name="description" value={editingRoom.description} onChange={handleInputChange} />
              <button type="button" className="btn btn-success me-2" onClick={handleSave}>Lưu</button>
              <button className="btn btn-secondary" onClick={() => setEditingRoom(null)}>Hủy</button>
            </>
          ) : (
            <>
              <h5 className="text-lg font-semibold">{room.name}</h5>
              <p>Sức chứa: {room.capacity}</p>
              <p>Giá: {(room.price * 1000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
              <p>{room.description}</p>
              <button className="btn btn-primary" onClick={() => handleEdit(room)}>CHỈNH SỬA</button>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
  );
};

export default TinhNang6;
