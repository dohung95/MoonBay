import React from "react";
import StaffHeader from "./StaffHeader";
import StaffSidebar from "./StaffSidebar";
import StaffFooter from "./StaffFooter";
import "simplebar-react/dist/simplebar.min.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import "./App.css"; // Assuming you have a CSS file for custom styles
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const StaffDashboard = ({children}) => {
    return (
        <div className="admin-layout">
            <StaffHeader />
            <div className="admin-content d-flex">
                <StaffSidebar />
                <main className="flex-grow-1">{children}</main>
            </div>
            <StaffFooter />
        </div>
    );
};

export default StaffDashboard;