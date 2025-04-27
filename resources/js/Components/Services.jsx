import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Services.css';
import Sitemapmini from './sitemapmini';

const Services = () => {
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
            </div>
          <div className="row">
            {services.map((service, index) => (
              <div key={index} className="services_item col-lg-6">
                <div className="blog_post bg-white shadow-lg rounded-2xl overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-64 object-cover" />
                  <div className="service_details p-4">
                    <h2 className="text-xl font-bold mb-2">{service.title}</h2>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <a href="#" className="view_btn button_hover">
                      View More
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const services = [
  {
    title: "Moonbay Spa",
    image: "./images/Long/Services/MoonbaySpa.jpg",
    description:
      "Treat your mind and body by visiting to our luxurious spa for indulging in the ultimate relaxation experience at Moonbay Spa. With an exquisite service designed, we have everything you need to renew, re-energize, and rejuvenate yourself from body treatments to facials.",
  },
  {
    title: "Swimming Pool",
    image: "./images/Long/Services/Swimming Pool.jpg",
    description:
      "Explore an exclusive experience at the city’s biggest rooftop infinity pool with blue water and gaze down on the glittering in the city’s heart. Whether you decide to soak up the sun on a chair or swim in our shimmering pool with a stunning city view.",
  },
  {
    title: "Moonbay Gym",
    image: "./images/Long/Services/Moonbay Gym.jpg",
    description:
      "Experience our wide variety of fitness, health and lifestyle clubs available on the 12th floor of the hotel. Equipped with state-of-the-art facilities. Better mind, better body, and a happy, healthy you. We have everything you need to achieve your fitness goals.",
  },
  {
    title: "Moonbay Buffet",
    image: "./images/Long/Services/Moonbay Buffet.jpg",
    description:
      "Come to Moonbay Buffet, diners not only enjoy a menu with more than 60 unique delicious dishes selected by the chef, but also experience the buffet style to be changed daily in a luxurious space and professional service staff.",
  },
  {
    title: "Shuttle and Transportation",
    image: "./images/Long/Services/Shuttle and Transportation.jpg",
    description:
      "Using our airport pickup or drop off service to avoid any scam that may happen along the way. Our shuttle bus is available every day from 8:00 am to 5:00 pm.",
  },
  {
    title: "Moonbay Casino",
    image: "./images/Long/Services/Moonbay Casino.jpg",
    description:
      "Located on the basement level of Moonbay Hotel, Moonbay Casino features the latest slots, roulette, baccarat, and blackjack machines. Special events every day bring joy to all guests.",
  },
  {
    title: "Barclub",
    image: "./images/Long/Services/Barclub.jpg",
    description:
      "Step into Barclub – the ultimate nightlife destination where music, lights, and vibes come alive! Barclub is more than just a place to grab a drink – it’s where the night begins and the party never ends.",
  },
];

export default Services;