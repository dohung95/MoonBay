import React, { useContext, useState, useEffect } from 'react'; // Thêm useContext
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/navbar.css'

const Navbar = ({ openLoginPopup }) => {
  const { user, logout } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    setIsAtTop(currentScrollY === 0);

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsVisible(false); // Ẩn navbar khi cuộn xuống
    } else {
      setIsVisible(true); // Hiện navbar khi cuộn lên
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll); // Lắng nghe sự kiện cuộn
    return () => {
      window.removeEventListener('scroll', handleScroll); // Dọn dẹp sự kiện khi component bị hủy
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    // Hiển thị lại banner trước khi đăng xuất và chuyển hướng
    const banner = document.querySelector(".banner");
    if (banner) {
      banner.style.display = "block";
    }

    logout(); // Gọi hàm logout từ AuthContext
  };

  const top = () => {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }
  return (
    <nav className={`navbar navbar-expand-lg sticky-top ${isVisible ? 'visible' : 'hidden'} ${isAtTop ? 'navbar-transparent' : 'navbar-colored'}`} style={{ transition: 'top 0.3s', top: isVisible ? '0' : '-80px' }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={top}>
          <img
            src="/images/logo/moonbaylogo.png"
            alt="Logo"
            width="60"
            height="60"
            className="d-inline-block align-middle rounded-circle"
          />
          <span className="align-middle text-white">Moon Bay</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={top}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/About" className="nav-link" onClick={top}>About Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/Ourhotels" className="nav-link" onClick={top}>Our Hotel</Link>
            </li>
            <li className="nav-item">
              <Link to="/Rooms" className="nav-link" onClick={top}>Rooms</Link>
            </li>
            <li className="nav-item">
              <Link to="/booking" className="nav-link" onClick={top}>Booking</Link>
            </li>
            <li className="nav-item">
              <Link to="/Services" className="nav-link" onClick={top}>Services</Link>
            </li>
            <li className="nav-item">
              <Link to="/Contact" className="nav-link" onClick={top}>Contact Us</Link>
            </li>
            {user ? (
              <li className="nav-item dropdown d-flex align-items-center">
                <img src={user.avatar} alt="Avatar" width="40" height="40" className="rounded-circle" />
                <button className="nav-link" data-bs-toggle="dropdown" aria-expanded="false">
                  HI {user.name}
                </button>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to={`/account/`}>account</Link></li>
                  <li><a className="dropdown-item" href="#">setting</a></li>
                  <li style={{ display: 'flex', justifyContent: 'center' }}><hr className="dropdown-divider" style={{ width: '80%' }} /></li>
                  <li><Link to={"/"} className="dropdown-item" onClick={handleLogout}>logout</Link></li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-outline-light ms-2"
                  onClick={openLoginPopup}
                >
                  Login / Register
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;