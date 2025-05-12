import React from "react";
import "./AdminFooter.css"; // Import CSS tùy chỉnh

const AdminFooter = () => {
  return (
    <footer className="staff-footer bg-dark text-white text-center py-3">
      <p className="mb-0">
        &copy; {new Date().getFullYear()} MoonBay. All Rights Reserved.
      </p>
    </footer>
  );
};

export default AdminFooter;