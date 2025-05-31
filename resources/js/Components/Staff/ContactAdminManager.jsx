import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../css/css_of_staff/ContactAdminManager.css";

const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "responded", label: "Responded" },
    { value: "spam", label: "Spam" },
];

const PAGE_SIZE = 5;

function ContactAdminManager() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true); // Bắt đầu với loading = true
    const [error, setError] = useState(""); // Local search state - không dùng SearchContext
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortDir, setSortDir] = useState("desc");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line
    }, [debouncedSearchQuery, status, page, sortBy, sortDir]); // Debounce search query to improve performance
    useEffect(() => {
        if (localSearchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
        }

        const timer = setTimeout(() => {
            setDebouncedSearchQuery(localSearchQuery);
            setIsSearching(false);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [localSearchQuery]);
    const fetchMessages = async () => {
        // Chỉ hiển thị loading ở lần đầu load
        if (isInitialLoad) {
            setLoading(true);
        }

        setError("");
        try {
            const res = await axios.get("/api/contact-messages", {
                params: {
                    search: debouncedSearchQuery,
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

        // Sau lần đầu load, set loading = false và đánh dấu không còn là initial load
        setLoading(false);
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/api/contact-messages/${id}`, {
                status: newStatus,
            });
            // Cập nhật trực tiếp state thay vì refetch
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === id ? { ...msg, status: newStatus } : msg
                )
            );
        } catch {
            setError("Failed to update status.");
        }
    };
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            // Đặc biệt cho cột Date (created_at): mặc định sort desc (mới nhất trước)
            // để hiển thị thời gian gần nhất với thời gian hệ thống
            setSortDir(field === "created_at" ? "desc" : "asc");
        }
    }; // Search handler functions
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchQuery(value);
        if (value !== debouncedSearchQuery) {
            setIsSearching(true);
        }
        setPage(1); // Reset page when searching
    };

    const clearSearch = () => {
        setLocalSearchQuery("");
        setDebouncedSearchQuery("");
        setIsSearching(false);
        setPage(1);
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="contact-admin-container">
            <h2 className="contact-admin-title">Contact Management</h2>
            <p className="contact-admin-description">
                Manage customer contact messages efficiently.
            </p>{" "}
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
                </div>{" "}
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search by name, email, or message..."
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    {isSearching && <div className="search-spinner"></div>}
                    {localSearchQuery && !isSearching && (
                        <button
                            className="clear-search-btn"
                            onClick={clearSearch}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
            {/* Search Results Count */}
            {debouncedSearchQuery && !loading && (
                <div className="search-results-info">
                    Found {total} message{total !== 1 ? "s" : ""}
                    matching "{debouncedSearchQuery}"
                    {status && ` (filtered by ${status})`}
                </div>
            )}{" "}
            {/* Table và loading/error tách riêng, không nằm trong row-action-contact hay div nào flex */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-2" />
                    <p>Loading data...</p>
                </div>
            ) : error ? (
                <div className="contact-admin-error">{error}</div>
            ) : (                <div className="contact-admin-table-container">
                    <table className="contact-admin-table">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort("name")}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                >
                                    Name{" "}
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortBy === "name" ? 1 : 0.3,
                                        }}
                                    >
                                        {sortBy === "name"
                                            ? sortDir === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▲"}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("email")}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                >
                                    Email{" "}
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortBy === "email" ? 1 : 0.3,
                                        }}
                                    >
                                        {sortBy === "email"
                                            ? sortDir === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▲"}
                                    </span>
                                </th>
                                <th>Message</th>
                                <th
                                    onClick={() => handleSort("status")}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                >
                                    Status{" "}
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortBy === "status" ? 1 : 0.3,
                                        }}
                                    >
                                        {sortBy === "status"
                                            ? sortDir === "asc"
                                                ? "▲"
                                                : "▼"                                            : "▲"}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("created_at")}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    title="Default sort: Newest first (closest to current time)"
                                >
                                    Date{" "}
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            opacity:
                                                sortBy === "created_at"
                                                    ? 1
                                                    : 0.3,
                                        }}
                                    >
                                        {sortBy === "created_at"
                                            ? sortDir === "asc"
                                                ? "▲"
                                                : "▼"
                                            : "▼"}
                                    </span>
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="contact-admin-no-data"
                                    >
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr
                                        key={msg.id}
                                        className={`contact-admin-row contact-admin-status-${msg.status}`}
                                    >
                                        <td title={msg.name}>{msg.name}</td>
                                        <td>{msg.email}</td>
                                        <td
                                            className="contact-admin-message-cell"
                                            title={msg.message}
                                        >
                                            {msg.message}
                                        </td>
                                        <td>
                                            <span
                                                className={`contact-admin-badge contact-admin-badge-${msg.status}`}
                                            >
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td
                                            title={new Date(
                                                msg.created_at
                                            ).toLocaleString()}
                                        >
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
                                            <select
                                                className="contact-admin-status-select"
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
            )}{" "}
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="contact-admin-pagination">
                    <button
                        className="contact-admin-page-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        &lt;
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx + 1}
                            className={`contact-admin-page-btn ${
                                page === idx + 1 ? "active" : ""
                            }`}
                            onClick={() => setPage(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        className="contact-admin-page-btn"
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages || totalPages === 0}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default ContactAdminManager;
