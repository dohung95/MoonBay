import React, { useState } from "react";
import { Outlet } from 'react-router-dom';
import StaffHeader from "./StaffHeader";
import StaffSidebar from "./StaffSidebar";
import StaffFooter from "./StaffFooter";
import { useSearch } from './SearchContext';
import "simplebar-react/dist/simplebar.min.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const StaffDashboard = () => {
    const { searchQuery, setSearchQuery } = useSearch(); // Quản lý giá trị tìm kiếm

    // Xử lý thay đổi ô tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    return (
        <div className="admin-layout" style={{minHeight: "100vh", height: "auto"}}>
            <StaffHeader handleSearchChange={handleSearchChange}/>
            <div className="admin-content d-flex">
                <StaffSidebar handleSearchChange={handleSearchChange}/>
                <main className="flex-grow-1" style={{minHeight: "100vh", height: "auto", overflow: "auto"}}><Outlet /></main>
            </div>
            <StaffFooter />
        </div>
    );
};

export default StaffDashboard;