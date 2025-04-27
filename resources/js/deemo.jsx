import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import NavBar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import Home from './Components/Home.jsx';
import AboutUs from './Components/AboutUs.jsx';
import OurHotels from './Components/ourhotels.jsx';
import Rooms from './Components/rooms.jsx';
import ContactUsPage from './Components/ContactUsPage.jsx';
import ServicePage from './Components/ServicesPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<AboutUs />} />
        <Route path="/Ourhotels" element={<OurHotels />} />
        <Route path="/Rooms" element={<Rooms />} />
        <Route path="/Contact" element={<ContactUsPage />} />
        <Route path="/Services" element={<ServicePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
