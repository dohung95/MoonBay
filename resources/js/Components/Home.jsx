import '../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BookingForm from './BookingForm';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/special-offers') // hoặc URL deploy
            .then(response => {
                const filtered = response.data.filter(offer =>
                    offer.season || offer.free_services || offer.total_bill_threshold || offer.stay_duration_days || offer.other_package_description
                );
                setOffers(filtered);
            })
            .catch(error => {
                console.error("Error while getting offer:", error);
            });
    }, []);
    return (
        <>
            <div className="page-header section-dark" style={{ backgroundImage: "url('/images/demo.jpg')" }}>
                <div className="filter"></div>
                <div className="content-center">
                    <div className="container">
                        <div className="title-brand">
                            <p style={{ fontSize: '2.5vw' }}><b>Away from monotonous life</b></p>
                            <p className='presentation-title'>Relax Your Mind</p>
                            <div className="fog-low">
                                <img src="/images/fog-low.png" alt="" />
                            </div>
                            <div className="fog-low right">
                                <img src="/images/fog-low.png" alt="" />
                            </div>
                        </div>
                        <div style={{ marginTop: '7%' }} className='custom-container'>
                            <BookingForm />
                        </div>
                    </div>
                </div>
                <div className="moving-clouds" style={{ backgroundImage: "url('/images/clouds.png')" }}></div>
            </div>

            <div>
                <section className="accomodation-area py-5">
                    <div >
                        <div className="section-title text-center mb-5">
                            <h2 className="text">Attractive offers</h2>
                            <p>
                                Great deals when you choose us as your vacation destination for you or your family.
                            </p>
                        </div>
                        
                        <div className='row' style={{ padding: '0 5%', justifyContent: 'center' }}>
                            {offers.map((offer, index) => (
                                <React.Fragment key={index}>
                                    {/* Mùa + dịch vụ miễn phí */}
                                    {offer.season && offer.free_services &&
                                        <div className='col-md-3' style={{paddingBottom:'2%'}}>
                                            <div className='chiecla2_hung' style={{
                                                backgroundImage: `url('/images/Hung/${offer.season.toLowerCase()}.jpg')`,

                                                backgroundSize: 'cover',
                                                width: '100%',
                                                height: '200px'
                                            }}>
                                                <div className='row container chiecla2_hung' style={{
                                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                    color: 'white',
                                                    height: '100%',
                                                    paddingTop: '15%',
                                                    paddingLeft: '10%'
                                                }}>
                                                    <div className='col-md-5'>
                                                        <div>Season</div>
                                                        <b>{offer.season}</b>
                                                    </div>
                                                    <div className='col-md-5'>
                                                        <div>Service</div>
                                                        <b>{offer.free_services}</b>
                                                        </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        Time: {new Date(offer.season_start).toLocaleDateString('vi-VN')} - {new Date(offer.season_end).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {/* Ưu đãi bill */}
                                    {offer.total_bill_threshold && offer.discount_percent &&
                                        <div className='col-md-3' style={{paddingBottom:'2%'}}>
                                            <div style={{ width: '100%', height: '200px' }}>
                                                <div className='row container chiecla2_hung' style={{
                                                    backgroundColor: 'rgba(64, 190, 225, 0.54)',
                                                    color: 'white',
                                                    height: '100%',
                                                    paddingTop: '15%',
                                                    paddingLeft: '10%'
                                                }}>
                                                    <div className='col-md-5'><div>Total Bill</div><b>{Math.floor(offer.total_bill_threshold).toLocaleString('vi-VN')} VND</b></div>
                                                    <div className='col-md-5'><div>Discount</div><b>{offer.discount_percent}%</b></div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        Time: {new Date(offer.discount_start).toLocaleDateString('vi-VN')} - {new Date(offer.discount_end).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {/* Ưu đãi lưu trú */}
                                    {offer.stay_duration_days && offer.gift_description &&
                                        <div className='col-md-3' style={{paddingBottom:'2%'}}>
                                            <div style={{ width: '100%', height: '200px' }}>
                                                <div className='row container chiecla1_hung' style={{
                                                    backgroundColor: 'rgba(64, 190, 225, 0.54)',
                                                    color: 'white',
                                                    height: '100%',
                                                    paddingTop: '15%',
                                                    paddingLeft: '10%'
                                                }}>
                                                    <div className='col-md-5'><div>Total days</div><b>{offer.stay_duration_days} day</b></div>
                                                    <div className='col-md-5'><div>Souvenir</div><b>{offer.gift_description}</b></div>
                                                    <div style={{ textAlign: 'center' }}>
                                                       Time: {new Date(offer.gift_start).toLocaleDateString('vi-VN')} - {new Date(offer.gift_end).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {/* Ưu đãi khác */}
                                    {offer.other_package_description && offer.offer_type &&
                                        <div className='col-md-3' style={{paddingBottom:'2%'}}>
                                            <div className='chiecla1_hung' style={{
                                                backgroundImage: "url('/images/Hung/Uudaikhac.jpg')",
                                                backgroundSize: 'cover',
                                                width: '100%',
                                                height: '200px'
                                            }}>
                                                <div className='row container chiecla1_hung' style={{
                                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                    color: 'white',
                                                    height: '100%',
                                                    paddingTop: '15%',
                                                    paddingLeft: '10%'
                                                }}>
                                                    <div className='col-md-5'><div>Condition</div><b>{offer.other_package_description}</b></div>
                                                    <div className='col-md-5'><div>Endow</div><b>{offer.offer_type}</b></div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        Time: {new Date(offer.other_offer_start).toLocaleDateString('vi-VN')} - {new Date(offer.other_offer_end).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </React.Fragment>
                            ))}
                        </div>
                        
                    </div>
                </section>
            </div>
            <hr className='container'/>
            <div>
                <section className="latest_blog_area section_gap py-5">
                    <div >
                        <div className="section_title text-center mb-4">
                            <h2 className="title_color">Latest customer reviews</h2>
                            <p>
                                Great and interesting experiences that customers have shared with us.
                            </p>
                        </div>
                        <div className="row justify-content-center g-0 hung">
                            {blogs.map((blog, index) => (
                                <div className="col-lg-3 col-md-6 mb-4" key={index}>
                                    <div className="single-recent-blog-post card h-100">
                                        <div className="thumb">
                                            <img className="img-fluid card-img-top" src={blog.image} alt="post" />
                                        </div>
                                        <div className="details card-body">
                                            <div className="tags mb-2">
                                                {blog.tags.map((tag, tagIndex) => (
                                                    <a key={tagIndex} href="#" className="btn btn-sm tag-btn-custom me-1">
                                                        {tag}
                                                    </a>
                                                ))}
                                            </div >
                                            <div className='abc'>
                                                <a href="#" >
                                                    <h4 className="sec_h4 card-title">{blog.title}</h4>
                                                </a>
                                            </div>
                                            <p className="card-text">{blog.description}</p>
                                            <h6 className="date title_color mt-3">{blog.date}</h6>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

const blogs = [
    {
        image: "/images/Hung/blog-1.jpg",
        tags: ["Travel", "Life Style"],
        title: "Low Cost Advertising",
        description: "Acres of Diamonds… you’ve read the famous story, or at least had it related to you. A farmer.",
        date: "31st January, 2018",
    },
    {
        image: "/images/Hung/blog-2.jpg",
        tags: ["Travel", "Life Style"],
        title: "Creative Outdoor Ads",
        description: "Self-doubt and fear interfere with our ability to achieve or set goals. Self-doubt and fear are",
        date: "31st January, 2018",
    },
    {
        image: "/images/Hung/blog-3.jpg",
        tags: ["Travel", "Life Style"],
        title: "It S Classified How To Utilize Free",
        description: "Why do you want to motivate yourself? Actually, just answering that question fully can",
        date: "31st January, 2018",
    },
];
export default Home;