import React from "react";
import "./AdminHeader.css"; // Import CSS tùy chỉnh

const AdminHeader = () => {
  return (
    <header className="staff-header bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2">
      <div className="d-flex align-items-center">
        <div className="mobile-toggle-menu me-3">
          <i className="bx bx-menu text-white fs-4"></i>
        </div>
        <h4 className="mb-0">Staff Dashboard</h4>
      </div>
      <div className="d-flex align-items-center">
        <div className="search-bar me-3">
          <input
            type="text"
            className="form-control search-staff"
            placeholder="Search..."
          />
        </div>
        <div className="staff-box d-flex align-items-center">
          <img
            src="/path/to/admin-image.jpg"
            className="staff-img rounded-circle me-2"
            alt="Staff avatar"
            width="40"
            height="40"
          />
          <div className="staff-info">
            <p className="staff-name mb-0">Admin Name</p>
            <p className="staff-designation mb-0">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;