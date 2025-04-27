import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/footer.css';

const Footer = () => {
    const top = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }
    return (
        <>
            <div style={{ backgroundColor: '#04091e', color: '#6c6c6e', padding: '2% 0' }}>
                <div className='footer-setup'>
                    <div className='row' style={{ padding: '0 10%' }}>
                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>About Agency</h3><br />
                            </div>
                            <div >
                                Moonbay Hotel is committed to delivering a refined, comfortable, and nature-inspired stay, where every moment is complete and unforgettable.
                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="center">
                                <h3 style={{ color: "white" }}>Navigation Links</h3><br />
                            </div>
                            <div className='row Link-setup'>
                                <div className='col-md-5 '>
                                    <ul>
                                        <li className="nav-item ">
                                            <Link className={`nav-link text-#6c6c6e ${location.pathname === '/' ? 'active' : ''}`}
                                                to="/" onClick={top}
                                            >
                                                Home
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-#6c6c6e ${location.pathname === '/About' ? 'active' : ''}`}
                                                to="/About" onClick={top}
                                            >
                                                About Us
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link text-#6c6c6e ${location.pathname === '/Ourhotels' ? 'active' : ''}`}
                                                to="/Ourhotels" onClick={top}
                                            >
                                                Our Hotel
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="/Rooms" onClick={top}
                                            >
                                                Rooms
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className='col-md-6'>
                                    <ul>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="#booking" onClick={top}
                                            >
                                                Booking
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="/Services" onClick={top}
                                            >
                                                Services
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-#6c6c6e"
                                                to="/Contact" onClick={top}
                                            >
                                                Contact Us
                                            </Link>
                                        </li>

                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>Newsletter</h3><br />
                                For travel companies or customers interested in our information and services.
                            </div>
                            <div style={{ padding: '4% 0 0 0' }}>
                                <form action="">
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <input type="email" placeholder='Your Email' />
                                        </div>
                                        <div className='col-md-4'>
                                            <button className='btn btn-secondary' type="submit">Send</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className='col-md-3 giaithuong'>
                            <div align="left" >
                                <h3 style={{ color: "white" }}>Achievements</h3>
                                <ul className="list_style list-unstyled d-flex flex-wrap">
                                    <li><img src="./images/Hung/won1.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/won2.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/won3.jpg" alt="" /></li>
                                    <li><img src="./images/Hung/won4.png" alt="" /></li>
                                    <li><img src="./images/Hung/won5.png" alt="" /></li>
                                    <li><img src="./images/Hung/won6.jpg" alt="" /></li>
                                </ul>
                            </div>
                            <br />
                        </div>

                        <hr />
                        <p>
                            Copyright ©2025 All rights reserved | This website is made with <span role="img" aria-label="crown">👑</span> by <strong style={{ color: "white" }}>&nbsp;The Brogrammers</strong>
                        </p>


                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
