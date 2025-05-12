import '../../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditOffer = () => {
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
            <div className='row' style={{ padding: '0 5%', justifyContent: 'center' }}>
                {offers.map((offer, index) => (
                    <React.Fragment key={index}>
                        {/* Mùa + dịch vụ miễn phí */}
                        {offer.season && offer.free_services &&
                            <div className='col-md-3' style={{ paddingBottom: '2%' }}>
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
                            <div className='col-md-3' style={{ paddingBottom: '2%' }}>
                                <div style={{ width: '100%', height: '200px' }}>
                                    <div className='row container chiecla2_hung' style={{
                                        backgroundColor: 'rgba(64, 190, 225, 0.54)',
                                        color: 'white',
                                        height: '100%',
                                        paddingTop: '15%',
                                        paddingLeft: '10%'
                                    }}>
                                        <div className='col-md-5'><div>Total Bill</div><b>{offer.total_bill_threshold} VND</b></div>
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
                            <div className='col-md-3' style={{ paddingBottom: '2%' }}>
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
                            <div className='col-md-3' style={{ paddingBottom: '2%' }}>
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

            <div>
                <form action="">
                    
                </form>
            </div>
        </>
    );
}

export default EditOffer;