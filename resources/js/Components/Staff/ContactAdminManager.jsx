import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../css/css_of_staff/ContactAdminManager.css";

const STATUS_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
    { value: 'responded', label: 'Responded' },
    { value: 'archived', label: 'Archived' },
    { value: 'pending', label: 'Pending' },
    { value: 'spam', label: 'Spam' },
];

const PAGE_SIZE = 10;

function ContactAdminManager() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortDir, setSortDir] = useState("desc");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line
    }, [search, status, page, sortBy, sortDir]);

    const fetchMessages = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/contact-messages", {
                params: {
                    search,
                    status,
                    page,
                    per_page: PAGE_SIZE,
                    sort_by: sortBy,
                    sort_dir: sortDir,
                },
            });
            setMessages(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            setError("Failed to load contact messages.");
        }
        setLoading(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/api/contact-messages/${id}`, {
                status: newStatus,
            });
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === id ? { ...msg, status: newStatus } : msg
                )
            );
        } catch {
            alert("Failed to update status.");
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDir("asc");
        }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="contact-admin-container">
            <h2 className="contact-admin-title">Contact Management</h2>
            <p className="contact-admin-description">Xem, lọc và xử lý các tin nhắn liên hệ từ khách hàng gửi về hệ thống.</p>
            <div className="contact-admin-search-filter-row">
                <div className="contact-admin-filter-container">
                    <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                </div>
                <div className="contact-admin-search-container">
                <input
                    type="text"
                    placeholder="Search by name, email, or message..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                </div>
            </div>
            {/* Table và loading/error tách riêng, không nằm trong row-action-contact hay div nào flex */}
            {loading ? (
                <div className="contact-admin-loading">Loading...</div>
            ) : error ? (
                <div className="contact-admin-error">{error}</div>
            ) : (
                <div className="contact-admin-table-container">
                    <table className="contact-admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("name")}>
                                Name{" "}
                                {sortBy === "name" &&
                                    (sortDir === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("email")}>
                                Email{" "}
                                {sortBy === "email" &&
                                    (sortDir === "asc" ? "▲" : "▼")}
                            </th>
                            <th>Message</th>
                            <th onClick={() => handleSort("status")}>
                                Status{" "}
                                {sortBy === "status" &&
                                    (sortDir === "asc" ? "▲" : "▼")}
                            </th>
                            <th onClick={() => handleSort("created_at")}>
                                Date{" "}
                                {sortBy === "created_at" &&
                                    (sortDir === "asc" ? "▲" : "▼")}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No messages found.
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    className={`contact-admin-row contact-admin-status-${msg.status}`}
                                >
                                    <td>{msg.name}</td>
                                    <td>{msg.email}</td>
                                    <td className="contact-admin-message-cell">
                                        {msg.message}
                                    </td>
                                    <td>
                                        <span
                                            className={`contact-admin-badge contact-admin-badge-${msg.status}`}
                                        >
                                            {msg.status}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(
                                            msg.created_at
                                        ).toLocaleString()}
                                    </td>
                                    <td className="contact-admin-action">
                                        <button
                                            className="btn contact-admin-view-btn"
                                            onClick={() => {
                                                setSelectedMessage(msg);
                                                setModalOpen(true);
                                            }}
                                        >
                                            View
                                        </button>
                                        <select className="contact-admin-status-select"
                                            value={msg.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    msg.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {STATUS_OPTIONS.filter(
                                                (opt) => opt.value
                                            ).map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            )}
            {/* Modal for viewing message details */}
            {modalOpen && selectedMessage && (
                <div
                    className="contact-admin-modal-overlay"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="contact-admin-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="contact-admin-modal-close"
                            onClick={() => setModalOpen(false)}
                        >
                            ×
                        </button>
                        <h3>Contact Message Details</h3>
                        <div className="contact-admin-modal-content">
                            <div>
                                <strong>Name:</strong> {selectedMessage.name}
                            </div>
                            <div>
                                <strong>Email:</strong> {selectedMessage.email}
                            </div>
                            {selectedMessage.subject && (
                                <div>
                                    <strong>Subject:</strong>{" "}
                                    {selectedMessage.subject}
                                </div>
                            )}
                            <div>
                                <strong>Status:</strong>{" "}
                                {selectedMessage.status}
                            </div>
                            <div>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                    selectedMessage.created_at
                                ).toLocaleString()}
                            </div>
                            <div style={{ marginTop: "1em" }}>
                                <strong>Message:</strong>
                            </div>
                            <div className="contact-admin-modal-message">
                                {selectedMessage.message}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="contact-admin-pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    Prev
                </button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ContactAdminManager;
