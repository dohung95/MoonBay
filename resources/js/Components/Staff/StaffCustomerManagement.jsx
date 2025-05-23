import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../../css/css_of_staff/StaffCustomerManagement.css';
import { useSearch } from './SearchContext';

const StaffCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isStayHistoryModalOpen, setIsStayHistoryModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [stayHistory, setStayHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [noteList, setNoteList] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newType, setNewType] = useState('regular');
  const { searchQuery } = useSearch();

  const itemsPerPage = 7;

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (!token) {
                    throw new Error('Không tìm thấy token xác thực');
                }

        const response = await axios.get('/api/staff_customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const customerData = response.data.filter(user => user.role === 'user');
        setCustomers(customerData);
        setFilteredCustomers(customerData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCustomers(filtered);
      setCurrentPage(1);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch customer stay history
  const fetchCustomerHistory = async (customerId) => {
    setHistoryLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await axios.get(`/api/staff_customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.stay_history) {
        setStayHistory(response.data.stay_history);
      } else {
        setStayHistory([]);
      }
    } catch (error) {
      setStayHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch all notes for customer
  const fetchCustomerNotes = async (customerId) => {
    try {
      const token = Cookies.get('auth_token');      
      const res = await axios.get(`/api/customer-notes/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNoteList(res.data.notes || []);
    } catch {
      setNoteList([]);
    }
  };

  // Mở modal Stay History
  const handleOpenStayHistory = (customer) => {
    setSelectedCustomer(customer);
    setIsStayHistoryModalOpen(true);
    fetchCustomerHistory(customer.id);
  };

  // Mở modal Note
  // Thêm state mới để lưu trữ Type hiện tại của khách hàng
  const [currentType, setCurrentType] = useState('regular');

  const handleOpenNote = (customer) => {
    setSelectedCustomer(customer);
    setCurrentType(customer.customer_type || 'regular'); // Lấy Type hiện tại
    setNewType(customer.customer_type || 'regular'); // Đặt giá trị mặc định cho newType
    fetchCustomerNotes(customer.id);
    setIsNoteModalOpen(true); // Sửa từ setNoteModalOpen thành setIsNoteModalOpen
  };

  // Đóng modal Stay History
  const closeStayHistoryModal = () => {
    setIsStayHistoryModalOpen(false);
    setSelectedCustomer(null);
    setStayHistory([]);
  };

  // Đóng modal Note
  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setSelectedCustomer(null);
    setNoteList([]);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading data...</div>;
  }

  return (
    <div className="customer-management-container">
      <h2>Customer Management</h2>
      <div className="customer-search">
        <input
          type="text"
          placeholder="Search by name, email or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${customer.customer_type || 'regular'}`}>
                    {customer.customer_type === 'vip' ? 'VIP' :
                      customer.customer_type === 'special' ? 'Special' :
                        'Regular'}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn btn-view" title="Accommodation history" onClick={() => handleOpenStayHistory(customer)}>
                    <i className="fas fa-history"></i>
                  </button>
                  <button className="btn btn-edit" title="Customer notes" onClick={() => handleOpenNote(customer)}>
                    <i className="fas fa-sticky-note"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No customers found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Stay History Modal */}
      {isStayHistoryModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={closeStayHistoryModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Stay History</h3>
              <button className="close-button" onClick={closeStayHistoryModal}>&times;</button>
            </div>
            <div className="customer-details">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedCustomer.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedCustomer.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedCustomer.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  <span className={`status-badge status-${selectedCustomer.customer_type || 'regular'}`}>
                    {selectedCustomer.customer_type === 'vip' ? 'VIP' :
                      selectedCustomer.customer_type === 'special' ? 'Special' : 'Regular'}
                  </span>
                </span>
              </div>
            </div>
            <div className="stay-history">
              <h4>Lịch sử lưu trú</h4>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : Array.isArray(stayHistory) && stayHistory.length > 0 ? (
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Room Type</th>
                      <th>Check-in Date</th>
                      <th>Check-out Date</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stayHistory.map(stay => (
                      <tr key={stay.id}>
                        <td>{stay.id}</td>
                        <td>{stay.room_type}</td>
                        <td>{new Date(stay.check_in).toLocaleDateString('en-GB')}</td>
                        <td>{new Date(stay.check_out).toLocaleDateString('en-GB')}</td>
                        <td>{stay.total_price?.toLocaleString('en-GB')} VND</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>This customer has no stay history.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={closeNoteModal}>
          <div className="modal-content note-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3> Note Timeline</h3>
              <button className="close-button" onClick={closeNoteModal}>&times;</button>
            </div>
            <div className="customer-details">
              <div className="detail-item"><span className="detail-label">ID:</span> <span className="detail-value">{selectedCustomer.id}</span></div>
              <div className="detail-item"><span className="detail-label">Name:</span> <span className="detail-value">{selectedCustomer.name}</span></div>
              <div className="detail-item"><span className="detail-label">Email:</span> <span className="detail-value">{selectedCustomer.email}</span></div>
              <div className="detail-item"><span className="detail-label">Phone:</span> <span className="detail-value">{selectedCustomer.phone || 'N/A'}</span></div>
            </div>
            {/* Note History */}
            <div className="notes-history-section">
              <h4>Note History</h4>
              {Array.isArray(noteList) && noteList.length === 0 ? (
                <div className="text-muted">No notes available.</div>
              ) : (
                <ul className="note-timeline wow-timeline">
                  {Array.isArray(noteList) && noteList.map((note, idx) => (
                    <li key={note.id} className={`note-item wow-note ${idx === 0 ? 'newest' : ''}`}> 
                      <div className="note-header">
                        <span className={`status-badge status-${note.customer_type}`}>{note.customer_type === 'vip' ? '🌟 VIP' : note.customer_type === 'special' ? '💎 Special' : '👤 Regular'}</span>
                        <span className="note-staff"> {note.staff_name}</span>
                        <span className="note-date"> {new Date(note.created_at).toLocaleString('en-US')}</span>
                      </div>
                      <div className="note-content">{note.note ? note.note : <span className="text-muted">(No content)</span>}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Add New Note */}
            <div className="add-note-section">
              <h4>Add New Note</h4>
              <div className="current-type-info">
                <span className="detail-label">Current Type: </span>
                <span className={`status-badge status-${currentType}`}>
                  {currentType === 'vip' ? '🌟 VIP' : currentType === 'special' ? '💎 Special' : '👤 Regular'}
                </span>
              </div>
              <textarea
                className="notes-input"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Enter new note (allergies, special requests, etc.)"
              ></textarea>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="form-select mb-2"
              >
                <option value="regular">👤 Regular</option>
                <option value="vip">🌟 VIP</option>
                <option value="special">💎 Special</option>
              </select>
              <button
                className="save-button"
                onClick={async () => {
                  try {
                    const token = Cookies.get('auth_token');
                    await axios.post('/api/customer-notes', {
                      user_id: selectedCustomer.id,
                      note: newNote,
                      customer_type: newType
                    }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setNewNote('');
                    setNewType('regular');
                    fetchCustomerNotes(selectedCustomer.id);
                    
                    // Cập nhật danh sách khách hàng
                    setCustomers(prevCustomers => {
                      return prevCustomers.map(customer => {
                        if (customer.id === selectedCustomer.id) {
                          return { ...customer, customer_type: newType };
                        }
                        return customer;
                      });
                    });
                    
                    setTimeout(() => {
                      const el = document.querySelector('.wow-timeline .wow-note.newest');
                      if (el) el.classList.add('highlight-new');
                    }, 300);
                    alert('Note added successfully!');
                  } catch {
                    alert('Error adding note.');
                  }
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCustomerManagement;
