import React, { useState } from "react";
import "../../../css/css_of_staff/AdminSidebar.css"; 

const StaffSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handlenavigation = () => {
    window.location.href = "/";
  };

  return (
    <div className={`sidebar-wrapper-staff bg-dark text-white vh-100${isOpen ? "" : " sidebar-closed-staff"}`}>
      <div className="sidebar-header-staff d-flex align-items-center justify-content-between p-3 border-bottom">
        <div className="d-flex align-items-center" onClick={handlenavigation}>
          <img
            src="/images/logo/moonbaylogo.png"
            className="logo-icon-staff me-2"
            alt="logo icon"
          />
          {isOpen && <h4 className="logo-text-staff mb-0">MoonBay</h4>}
        </div >
        <div className="toggle-icon" onClick={handleToggle} style={{ cursor: "pointer" }}>
          <i className={`bx ${isOpen ? "bx-arrow-to-left" : "bx-arrow-to-right"} text-white`}></i>
        </div>
      </div>

      <ul className={`nav flex-column mt-3${isOpen ? "" : " d-none"}`}>
        <li className="nav-item">
          <a className="nav-link text-white d-flex align-items-center" href="/staff/users">
            <i className="bx bx-home-circle me-2"></i> List User
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white d-flex align-items-center" href="/staff/bookings">
            <i className="bx bx-right-arrow-alt me-2"></i> List Bookings
          </a>
        </li>
        {/* Add other menu items here */}
      </ul>
    </div>
  );
};

export default StaffSidebar;