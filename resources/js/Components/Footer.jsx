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
                <div className='row' style={{ padding: '0 10%' }}>
                    <div className='col-md-6 row'>
                        <div className='col-md-2' style={{ padding: '1% 0 0 0' }}>
                            <img
                                src="/images/logo/moonbaylogo.png"
                                width="100vw"
                                height="100vw"
                                className="d-inline-block align-middle rounded-circle"
                            />
                        </div>
                        <div className='col-md-10'>
                            <h1 style={{ color: 'white' }}><b>MOONBAY HOTELS</b></h1>
                            Operation: <i>Monday to Sunday</i><br />
                            Working hours: <i>7:00 AM - 10:00 PM</i><br /> <br />
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div align='center'>
                            <div style={{ padding: '3% 0 0 0 ' }}>
                                <img src="" alt="" />
                                <span class="arrow fast"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                                    <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                                </svg></span><span class="arrow slow"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                                    <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                                </svg></span>&nbsp;
                                <Link to="/booking#booknow" className='btn btn-warning' style={{ color: 'black', fontSize: '3vw', borderRadius: "2px" }}>
                                    &nbsp;BOOKING NOW&nbsp;
                                </Link>
                                &nbsp;
                                <span class="arrow slow"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                                    <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                                </svg></span><span class="arrow fast"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                                    <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
                                </svg></span>
                            </div>
                        </div>
                        <br />
                    </div>

                    <hr style={{ height: "1px", border: '0', backgroundColor: "white" }} />
                </div>

                <div className='footer-setup'>
                    <div className='Contact_Hung'>
                        <div style={{ padding: "5%" }}><a href="tel:+84986555666"><img src="/images/Hung/hotline.jpg" alt="" style={{height:'8vh',width:'8vh'}}/></a></div>
                        <div style={{ padding: "5%" }}><a href="https://www.facebook.com/messages/t/686987754487740?locale=vi_VN" target="_blank"> <img src="/images/Hung/mess.png" alt="" /></a></div>
                        <div style={{ padding: "5%" }}><a href="https://zalo.me/0986555666" target="_blank"><img src="/images/Hung/zalo.png" alt="" /></a></div>
                        <div style={{ padding: "5%" }}><a href='https://youtube.com/@moonbayhotels?si=M7G5aIfnOg0kOMDV' target='_blank'><img src="/images/Hung/youtube.jpg" alt="" /></a></div>
                    </div>
                    <div className='row' style={{ padding: '0 10%' }}>
                        <div className='col-md-3 Our_information_Hung'>
                            <h3 style={{ color: "white" }}>Our information</h3><br />
                            <b> Address:</b> <a href="https://www.google.com/maps/d/embed?mid=1FTMogPpDF4RFkkE6-idbOgnK0l6Xq5Y&ehbc=2E312F" target='blank'>Nam Du Island, Kien Giang Province, Vietnam. </a><br />
                            <b>Phone:</b> <a href="tel:+84986555666">+84 (0) 986 555 666</a><br />
                            <b>Email:</b> <a href="mailto:info@moonbay.vn?subject=I%20need%20help&body=I%20need%20help%20with...">Info@moonbay.vn</a><br /><br />
                        </div>


                        <div className='col-md-3'>
                            <div align="left">
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
                                                to="/Booking" onClick={top}
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
                                        <div className='col-md-9'>
                                            <input type="email" placeholder='Your Email' />
                                        </div>
                                        <div className='col-md-3' style={{ padding: '3% 0 0 0' }}>
                                            <div>
                                                <button className='btn button_send-hung' type="submit" >Send</button>
                                            </div>
                                            <br />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className='col-md-3'>
                            <div align="left">
                                <h3 style={{ color: "white" }}>About Agency</h3><br />
                            </div>
                            <div >
                                Moonbay Hotel is committed to delivering a refined, comfortable, and nature-inspired stay, where every moment is complete and unforgettable.
                            </div>
                        </div>

                        <hr />
                        <p>
                            Copyright ©2025 All rights reserved | This website is made with <span role="img" aria-label="crown">👑</span> by <strong style={{ color: "white" }}>&nbsp;<Link to="/About#The_Brogrammers" smooth={true} duration={500} style={{ textDecoration: 'none', color: 'white' }} >
                                The Brogrammers
                            </Link></strong>
                        </p>


                    </div>
                </div>

            </div>
        </>
    );
};

export default Footer;
