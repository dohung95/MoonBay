import React, { useEffect, useState } from 'react';
import { Edit, Save, X, Plus, Trash2, Search, Loader2, Info, Users, DollarSign } from 'lucide-react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    price: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    fetch('/api/room_types')
      .then(res => res.json())
      .then(data => {
        const roomsWithImageUrl = data.map(room => {
          if (room.image && room.image_url) {
            room.image_url = room.image_url;
          } else {
            room.image_url = null;
          }
          return room;
        });
        setRooms(roomsWithImageUrl);
        setLoading(false);
      })
      .catch(err => {
        console.error("ERROR: ", err);
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

    const formData = new FormData();
    formData.append('name', String(editingRoom.name || ''));
    formData.append('capacity', String(editingRoom.capacity || '0'));
    formData.append('price', String(editingRoom.price || '0'));
    formData.append('description', String(editingRoom.description || ''));

    // Thêm ảnh mới nếu có
    if (editingRoom.image) {
      formData.append('image', editingRoom.image);
  }

    setLoading(true);

    formData.append('_method', 'PUT');
    fetch(`/api/room_types/${editingRoom.id}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP ERROR! status: ${response.status}, response: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Response from server:", data);
        setEditingRoom(null);
        fetchRooms();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error.message);
        setLoading(false);
      });
  };

  const handleAddRoom = () => {
    const formData = new FormData();
    formData.append('name', newRoom.name);
    formData.append('capacity', newRoom.capacity);
    formData.append('price', newRoom.price);
    formData.append('description', newRoom.description);

    if (newRoom.image) {
      formData.append('image', newRoom.image);
  }
  
    setLoading(true);
    fetch('/api/room_types', {
      method: 'POST',
      body: formData,
    })
      .then(() => {
        setShowAddForm(false);
        setNewRoom({ name: '', capacity: '', price: '', description: '', image: null });
        fetchRooms();
        setLoading(false);
      })
      .catch((error) => {
        console.error("ERROR when adding room:", error);
        setLoading(false);
      });
  };

  const toggleRoomDetails = (roomId) => {
    if (expandedRoom === roomId) setExpandedRoom(null);
    else setExpandedRoom(roomId);
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

  const handleDelete = (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room type?")) return;

    setLoading(true);
    fetch(`/api/room_types/${roomId}`, {
      method: 'DELETE',
    })
      .then(() => {
        fetchRooms();
      })
      .catch((error) => {
        console.error("ERROR when deleting room:", error);
        setLoading(false);
      });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditingRoom({ ...editingRoom, image: file });
};




  return (
    <div className="container mt-4">
      <div className="bg-primary text-white p-4 rounded-top">
        <h2 className="h4 mb-1">Room Type Management</h2>
        <p className="mb-0">Add, edit and manage room types in your hotel</p>
      </div>

      <div className="border p-4 rounded-bottom bg-white">
        <div className="row mb-4">
          <div className="col-md-6 mb-2">
            <div className="row">
              <div className='col-md-10'>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search room type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='col-md-2' style={{ marginLeft: '-20px' }}>
                <span className="form-control" align="center">
                  <Search size={16} />
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} className="me-2" /> Add Room Type
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="card card-body mb-4">
            <h5>Add New Room Type</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Room Name</label>
                <input type="text" className="form-control" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-control" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Price (x1000 VND)</label>
                <input type="number" className="form-control" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Image</label>
                <input type="file" className="form-control" onChange={(e) => setNewRoom({ ...newRoom, image: e.target.files[0] })} />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button className="btn btn-success" onClick={handleAddRoom}>
                <Save size={18} className="me-2" /> Save
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                <X size={18} className="me-2" /> Cancel
              </button>
            </div>
          </div>
        )}

        {loading && rooms.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" />
            <p>Loading data...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="alert alert-info text-center">
            <Info size={24} className="me-2" />
            {searchTerm ? "No matching room type found." : "No room types available."}
          </div>
        ) : (
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
                        <Users size={14} className="me-1" /> {room.capacity} people   |
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
                            <label className="form-label">Room Name</label>
                            <input name="name" className="form-control" value={editingRoom.name} onChange={handleInputChange} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Capacity</label>
                            <input type="number" name="capacity" className="form-control" value={editingRoom.capacity} onChange={handleInputChange} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Price</label>
                            <input type="number" name="price" className="form-control" value={editingRoom.price} onChange={handleInputChange} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-control" value={editingRoom.description} onChange={handleInputChange} />
                          </div>
                          <div>
                            <label className="form-label">Image</label>
                            <input type="file" name="image" className="form-control" onChange={handleImageChange} />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-success" onClick={handleSave}>
                            <Save size={18} className="me-2" /> Save
                          </button>
                          <button className="btn btn-secondary" onClick={() => setEditingRoom(null)}>
                            <X size={18} className="me-2" /> Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{room.description}</p>
                        {room.image_url && (
                          <img src={room.image_url} alt={room.name} className="img-fluid mb-2" style={{ maxWidth: '50%' }} />
                        )}
                        <div className="d-flex gap-2">
                          <button className="btn btn-warning" onClick={() => handleEdit(room)}>
                            <Edit size={18} /> Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(room.id)}>
                            <Trash2 size={18} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
