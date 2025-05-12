import '../../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditOffer = () => {
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/special-offers')
            .then(response => {
                const filtered = response.data.filter(offer =>
                    offer.season || offer.free_services || offer.total_bill_threshold || offer.stay_duration_days || offer.other_package_description
                );
                setOffers(filtered);
            })
            .catch(error => {
                console.error("Error fetching offers:", error);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add form submission logic here (e.g., axios.post)
        console.log("Form submitted");
    };

    return (
        <div className="my-4">
            <div className="row justify-content-center" style={{ padding: '0 5%' }}>
                {offers.map((offer, index) => (
                    <React.Fragment key={index}>
                        {/* Season + Free Services */}
                        {offer.season && offer.free_services && (
                            <div className="col-md-3 mb-3">
                                <div
                                    className="chiecla2_hung"
                                    style={{
                                        backgroundImage: `url('/images/Hung/${offer.season.toLowerCase()}.jpg')`,
                                        backgroundSize: 'cover',
                                        width: '100%',
                                        height: '200px',
                                    }}
                                >
                                    <div
                                        className="row container chiecla2_hung"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            color: 'white',
                                            height: '100%',
                                            paddingTop: '15%',
                                            paddingLeft: '10%',
                                        }}
                                    >
                                        <div className="col-md-5">
                                            <div>Season</div>
                                            <b>{offer.season}</b>
                                        </div>
                                        <div className="col-md-5">
                                            <div>Service</div>
                                            <b>{offer.free_services}</b>
                                        </div>
                                        <div className="text-center">
                                            Time: {new Date(offer.season_start).toLocaleDateString('vi-VN')} -{' '}
                                            {new Date(offer.season_end).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bill Discount */}
                        {offer.total_bill_threshold && offer.discount_percent && (
                            <div className="col-md-3 mb-3">
                                <div style={{ width: '100%', height: '200px' }}>
                                    <div
                                        className="row container chiecla2_hung"
                                        style={{
                                            backgroundColor: 'rgba(64, 190, 225, 0.54)',
                                            color: 'white',
                                            height: '100%',
                                            paddingTop: '15%',
                                            paddingLeft: '10%',
                                        }}
                                    >
                                        <div className="col-md-5">
                                            <div>Total Bill</div>
                                            <b>{offer.total_bill_threshold} VND</b>
                                        </div>
                                        <div className="col-md-5">
                                            <div>Discount</div>
                                            <b>{offer.discount_percent}%</b>
                                        </div>
                                        <div className="text-center">
                                            Time: {new Date(offer.discount_start).toLocaleDateString('vi-VN')} -{' '}
                                            {new Date(offer.discount_end).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stay Duration */}
                        {offer.stay_duration_days && offer.gift_description && (
                            <div className="col-md-3 mb-3">
                                <div style={{ width: '100%', height: '200px' }}>
                                    <div
                                        className="row container chiecla1_hung"
                                        style={{
                                            backgroundColor: 'rgba(64, 190, 225, 0.54)',
                                            color: 'white',
                                            height: '100%',
                                            paddingTop: '15%',
                                            paddingLeft: '10%',
                                        }}
                                    >
                                        <div className="col-md-5">
                                            <div>Total days of stay</div>
                                            <b>{offer.stay_duration_days} day</b>
                                        </div>
                                        <div className="col-md-5">
                                            <div>Souvenir</div>
                                            <b>{offer.gift_description}</b>
                                        </div>
                                        <div className="text-center">
                                            Time: {new Date(offer.gift_start).toLocaleDateString('vi-VN')} -{' '}
                                            {new Date(offer.gift_end).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Offer */}
                        {offer.other_package_description && offer.offer_type && (
                            <div className="col-md-3 mb-3">
                                <div
                                    className="chiecla1_hung"
                                    style={{
                                        backgroundImage: "url('/images/Hung/Uudaikhac.jpg')",
                                        backgroundSize: 'cover',
                                        width: '100%',
                                        height: '200px',
                                    }}
                                >
                                    <div
                                        className="row container chiecla1_hung"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            color: 'white',
                                            height: '100%',
                                            paddingTop: '15%',
                                            paddingLeft: '10%',
                                        }}
                                    >
                                        <div className="col-md-5">
                                            <b>{offer.other_package_description}</b>
                                        </div>
                                        <div className="col-md-5">
                                            <b>{offer.offer_type}</b>
                                        </div>
                                        <div className="text-center">
                                            Time: {new Date(offer.other_offer_start).toLocaleDateString('vi-VN')} -{' '}
                                            {new Date(offer.other_offer_end).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <h1 className="text-center mb-4">Edit Offer</h1>

            <div className="accordion container" id="offerAccordion">
                {/* Season Offer Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingSeason">
                        <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseSeason"
                            aria-expanded="true"
                            aria-controls="collapseSeason"
                        >
                            Season Offer
                        </button>
                    </h2>
                    <div
                        id="collapseSeason"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingSeason"
                        data-bs-parent="#offerAccordion"
                    >
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="season" className="form-label">Season</label>
                                    <input type="text" className="form-control" id="season" name="season" />
                                </div>
                                <div className="colubre-md-6 mb-3">
                                    <label htmlFor="free_services" className="form-label">Free Services</label>
                                    <input type="text" className="form-control" id="free_services" name="free_services" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="season_start" className="form-label">Season Start</label>
                                    <input type="date" className="form-control" id="season_start" name="season_start" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="season_end" className="form-label">Season End</label>
                                    <input type="date" className="form-control" id="season_end" name="season_end" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill Discount Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingBill">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseBill"
                            aria-expanded="false"
                            aria-controls="collapseBill"
                        >
                            Bill Discount
                        </button>
                    </h2>
                    <div
                        id="collapseBill"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingBill"
                        data-bs-parent="#offerAccordion"
                    >
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="total_bill_threshold" className="form-label">Total Bill Threshold (VND)</label>
                                    <input type="number" className="form-control" id="total_bill_threshold" name="total_bill_threshold" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="discount_percent" className="form-label">Discount Percent</label>
                                    <input type="number" className="form-control" id="discount_percent" name="discount_percent" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="discount_start" className="form-label">Discount Start</label>
                                    <input type="date" className="form-control" id="discount_start" name="discount_start" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="discount_end" className="form-label">Discount End</label>
                                    <input type="date" className="form-control" id="discount_end" name="discount_end" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stay Duration Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingStay">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseStay"
                            aria-expanded="false"
                            aria-controls="collapseStay"
                        >
                            Stay Duration
                        </button>
                    </h2>
                    <div
                        id="collapseStay"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingStay"
                        data-bs-parent="#offerAccordion"
                    >
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="stay_duration_days" className="form-label">Stay Duration Days</label>
                                    <input type="number" className="form-control" id="stay_duration_days" name="stay_duration_days" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="gift_description" className="form-label">Gift Description</label>
                                    <input type="text" className="form-control" id="gift_description" name="gift_description" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="gift_start" className="form-label">Gift Start</label>
                                    <input type="date" className="form-control" id="gift_start" name="gift_start" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="gift_end" className="form-label">Gift End</label>
                                    <input type="date" className="form-control" id="gift_end" name="gift_end" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Offer Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOther">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseOther"
                            aria-expanded="false"
                            aria-controls="collapseOther"
                        >
                            Other Offer
                        </button>
                    </h2>
                    <div
                        id="collapseOther"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingOther"
                        data-bs-parent="#offerAccordion"
                    >
                        <div className="accordion-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="other_package_description" className="form-label">Package Description</label>
                                    <input type="text" className="form-control" id="other_package_description" name="other_package_description" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="offer_type" className="form-label">Offer Type</label>
                                    <input type="text" className="form-control" id="offer_type" name="offer_type" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="other_offer_start" className="form-label">Offer Start</label>
                                    <input type="date" className="form-control" id="other_offer_start" name="other_offer_start" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="other_offer_end" className="form-label">Offer End</label>
                                    <input type="date" className="form-control" id="other_offer_end" name="other_offer_end" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-4">
                <button type="button" className="btn btn-primary me-2" onClick={handleSubmit}>
                    Submit
                </button>
                <button type="reset" className="btn btn-secondary">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default EditOffer;