import React, { useContext, useState, useEffect } from 'react';
import "../../../css/css_of_staff/StaffHeader.css";
import { AuthContext } from '../AuthContext';
import { useSearch } from './SearchContext';

const StaffHeader = ({ handleSearchChange }) => {
  const { user } = useContext(AuthContext);
  const { searchQuery, setSearchQuery } = useSearch();
  return (
    <header className="staff-header bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2">
      <div className="d-flex align-items-center" onClick={() => window.location.href = "/staff"} >
        <h4 className="mb-0">Staff Dashboard</h4>
      </div>
      <div className="d-flex align-items-center">
        <div className="search-bar me-3">
          <input
            type="text"
            className="form-control search-staff"
            placeholder="Search data..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="staff-box d-flex align-items-center">
          <img
            src={user.avatar}
            alt="Avatar"
            width="40"
            height="40"
            className="staff-img"
          />
          <div className="staff-info">
            <p className="staff-name mb-0">{user.name}</p>
            <p className="staff-designation mb-0">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;