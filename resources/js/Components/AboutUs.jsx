import React from 'react';
import '../../css/banner.css';
import '../../css/AboutUs.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sitemapmini from './sitemapmini';

const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<i className="bi bi-star-fill me-1" key={`full-${i}`}></i>);
    }
    if (hasHalfStar) {
        stars.push(<i className="bi bi-star-half me-1" key="half"></i>);
    }
    return stars;
};
const AboutUs = () => {
    const sitemap = [
        { label: 'Home', link: '/' },
        { label: 'AboutUs' }
    ];
    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);
    return (
        <>
            <div className="banner">
                <img src="./images/banner/about_banner.jpg" alt="Banner" className='banner-img' />
                <div className='banner-text anima-text'>
                    <h1>The Story Behind Moon Bay</h1>
                </div>
            </div>

            <div>
                <div className="container ">
                    <Sitemapmini items={sitemap} />
                    <div className="row align-items-center my-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="mb-3">
                                About Us <br /> Our History <br /> Mission &amp; Vision
                            </h2>
                            <p>
                                With over two decades of welcoming travelers, Moon Bay Hotel stands as a symbol of refined elegance blended with warmth and genuine hospitality. We are proud to deliver exceptional service, sophisticated spaces, and heartfelt care — creating a place where every guest finds complete relaxation and unforgettable moments.
                            </p>
                        </div>
                        <div className="col-md-5 text-center">
                            <img
                                src="./images/Hung/photo1.jpg"
                                alt="Moon Bay Hotel"
                                className="img-fluid rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="facilities_area section_gap">
                <div className="overlay bg-parallax" data-stellar-ratio="0.8" data-stellar-vertical-offset="0" data-background=""></div>
                <div className="container " style={{ padding: '3% 0' }}>
                    <div className="section_title text-center">
                        <h2 className="title_w">Royal Facilities</h2>
                        <p>Who are in extremely love with eco friendly system.</p>
                    </div>
                    <div className="facilities_row row mb_30">
                        {facilities.map((facility, index) => (
                            <div className="col-lg-3 col-md-5" key={index}>
                                <div className="facilities_item">
                                    <h4 className="sec_h4">
                                        <i className={`bi ${facility.icon} fs-4`}></i> {facility.title}
                                    </h4>
                                    <p>{facility.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: '3% 0' }} className='group2_Hung' id='The_Brogrammers'>
                <div style={{ textAlign: 'center' }} >
                <h2>Group 2 with the theme "MoonBay hotels" includes the following members:</h2><br />
                </div>
                <div className="row ">
                    <div className='col-md-3' style={{ textAlign: 'center', padding:'0 2%' }} >
                        <img src="./images/Hung/Hung.jpg" alt="" style={{padding: '0 0 4% 0'}}/>
                        <p><b>Full name: Do Thanh Hung</b></p>
                        <p><b>Position: Project Lead</b></p>
                        <p><b>Slogan: Dare to dream big, commit to learning!</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding:'0 2%' }}>
                        <img src="./images/Hung/Huy.jpg" alt=""  style={{padding: '0 0 4% 0'}}/>
                        <p><b>Full name: Phu Vinh Huy</b></p>
                        <p><b>Position: Fullstack Developer</b></p>
                        <p><b>Slogan: Make it work, make it right, make it fast.</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding:'0 2%' }}>
                        <img src="./images/Hung/Dat.png" alt=""  style={{padding: '0 0 4% 0'}}/>
                        <p><b>Full name: Le Quoc Dat</b></p>
                        <p><b>Position: Developer/Tester</b></p>
                        <p><b>Slogan: Program anything you want.</b></p>
                    </div>
                    <div className='col-md-3' style={{ textAlign: 'center', padding:'0 2%' }}>
                        <img src="./images/Hung/Long.jpg" alt=""  style={{padding: '0 0 4% 0'}}/>
                        <p><b>Full name: Ngo Truong Long</b></p>
                        <p><b>Position: Developer/Tester</b></p>
                        <p><b>Slogan: Bugs are friends, not enemies— debug today to succeed tomorrow.</b></p>
                    </div>
                </div>
            </div>

        </>
    )
}
const facilities = [
    {
        title: 'Restaurant',
        icon: 'bi-cup-straw',
        description: 'Enjoy exquisite cuisine in a relaxing and modern atmosphere.',
    },
    {
        title: 'Sports Club',
        icon: 'bi-bicycle',
        description: 'Stay active and energized with our state-of-the-art sports facilities.',
    },
    {
        title: 'Swimming Pool',
        icon: 'bi-water',
        description: 'Dive into luxury with our pristine swimming pool.',
    },
    {
        title: 'Rent a Car',
        icon: 'bi-car-front',
        description: 'Explore the city with ease using our premium car rental services.',
    },
    {
        title: 'Gymnasium',
        icon: 'bi-person-walking',
        description: 'Keep fit during your stay in our fully equipped gym.',
    },
    {
        title: 'Bar',
        icon: 'bi-cup-hot',
        description: 'Unwind with a drink at our stylish and cozy bar.',
    },
];

export default AboutUs;