import React, { useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Services.css';
import Sitemapmini from './sitemapmini';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Banner from './banner';

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
                <h3>Details of the Service</h3>
                <p>{service.detailedDescription}</p>
              </div>
            )}
            {service.pricing && (
              <div className="service-pricing">
                <h3>Pricing</h3>
                <ul>
                  {service.pricing.map((price, index) => (
                    <li key={index}>{price.type}: {price.value}</li>
                  ))}
                </ul>
              </div>
            )}
            {service.workingHours && (
              <div className="service-hours">
                <h3>Working Hours</h3>
                <p>{service.workingHours}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const serviceRefs = useRef({});
  
  const openServicePopup = (service) => {
    setSelectedService(service);
  };
  
  const closeServicePopup = () => {
    setSelectedService(null);
  };

  const scrollToService = (serviceId) => {
    const serviceElement = serviceRefs.current[serviceId];
    if (serviceElement) {
      serviceElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Services' }
  ];
  
  return (
    <>
      <Banner title="Our Services" />
      <section className="container">
        <Sitemapmini items={sitemap} />
        <div className="service-nav-horizontal mb-5">
          {services.map((service, index) => (
            <button
              key={index}
              className="nav-item"
              onClick={() => scrollToService(index)}
            >
              <b>{service.title}</b>
            </button>
          ))}
        </div>

        <h2 className="text-center mb-5">Services</h2>
        <div className="service-list">
          {services.map((service, index) => (
            <div
              key={index}
              ref={(el) => (serviceRefs.current[index] = el)}
              className={`service-item d-flex align-items-center mb-5 ${
                index % 2 === 0 ? '' : 'flex-row-reverse'
              }`}
            >
              <div className="service-image">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service-info p-4">
                <h5 className="mb-3">{service.title}</h5>
                <p className="text-muted mb-3">
                  <i className="fas fa-clock me-1"></i> {service.workingHours}
                </p>
                <p>{service.description}</p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => openServicePopup(service)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
    description: "Discover a one-of-a-kind experience at the city's largest rooftop infinity pool – where crystal-blue waters meet breathtaking skyline views in the heart of the city.",
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
  }
];

export default Services;