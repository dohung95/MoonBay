import React from "react";
import { Outlet } from 'react-router-dom';
import StaffHeader from "./StaffHeader";
import StaffSidebar from "./StaffSidebar";
import StaffFooter from "./StaffFooter";
import "simplebar-react/dist/simplebar.min.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const StaffDashboard = () => {
    return (
        <div className="admin-layout">
            <StaffHeader />
            <div className="admin-content d-flex">
                <StaffSidebar />
                <main className="flex-grow-1" style={{ width: "100vh" }}><Outlet /></main>
            </div>
            <StaffFooter />
        </div>
    );
};

export default StaffDashboard;