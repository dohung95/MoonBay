// File: resources/js/Components/Contact.jsx
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sitemapmini from './sitemapmini';
import '../../css/Contact.css';

const Contact = () => {
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Contact Us' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: formData,
      });
  
      if (!res.ok) {
        const error = await res.text();
        alert('Lỗi gửi: ' + error);
        return;
      }
  
      const result = await res.json();
      if (result.success) {
        alert(result.message);
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    }
  };
  
  
  return (
    <>
      <div className="banner">
        <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
        <div className='banner-text anima-text'>
          <h1>Contact Us</h1>
        </div>
      </div>
      <div className="container mb-5">
        <Sitemapmini items={sitemap} />
        <div className="contactus_area">
          <div className="container">
          <div className="row">
            <div className="location-long mb-5">
              <h2 className="title-location d-flex flex-column justify-content-center align-items-center mt-5 mb-5">Location</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className="map-container-long">
                    <div className="map-placeholder-huy">
                      <div style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
                        <iframe
                          src="https://www.google.com/maps/d/embed?mid=1FTMogPpDF4RFkkE6-idbOgnK0l6Xq5Y&ehbc=2E312F"
                          width="100%"
                          height="500"
                          style={{ position: 'absolute', top: -65, left: 0, border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Moon Bay Hotel Map"
                        ></iframe>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="location-details-huy">
                    <h3>Nearby Places</h3>
                    <div className="nearby-places-huy">
                      <div className="place-item-huy">Hon Lon Beach: 0.5 km - 5-minute walk</div>
                      <div className="place-item-huy">Nam Du Lighthouse: 2 km - 10-minute boat ride</div>
                      <div className="place-item-huy">Hon Mau Island: 3 km - 15-minute boat ride</div>
                      <div className="place-item-huy">Rach Gia City: 80 km - 2-hour ferry ride</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-3">
                <div className="contact_info">
                  <div className="info_item">
                    <i className="lnr lnr-home"></i>
                    <h6>📍 Nam Du Island, Kien Giang Province</h6>
                    <p>Vietnam</p>
                  </div>
                  <div className="info_item">
                    <i className="lnr lnr-phone-handset"></i>
                    <h6><a href="#">00 (440) 9865 562</a></h6>
                    <p>Mon to Fri 9am to 6 pm</p>
                  </div>
                  <div className="info_item">
                    <i className="lnr lnr-envelope"></i>
                    <h6><a href="#">support@colorlib.com</a></h6>
                    <p>Send us your query anytime!</p>
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <form className="row contact_form" onSubmit={contactSubmit} id="contactForm">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input type="text" className="form-control" id="name" name="name" placeholder="Enter your name" />
                    </div>
                    <div className="form-group">
                      <input type="email" className="form-control" id="email" name="email" placeholder="Enter email address" />
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="subject" name="subject" placeholder="Enter Subject" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <textarea className="form-control" name="message" id="message" rows="1" placeholder="Enter Message"></textarea>
                    </div>
                  </div>
                  <div className="col-md-12 text-left">
                    <button type="submit" className="btn theme_btn button_hover">Send Message</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
  };

export default Contact;