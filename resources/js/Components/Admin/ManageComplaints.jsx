import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css'; 
import { ToastContainer, toast } from 'react-toastify';

const statusPriority = {
    'pending': 1,
    'resolved': 2,
    'rejected': 3,
};

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editedComplaints, setEditedComplaints] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (pageNumber) => {
        setLoading(true);
        try {
            const [complaintsRes, staffRes] = await Promise.all([
                axios.get(`/api/admin/complaints?page=${pageNumber}`),
                axios.get('/api/admin/employees')
            ]);
            
            const sorted = complaintsRes.data.data.sort((a, b) => {
                if (statusPriority[a.status] !== statusPriority[b.status]) {
                    return statusPriority[a.status] - statusPriority[b.status];
                }
                return new Date(a.created_at) - new Date(b.created_at);
            });

            setComplaints(sorted);
            setStaffList(staffRes.data);
            setTotalPages(complaintsRes.data.last_page); // paginate Laravel
            setTotal(complaintsRes.data.total); 
            setLoading(false);
            setEditedComplaints({});
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
            setLoading(false);
        }
    };

    // Hàm tạo mảng số trang có dấu ...
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - delta && i <= page + delta)
            ) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    };

    const handleChangeLocal = (id, field, value) => {
        setEditedComplaints(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            }
        }));
    };

    const handleSave = async (id) => {
        if (!window.confirm('Bạn có chắc muốn lưu thay đổi?')) return;

        try {
            const updatedData = editedComplaints[id];
            if (!updatedData) return;

            await axios.put(`/api/admin/complaints/${id}`, updatedData);
            toast.success('Lưu thay đổi thành công!');

            // Cập nhật complaint đã lưu vào danh sách
            const updatedComplaints = complaints.map(c => {
                if (c.id === id) {
                    return { ...c, ...updatedData };
                }
                return c;
            });

            const sorted = [...updatedComplaints].sort((a, b) => {
                const aPriority = statusPriority[a.status] || 99;
                const bPriority = statusPriority[b.status] || 99;
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }
                return new Date(a.created_at) - new Date(b.created_at);
            });
            setComplaints(sorted);

            setEditedComplaints(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });

        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            toast.error('Lưu thay đổi thất bại!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa khiếu nại này không?')) return;

        try {
            await axios.delete(`/api/admin/complaints/${id}`);
            toast.success('Xóa khiếu nại thành công!');
            fetchData(currentPage);
        } catch (err) {
            console.error('Lỗi khi xóa:', err);
            toast.error('Xóa khiếu nại thất bại!');
        }
    };

    // Xử lý chuyển trang phân trang
    const goToPage = (page) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    };

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-white shadow rounded-xl">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4 pt-4" Align="center">Quản lý Khiếu nại</h2>
            <table className="table table-hover table-striped">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border">ID</th>
                        <th className="px-4 py-2 border">UserID</th>
                        <th className="px-4 py-2 border">Tên</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Phone number</th>
                        <th className="px-4 py-2 border">Loại khiếu nại</th>
                        <th className="px-4 py-2 border">Mô tả</th>
                        <th className="px-4 py-2 border">Liên hệ lại khách</th>
                        <th className="px-4 py-2 border">Ngày tạo</th>
                        <th className="px-4 py-2 border">Trạng thái</th>
                        <th className="px-4 py-2 border">Người xử lý</th>
                        <th className="px-4 py-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {complaints.map(c => {
                        const edited = editedComplaints[c.id] || {};
                        const status = edited.status ?? c.status ?? 'pending';
                        const handler_name = edited.handler_name ?? c.handler_name ?? '';

                        return (
                            <tr key={c.id} className="text-center">
                                <td className="px-4 py-2 border">{c.id}</td>
                                <td className="px-4 py-2 border">{c.user_id}</td>
                                <td className="px-4 py-2 border">{c.name}</td>
                                <td className="px-4 py-2 border">{c.customer_email}</td>
                                <td className="px-4 py-2 border">{c.customer_phone}</td>
                                <td className="px-4 py-2 border">{c.complaint_type}</td>
                                <td className="px-4 py-2 border">{c.description}</td>
                                <td className="px-4 py-2 border">{c.contact_preference}</td>
                                <td className="px-4 py-2 border">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2 border">
                                    <select
                                        value={status}
                                        onChange={e => handleChangeLocal(c.id, 'status', e.target.value)}
                                        className="border p-1 rounded"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 border">
                                    <select
                                        value={handler_name}
                                        onChange={e => handleChangeLocal(c.id, 'handler_name', e.target.value)}
                                        className="border p-1 rounded"
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {staffList.map(staff => (
                                            <option key={staff.id} value={staff.name}>{staff.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2 border space-x-2">
                                    <button
                                        onClick={() => handleSave(c.id)}
                                        className="btn btn-primary"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="btn btn-danger"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="text-center mt-2">
                <p><strong>Tổng số khiếu nại: {total}</strong></p>
            </div>

            {/* Pagination controls */}
            <nav className="flex justify-center space-x-2 mt-2 pb-4" Align="center">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn btn-sm"
                >
                    Prev
                </button>

                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span key={i} className="px-2 select-none">...</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`btn btn-sm ${p === page ? 'btn-primary' : ''}`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="btn btn-sm"
                >
                    Next
                </button>
            </nav>
        </div>
    );
};

export default ManageComplaints;
