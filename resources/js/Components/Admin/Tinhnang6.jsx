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
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-blue-50 to-white rounded-xl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto mt-8 container">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
        <h2 className="text-2xl font-bold mb-2">Quản lý loại phòng</h2>
        <p className="text-blue-100">Thêm, chỉnh sửa và quản lý các loại phòng tại khách sạn của bạn</p>
      </div>
      
      <div className="bg-white p-6 rounded-b-2xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm loại phòng..." 
              className="pl-10 pr-4 py-2 w-full border-0 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg group">
            <Plus size={18} className="mr-2 group-hover:scale-110 transition-transform" /> Thêm loại phòng
          </button>
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Info size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">Không tìm thấy loại phòng nào</p>
            <p className="text-gray-400 mt-1">{searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Hãy thêm loại phòng mới"}</p>
          </div>
        )}

        <div className="space-y-5">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl overflow-hidden transition-all duration-200 border border-gray-200 hover:border-blue-200 hover:shadow-lg"
            >
              <div 
                className={`px-6 py-5 flex flex-wrap md:flex-nowrap justify-between items-center cursor-pointer transition-all
                  ${expandedRoom === room.id ? 'bg-blue-50 border-b border-blue-100' : ''}`}
                onClick={() => editingRoom?.id !== room.id && toggleRoomDetails(room.id)}
              >
                <div className="flex-grow">
                  <h3 className="font-bold text-xl text-gray-800">{room.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      <span> {room.capacity} người</span>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign size={16} className="mr-1" />
                      <span>{formatCurrency(room.price*1000)}</span>
                    </div>
                  </div>
                </div>

                {editingRoom?.id !== room.id && (
                  <div className="flex items-center space-x-2 mt-3 md:mt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(room);
                      }}
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-all flex items-center"
                    >
                      <Edit size={18} className="mr-1" />
                      <span className="hidden md:inline">Sửa</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete logic here
                      }}
                      className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-all flex items-center"
                    >
                      <Trash2 size={18} className="mr-1" />
                      <span className="hidden md:inline">Xóa</span>
                    </button>
                  </div>
                )}
              </div>

              {expandedRoom === room.id && !editingRoom && (
                <div className="px-6 py-4 bg-blue-50">
                  <div className="flex items-start">
                    <Info size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <div className="bg-white p-4 rounded-lg border border-blue-100 w-full">
                      <h4 className="font-medium text-gray-700 mb-2">Thông tin chi tiết</h4>
                      <p className="text-gray-600">{room.description || "Chưa có mô tả cho loại phòng này."}</p>
                    </div>
                  </div>
                </div>
              )}

              {editingRoom?.id === room.id && (
                <div className="p-6 bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-4 pb-2 border-b border-blue-100">Chỉnh sửa thông tin</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                      <input
                        className="w-full px-4 py-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        name="name"
                        value={editingRoom.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                      <input
                        className="w-full px-4 py-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        type="number"
                        name="capacity"
                        value={editingRoom.capacity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá phòng (VNĐ)</label>
                      <input
                        className="w-full px-4 py-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        type="number"
                        name="price"
                        value={editingRoom.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        className="w-full px-4 py-3 border-0 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        name="description"
                        value={editingRoom.description || ''}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap md:flex-nowrap gap-3 mt-6 border-t border-blue-100 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-grow md:flex-grow-0 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-md"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={18} className="mr-2 animate-spin" />
                      ) : (
                        <Save size={18} className="mr-2" />
                      )}
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setEditingRoom(null)}
                      className="flex-grow md:flex-grow-0 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center"
                    >
                      <X size={18} className="mr-2" /> Hủy bỏ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TinhNang6;