import react from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import '../../css/my_css/booking.css';
import rooms from './rooms.json';

const BookNow = ({ checkLogins }) => {
    
    return (
        <div className="bg-dark rooms_booking">
            <div className="container text-white" >
                <h2 className="text-center mb-4">BEST SELLER</h2>
                <Swiper
                    modules={[Pagination, Autoplay]}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false
                    }}
                    speed={3000}
                    loop={true}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    className="room-slider"
                >
                    {rooms.map((room) => (
                        <SwiperSlide key={room.id} className="position-relative">
                            <div className="room-card">
                                {/* Hình ảnh với nút Book Now */}
                                <div className="image-wrapper">
                                    <img
                                        src={room.image}
                                        alt={room.name}
                                        className="room-image"
                                    />
                                    <button onClick={checkLogins} className="btn btn-warning book-now-btn">
                                        Book Now
                                    </button>
                                </div>
                                {/* Thông tin phòng bên dưới hình ảnh */}
                                <div className="room-info">
                                    <h3 className="room-name">{room.name}</h3>
                                    <p className="room-price">{room.price}</p>
                                    <p className="room-details">{room.details}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
};

export default BookNow;