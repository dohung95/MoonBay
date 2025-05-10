import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; // Thêm useLocation
import { NavLink } from 'react-router-dom';
import '../../../css/AdminDashboard.css';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const features = ['User Management', 'Room list management', 'Employee List Management', 'Cài đặt', 'Thông báo', 'Hỗ trợ'];
    const routes = ['UserManagement', 'RoomListManagement', 'EmployeeListManagement', 'tinh_nang4', 'tinh_nang5', 'tinh_nang6'];
    const location = useLocation(); // Lấy thông tin đường dẫn hiện tại

    // Kiểm tra nếu đường dẫn hiện tại là '/admin' (trang chính của AdminDashboard)
    const isDashboardHome = location.pathname === '/admin';

    return (
        <div className="admin-dashboard row" style={{ "--bs-gutter-x": 0 }}>
            {/* Sidebar desktop */}
            <div className='col-md-2 d-none d-md-block sidebar' style={{ backgroundColor: '#33393e', height: '130vh', paddingTop: '2%' }}>
                <div>
                    <img src="./images/logo/moonbaylogo.png" alt="" style={{ width: 'auto', height: '65px', borderRadius: '50%', padding: '0 3%' }} />
                    <b style={{ color: 'white' }}>MANAGER</b>
                    <hr style={{ color: '#7d89a1' }} />
                </div>
                <div style={{ color: 'white', padding: '0 3%' }}>
                    {features.map((label, i) => (
                        <div style={{ padding: '2% 0' }} key={i}>
                            <NavLink
                                to={`/admin/${routes[i]}`}
                                className="sidebar-link_Hung"
                                activeClassName="active"
                            >
                                <b>{label}</b>
                            </NavLink>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar - mobile overlay */}
            {sidebarOpen && (
                <div className="mobile-sidebar-overlay">
                    <div className="mobile-sidebar-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: 'white', fontWeight: 'bold' }}>MENU</div>
                            <button onClick={() => setSidebarOpen(false)} className="btn btn-light">✕</button>
                        </div>
                        <hr style={{ color: '#7d89a1' }} />
                        <div style={{ color: 'white' }}>
                            {features.map((label, i) => (
                                <div style={{ padding: '2% 0' }} key={i}>
                                    <NavLink
                                        to={`/admin/${routes[i]}`}
                                        className="sidebar-link_Hung"
                                        activeClassName="active"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <b>{label}</b>
                                    </NavLink>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className='col-md-10 col-12' style={{ paddingTop: '1%' }}>
                {/* Header */}
                <div className='row align-items-center px-3' style={{ "--bs-gutter-x": 0, paddingBottom: '1%' }}>
                    {/* Hamburger menu mobile */}
                    <div className='col-2 d-md-none'>
                        <button onClick={() => setSidebarOpen(true)} className="btn btn-outline-dark">☰</button>
                    </div>

                    <div className='col-md-3 col-6' align='center'>
                        <Link to="/" style={{ textDecoration: 'none' }}><b>Home page</b></Link>
                    </div>
                    <div className='col-md-6 d-none d-md-block'>
                        <input type="text" placeholder='Search' className='form-control' />
                    </div>
                    <div className='col-md-3 col-4' align='center'>
                        <img src="./images/Hung/admin.jpg" alt="" style={{ width: '50px', height: 'auto', border: 'black solid 2px', borderRadius: '50%' }} />
                        <b> Admin</b>
                    </div>
                </div>
                <div style={{ backgroundColor: '#f1f6f9', width: '100%', height: '15vh', padding: '2% 0%' }}></div>

                {/* Main content */}
                <div >
                    <div style={{ width: '100%', height: '70vh' }}>
                        {/* Hiển thị "xin chao" chỉ khi ở trang chính của AdminDashboard */}
                        {isDashboardHome && (
                            <div>
                                <div align="center" style={{ padding: '2% 0' }}>
                                    <h1>Welcome to Moonbay hotel management system!</h1>
                                </div>
                                <div align="center">
                                    <img src="./images/Hung/manager_BG.jpg" alt="" style={{width:'800px', height:'400px'}}/>
                                </div>
                            </div>
                        )}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;