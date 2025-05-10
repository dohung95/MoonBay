
import React, { useEffect, useState } from 'react';
import { Edit, Save, X, Plus, Trash2, Search, Loader2, Info, Users, DollarSign } from 'lucide-react';

const TinhNang6 = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    fetch('/api/room_types')
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi load danh sách phòng:", err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setEditingRoom({ ...editingRoom, [e.target.name]: e.target.value });
  };

  const handleEdit = (room) => {
    setEditingRoom({ ...room });
    setExpandedRoom(room.id);
  };

  const handleSave = () => {
    if (!editingRoom) return;

    setLoading(true);
    fetch(`/api/room_types/${editingRoom.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editingRoom.name,
        capacity: editingRoom.capacity,
        price: editingRoom.price,
        description: editingRoom.description,
      }),
    })
      .then(() => {
        setEditingRoom(null);
        fetchRooms();
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật:", error);
        setLoading(false);
      });
  };

  const toggleRoomDetails = (roomId) => {
    if (expandedRoom === roomId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(roomId);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && rooms.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="bg-primary text-white p-4 rounded-top">
        <h2 className="h4 mb-1">Quản lý loại phòng</h2>
        <p className="mb-0">Thêm, chỉnh sửa và quản lý các loại phòng tại khách sạn của bạn</p>
      </div>

      <div className="border p-4 rounded-bottom bg-white">
        <div className="row mb-4">
          <div className="col-md-6 mb-2">
            <div className="row">
              <div className='col-md-10' >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm loại phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              </div>
              <div className='col-md-2' style={{marginLeft: '-20px'}}>
              <span className="form-control" align="center">
                <Search size={16}/>
              </span>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <button className="btn btn-primary">
              <Plus size={16} className="me-2" /> Thêm loại phòng
            </button>
          </div>
        </div>

        {filteredRooms.length === 0 && (
          <div className="alert alert-info text-center">
            <Info size={24} className="me-2" />
            {searchTerm ? "Không tìm thấy loại phòng phù hợp." : "Chưa có loại phòng nào."}
          </div>
        )}

        <div className="accordion" id="roomAccordion">
          {filteredRooms.map((room) => (
            <div className="accordion-item mb-3" key={room.id}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${expandedRoom === room.id ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => editingRoom?.id !== room.id && toggleRoomDetails(room.id)}
                >
                  <div className="flex-grow-1">
                    <strong>{room.name}</strong>
                    <div className="text-muted small mt-1">
                      <Users size={14} className="me-1" /> {room.capacity} người &nbsp; | &nbsp;
                      <DollarSign size={14} className="me-1 text-success" /> {formatCurrency(room.price * 1000)}
                    </div>
                  </div>
                </button>
              </h2>
              <div className={`accordion-collapse collapse ${expandedRoom === room.id ? 'show' : ''}`}>
                <div className="accordion-body">
                  {editingRoom?.id === room.id ? (
                    <>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Tên phòng</label>
                          <input name="name" className="form-control" value={editingRoom.name} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Sức chứa</label>
                          <input type="number" name="capacity" className="form-control" value={editingRoom.capacity} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Giá phòng (VNĐ)</label>
                          <input type="number" name="price" className="form-control" value={editingRoom.price} onChange={handleInputChange} />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Mô tả</label>
                          <textarea name="description" className="form-control" rows={4} value={editingRoom.description || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="mt-4 d-flex gap-2">
                        <button
                          className="btn btn-success d-flex align-items-center"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? <Loader2 size={18} className="me-2 spinner-border spinner-border-sm" /> : <Save size={18} className="me-2" />}
                          Lưu thay đổi
                        </button>
                        <button className="btn btn-secondary d-flex align-items-center" onClick={() => setEditingRoom(null)}>
                          <X size={18} className="me-2" /> Hủy bỏ
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-2"><strong>Mô tả:</strong> {room.description || 'Chưa có mô tả.'}</p>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary d-flex align-items-center" onClick={() => handleEdit(room)}>
                          <Edit size={18} className="me-2" /> Sửa
                        </button>
                        <button className="btn btn-outline-danger d-flex align-items-center">
                          <Trash2 size={18} className="me-2" /> Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TinhNang6;
