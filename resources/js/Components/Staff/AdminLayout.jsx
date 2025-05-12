import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "simplebar-react/dist/simplebar.min.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import "./App.css"; // Assuming you have a CSS file for custom styles
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Import Bootstrap JS for dropdowns and other components


const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-content d-flex">
        <AdminSidebar />
        <main className="flex-grow-1">{children}</main>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;