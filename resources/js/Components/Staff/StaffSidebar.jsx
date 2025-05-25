import React, { useState } from "react";
import "../../../css/css_of_staff/StaffSidebar.css";
import { NavLink } from 'react-router-dom';
import { useSearch } from './SearchContext';

const StaffSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handlenavigation = () => {
    window.location.href = "/";
  };

  return (
    <div className="staff-sidebar-page">
      <div className={`sidebar-wrapper-staff bg-dark text-white ${isOpen ? "" : " sidebar-closed-staff"}`}>
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

        {/* Menu items */}

        <ul className={`nav flex-column mt-3`}>
          <li className="nav-item">
            <NavLink
              className="nav-link text-white d-flex align-items-center btn " to="/staff/BookingList"
            >
              <i className="bx bx-list-ul me-2"></i>
              {isOpen && "booking history"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link text-white d-flex align-items-center btn " to="/staff/StaffCustomerManagement"
            >
              <i className="bx bx-user-circle me-2"></i>
              {isOpen && "Customer Management"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white d-flex align-items-center" to="/staff/StaffRoomManagement">
              <i className="bx bx-door-open me-2"></i>
              {isOpen && "Room Management"}
            </NavLink>
          </li>
          {/* Add other menu items here */}
        </ul>
      </div>
    </div>
  );
};

export default StaffSidebar;