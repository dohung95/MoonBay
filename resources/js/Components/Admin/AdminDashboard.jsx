// Components/Admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../../css/AdminDashboard.css'; // Đường dẫn đến file CSS của bạn

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard row" style={{ "--bs-gutter-x": 0 }}>
            <div className='col-md-2' style={{ backgroundColor: '#33393e', height: '100vh', paddingTop: '2%' }}>
                <div>
                    <img src="./images/logo/moonbaylogo.png" alt="" style={{ width: 'auto', height: '65px', borderRadius: '50%', padding: '0 3%' }} /> <b style={{ color: 'white' }}>MANAGER</b>
                    <hr style={{ color: '#7d89a1' }} />
                </div>
                <div style={{ color: 'white', padding: '0 3%' }}>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 1</a>
                    </div>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 2</a>
                    </div>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 3</a>
                    </div>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 4</a>
                    </div>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 5</a>
                    </div>
                    <div style={{ padding: '2% 0' }}>
                        <a href="/"> Tính năng 6</a>
                    </div>
                </div>

            </div>
            <div className='col-md-10' style={{ paddingTop: '1%' }}>
                <div className='row' style={{ "--bs-gutter-x": 0 }}>
                    <div className='col-md-3' align='center'>
                        <Link to="/" style={{ textDecoration: 'none' }}><b>Home page</b></Link>
                    </div>
                    <div className='col-md-6'>
                        <input type="text" placeholder='Search' />
                    </div>
                    <div className='col-md-3' align='center' >
                        <img src="./images/Hung/admin.jpg" alt="" style={{ width: '50px', height: 'auto', border: 'black solid 2px', borderRadius: '50%' }} /><b> Admin</b>
                    </div>
                </div>

                <div style={{ backgroundColor: '#f1f6f9', width: '100%', height: '15vh', padding: '2% 0%' }}>

                </div>

                <div className='container' style={{ padding: '2% 0' }}>
                    <div style={{ border: 'black solid 1px', width: '100%', height: '70vh' }}>
                        <h1>Các bảng sẽ hiển thị ở đây</h1>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;