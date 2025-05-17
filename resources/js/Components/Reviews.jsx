import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { FaStar, FaRegStar } from "react-icons/fa";
import SortStart from "./SortStart";
import Banner from "./banner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sitemapmini from "./sitemapmini";

const Reviews = ({ checkLogins }) => {
  const { user, token } = useContext(AuthContext);
  const [reviewForm, setReviewForm] = useState({
    user_id: user?.id || "",
    email: user?.email || "",
    rating: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterRating, setFilterRating] = useState(null);
  const [ratingsCount, setRatingsCount] = useState({});
  const [totalReviews, setTotalReviews] = useState(0);
  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Reviews' }
  ];


  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  useEffect(() => {
    setReviewForm((prev) => ({
      ...prev,
      user_id: user?.id || "",
      email: user?.email || "",
    }));
  }, [user]);


  const fetchReviews = async (page = 1) => {
    try {
      const response = await axios.get(`/api/reviews`, {
        params: {
          page,
          filter_rating: filterRating,
        },
      });

      const paginated = response.data.reviews;

      setReviews(paginated.data); // ✅ lấy mảng đánh giá
      setLastPage(paginated.last_page); // ✅ lấy số trang cuối
      setRatingsCount(response.data.ratingsCount || {});
      setTotalReviews(response.data.reviews.total);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    }
  };


  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, filterRating]);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.rating || !reviewForm.comment) {
      toast.error("Vui lòng chọn số sao và nhập nhận xét!");
      return;
    }

    if (!token || token === "null" || token === "") {
      toast.error("Token không hợp lệ, vui lòng đăng nhập lại!");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "/api/reviews",
        {
          user_id: user?.id,
          email: user?.email,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Cảm ơn bạn đã gửi đánh giá!");

      setCurrentPage(lastPage);
      fetchReviews(lastPage);

      setReviewForm({
        user_id: reviewForm.user_id,
        email: reviewForm.email,
        rating: "",
        comment: "",
      });
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      toast.error("Không thể gửi đánh giá, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const toggleComment = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < lastPage) setCurrentPage(currentPage + 1);
  };

  const maskEmail = (email) => {
    if (!email) return "Khách hàng";
    const [user, domain] = email.split("@");
    if (!domain) return "Khách hàng";

    const visiblePart = user.slice(0, 3);
    return `${visiblePart}***@${domain}`;
  };

  const handleFilterRatingChange = (rating) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };



  return (
    <>
      <Banner />
      <ToastContainer />
      <div className="container border p-4 rounded mt-4 mb-4">
        <Sitemapmini items={sitemap} />
        <h3 Align="center">Đánh giá của khách hàng</h3>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="border p-3 rounded mb-4">
            <h5>Gửi đánh giá của bạn</h5>

            <input type="hidden" value={reviewForm.user_id} />

            <input
              type="email"
              className="form-control mb-2"
              value={reviewForm.email}
              readOnly
            />

            <select
              className="form-select mb-2"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              required
            >
              <option value="">Chọn số sao</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="2">⭐⭐</option>
              <option value="1">⭐</option>
            </select>

            <textarea
              className="form-control mb-2"
              placeholder="Chia sẻ trải nghiệm của bạn"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              rows="3"
            ></textarea>

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        ) : (
          <div className="alert alert-info" Align="center">
            Vui lòng{" "}
            <button
              onClick={checkLogins}
              className="btn btn-link p-0"
              style={{ textDecoration: "none" }}
            >
              đăng nhập
            </button>{" "}
            để gửi đánh giá của bạn.
          </div>
        )}

        <div>
          <p className="text-center mb-6 text-gray-700">Tổng số đánh giá: <strong>{totalReviews}</strong></p>
        </div>

        <div className="mb-3">
          <label className="me-2">Lọc theo số sao:</label>
          <SortStart
            selectedRating={filterRating}
            onChange={handleFilterRatingChange}
            ratingsCount={ratingsCount}
          />

        </div>

        {Array.isArray(reviews) && reviews.length > 0 ? (
          <>
            <div className="text-center">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded p-3 mb-3" style={{ height: "150px", overflow: "hidden", position: "relative", alignContent: "center" }}>
                  <strong>{maskEmail(review.email) || "Khách hàng"}</strong> -{" "}
                  {[...Array(5)].map((_, i) =>
                    i < review.rating ? (
                      <FaStar key={i} color="#F59E0B" />
                    ) : (
                      <FaRegStar key={i} color="#F59E0B" />
                    )
                  )}
                  <p className="mt-2" style={{ textAlign: "center" }}>
                    {expandedComments[review.id] ? (
                      <>
                        {review.comment}
                        <button
                          className="btn btn-link p-0 ms-2"
                          onClick={() => toggleComment(review.id)}
                        >
                          Ẩn
                        </button>
                      </>
                    ) : (
                      <>
                        {review.comment.length > 100
                          ? `${review.comment.slice(0, 100)}...`
                          : review.comment}
                        {review.comment.length > 100 && (
                          <button
                            className="btn btn-link p-0 ms-2"
                            onClick={() => toggleComment(review.id)}
                          >
                            Xem thêm
                          </button>
                        )}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-center align-items-center gap-3 mt-3 mb-3">
              <button
                className="btn btn-primary"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span>
                Trang {currentPage} / {lastPage}
              </span>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={currentPage === lastPage}
              >
                Tiếp theo
              </button>
            </div>
          </>
        ) : (
          <p className="mb-4">Chưa có đánh giá nào.</p>
        )}
      </div>
    </>
  );
};

export default Reviews;
