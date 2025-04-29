import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Services.css';
import Sitemapmini from './sitemapmini';

// Component Popup cho dịch vụ
const ServicePopup = ({ service, onClose }) => {
  return (
    <div className="service-popup-overlay" onClick={onClose}>
      <div className="service-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="service-popup-header">
          <h2>{service.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="service-popup-body">
          <div className="service-popup-image">
            <img src={service.image} alt={service.title} />
          </div>
          <div className="service-popup-description">
            <p>{service.description}</p>
            {service.detailedDescription && (
              <div className="service-details-extra">
                <h3>Chi tiết dịch vụ</h3>
                <p>{service.detailedDescription}</p>
              </div>
            )}
            {service.pricing && (
              <div className="service-pricing">
                <h3>Bảng giá</h3>
                <ul>
                  {service.pricing.map((price, index) => (
                    <li key={index}>{price.type}: {price.value}</li>
                  ))}
                </ul>
              </div>
            )}
            {service.workingHours && (
              <div className="service-hours">
                <h3>Giờ phục vụ</h3>
                <p>{service.workingHours}</p>
              </div>
            )}
          </div>
        </div>
        <div className="service-popup-footer">
          <button className="btn-book button_hover">Đặt lịch</button>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  // State để theo dõi service đang được chọn để hiển thị trong popup
  const [selectedService, setSelectedService] = useState(null);
  
  // Hàm để mở popup với service được chọn
  const openServicePopup = (service) => {
    setSelectedService(service);
  };
  
  // Hàm để đóng popup
  const closeServicePopup = () => {
    setSelectedService(null);
  };

  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Services' }
  ];
  
  return (
    <>
      <div className="banner">
        <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
        <div className='banner-text anima-text'>
          <h1>Our Services for you</h1>
        </div>
      </div>
      <div className="container">
        <Sitemapmini items={sitemap} />
        <div className="services_area">
            <div className="container">
                <div className="d-flex flex-column justify-content-center align-items-center mb-5">
                  <h1 className="">Our Services</h1>
                  <p>Immerse Yourself in Relax</p>
                </div>
                
                {/* Phần giới thiệu dịch vụ trong 3 dòng */}
                <div className="service-intro-container mb-5">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="service-intro-box">
                        <div className="service-intro-icon">
                          <i className="fas fa-spa"></i>
                        </div>
                        <h3>Wellness & Relaxation</h3>
                        <p>Discover our premium spa treatments and fitness facilities designed to rejuvenate your body and mind.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="service-intro-box">
                        <div className="service-intro-icon">
                          <i className="fas fa-utensils"></i>
                        </div>
                        <h3>Dining & Entertainment</h3>
                        <p>Indulge in exquisite cuisines at our buffet and experience thrilling nightlife at our bar and casino.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="service-intro-box">
                        <div className="service-intro-icon">
                          <i className="fas fa-concierge-bell"></i>
                        </div>
                        <h3>Convenience & Comfort</h3>
                        <p>Enjoy our premium shuttle services and world-class amenities for a truly unforgettable stay.</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          <div className="row">
            {services.map((service, index) => (
              <div key={index} className="services_item col-lg-6">
                <div className="blog_post bg-white shadow-lg rounded-2xl overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-64 object-cover" />
                  <div className="service_details p-4">
                    <h2 className="text-xl font-bold mb-2">{service.title}</h2>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <a href="#" className="view_btn button_hover" onClick={(e) => {
                      e.preventDefault();
                      openServicePopup(service);
                    }}>
                      View More
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hiển thị Popup khi có dịch vụ được chọn */}
      {selectedService && (
        <ServicePopup service={selectedService} onClose={closeServicePopup} />
      )}
    </>
  );
};

// Data dịch vụ với thông tin chi tiết hơn cho popup
const services = [
  {
    title: "Moonbay Spa",
    image: "./images/Long/Services/MoonbaySpa.jpg",
    description: "Experience complete relaxation at Moonbay Spa – where premium beauty and wellness treatments help you recharge, renew yourself, and feel truly refreshed.",
    detailedDescription: 
      "Our spa offers a wide range of treatments including aromatherapy, hot stone massage, Swedish massage, deep tissue massage, facials, body wraps, and more. All of our therapists are professionally trained and certified to provide you with the best experience possible.",
    pricing: [
      { type: "60-minute massage", value: "$80" },
      { type: "90-minute massage", value: "$120" },
      { type: "Facial treatments", value: "$90-$150" },
      { type: "Body scrubs", value: "$95" }
    ],
    workingHours: "Daily from 9:00 AM to 10:00 PM"
  },
  {
    title: "Swimming Pool",
    image: "./images/Long/Services/Swimming Pool.jpg",
    description: "Discover a one-of-a-kind experience at the city’s largest rooftop infinity pool – where crystal-blue waters meet breathtaking skyline views in the heart of the city.",
    detailedDescription:
      "Our infinity pool offers an unparalleled swimming experience with panoramic views of the city skyline. The pool is temperature-controlled for your comfort year-round and features underwater music, comfortable loungers, and poolside service.",
    pricing: [
      { type: "Hotel guests", value: "Complimentary" },
      { type: "Day visitors", value: "$30 per person" }
    ],
    workingHours: "Daily from 6:00 AM to 9:00 PM"
  },
  {
    title: "Moonbay Gym",
    image: "./images/Long/Services/Moonbay Gym.jpg",
    description:
      "Elevate your wellness on the 12th floor with state-of-the-art fitness, health, and lifestyle clubs. Better mind, better body, and a healthier, happier you.",
    detailedDescription:
      "Our gym features the latest cardio and strength training equipment from leading brands. We also offer personal training sessions, group classes including yoga, pilates, HIIT, and spinning. Towels and water are complimentary for all users.",
    pricing: [
      { type: "Hotel guests", value: "Complimentary" },
      { type: "Monthly membership", value: "$75" },
      { type: "Personal training session", value: "$50 per hour" }
    ],
    workingHours: "Monday to Friday: 5:00 AM - 10:00 PM, Weekends: 6:00 AM - 9:00 PM"
  },
  {
    title: "Moonbay Buffet",
    image: "./images/Long/Services/Moonbay Buffet.jpg",
    description:
      "Come to Moonbay Buffet and savor over 60 chef-selected dishes in a luxurious setting. Enjoy a daily-changing buffet style with professional, attentive service.",
    detailedDescription:
      "Our international buffet features cuisines from around the world, including Asian specialties, Western favorites, seafood station, carving station, freshly baked pastries, and desserts. We use only the freshest ingredients and our menu changes seasonally.",
    pricing: [
      { type: "Breakfast buffet", value: "$35 per person" },
      { type: "Lunch buffet", value: "$45 per person" },
      { type: "Dinner buffet", value: "$60 per person" },
      { type: "Weekend brunch", value: "$55 per person" }
    ],
    workingHours: "Breakfast: 6:30 AM - 10:30 AM, Lunch: 12:00 PM - 2:30 PM, Dinner: 6:00 PM - 10:00 PM"
  },
  {
    title: "Shuttle and Transportation",
    image: "./images/Long/Services/Shuttle and Transportation.jpg",
    description:
      "Using our airport pickup or drop off service to avoid any scam that may happen along the way. Our shuttle bus is available every day from 8:00 am to 5:00 pm.",
    detailedDescription:
      "We offer convenient airport transfers in our comfortable, air-conditioned vehicles. Our professional drivers will track your flight and wait for you even if your flight is delayed. For guests wanting to explore the city, we also offer private car services and city tours.",
    pricing: [
      { type: "Airport pickup/drop-off", value: "$30 one way" },
      { type: "Shuttle bus to city center", value: "Complimentary (reservation required)" },
      { type: "Private car (4 hours)", value: "$120" }
    ],
    workingHours: "Shuttle service: 8:00 AM - 5:00 PM, Airport transfers: 24 hours (reservation required)"
  },
  {
    title: "Moonbay Casino",
    image: "./images/Long/Services/Moonbay Casino.jpg",
    description:
      "Located on the basement level of Moonbay Hotel, Moonbay Casino features the latest slots, roulette, baccarat, and blackjack machines. Special events every day bring joy to all guests.",
    detailedDescription:
      "Our casino offers an exciting gaming experience with over 100 slot machines and 20 gaming tables including blackjack, baccarat, poker, and roulette. Our weekly tournaments and daily promotions add to the excitement, and our lounge serves premium drinks and light snacks.",
    pricing: [
      { type: "Minimum bet", value: "Varies by game" },
      { type: "VIP rooms available", value: "By reservation" }
    ],
    workingHours: "Open 24 hours daily"
  },
  {
    title: "Barclub",
    image: "./images/Long/Services/Barclub.jpg",
    description:
      "Step into Barclub – the ultimate nightlife destination where music, lights, and vibes come alive! Barclub is more than just a place to grab a drink – it's where the night begins and the party never ends.",
    detailedDescription:
      "Our stylish Barclub features world-class DJs, state-of-the-art sound system, and spectacular lighting effects. Enjoy premium cocktails crafted by our expert mixologists, VIP bottle service, and themed party nights. Our dance floor comes alive with energy every weekend.",
    pricing: [
      { type: "Cover charge", value: "$15 (weekends)" },
      { type: "Signature cocktails", value: "$15-$25" },
      { type: "VIP table reservation", value: "Starting at $300" }
    ],
    workingHours: "Wednesday to Sunday: 9:00 PM - 3:00 AM"
  },
];

export default Services;