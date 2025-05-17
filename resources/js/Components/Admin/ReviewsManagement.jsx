import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar } from 'react-icons/fa';
import SortStart from '../SortStart';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [expandedComments, setExpandedComments] = useState({});
    const [sortRating, setSortRating] = useState('');
    const [filterRating, setFilterRating] = useState(null);
    const [ratingsCount, setRatingsCount] = useState({});
    const [totalReviews, setTotalReviews] = useState(0);




    const fetchReviews = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/reviews', {
                params: {
                    page: pageNumber,
                    sort_rating: sortRating,
                    filter_rating: filterRating,
                },
            });
            setReviews(res.data.reviews.data);  // ✅ FIXED
            setPage(res.data.reviews.current_page);
            setLastPage(res.data.reviews.last_page);
            setTotalReviews(res.data.reviews.total);
            setRatingsCount(res.data.ratingsCount); // nếu có dùng
        } catch (error) {
            console.error('Lỗi khi tải reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa review này?')) {
            try {
                await axios.delete(`/api/reviews/${id}`);
                toast.success("Xóa review thành công!");
                fetchReviews(page, sortRating);
            } catch (error) {
                console.error('Xóa thất bại:', error);
                toast.error("Xóa review thất bại. Vui lòng thử lại.");
            }
        }
    };

    useEffect(() => {
        fetchReviews(page);
    }, [page, sortRating, filterRating]);


    const handlePrev = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNext = () => {
        if (page < lastPage) {
            setPage(page + 1);
        }
    };

    const toggleComment = (id) => {
        setExpandedComments((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSortChange = (e) => {
        setSortRating(e.target.value);
        setPage(1); // reset page khi đổi sort
    };

    const handleFilterRatingChange = (rating) => {
        setFilterRating(rating);
        setPage(1);
    };


    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Reviews</h1>

            {/* Dropdown chọn sort */}
            <div className="row">
                <div className="col-md-6 mb-4">
                    <label className="mr-2">Sắp xếp theo sao:</label>
                    <select
                        value={sortRating}
                        onChange={handleSortChange}
                        className="border p-2 rounded"
                    >
                        <option value="">Mặc định</option>
                        <option value="asc">Tăng dần</option>
                        <option value="desc">Giảm dần</option>
                    </select>
                </div>

                <div className="col-md-6 mb-4">
                    <label className="mr-2">Lọc theo sao:</label>
                    <SortStart selectedRating={filterRating} onChange={handleFilterRatingChange} ratingsCount={ratingsCount} />
                </div>
            </div>


            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="table table-striped table-hover table-responsive shadow-md rounded-lg table-bordered">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-8 text-left">UserID</th>
                                    <th className="py-3 px-4 text-left">Email</th>
                                    <th className="py-3 px-4 text-left">Rating</th>
                                    <th className="py-3 px-4 text-left">Comment</th>
                                    <th className="py-3 px-4 text-left">Date</th>
                                    <th className="py-3 px-4 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.id} className="border-b">
                                        <td className="py-2 px-4">{review.id}</td>
                                        <td className="py-2 px-4">{review.user_id}</td>
                                        <td className="py-2 px-4">{review.email}</td>
                                        <td className="py-2 px-6 text-yellow-500 min-w-[100px]">
                                            <div className="flex items-center whitespace-nowrap">
                                                {[...Array(5)].map((_, i) =>
                                                    i < review.rating ? (
                                                        <FaStar key={i} color="#F59E0B" />
                                                    ) : (
                                                        <FaRegStar key={i} color="#F59E0B" />
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                                            {expandedComments[review.id] ? (
                                                <>
                                                    {review.comment}
                                                    <button
                                                        onClick={() => toggleComment(review.id)}
                                                        className="btn btn-link ml-2 underline"
                                                    >
                                                        Thu gọn
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {review.comment.length > 100
                                                        ? `${review.comment.slice(0, 100)}...`
                                                        : review.comment}
                                                    {review.comment.length > 100 && (
                                                        <button
                                                            onClick={() => toggleComment(review.id)}
                                                            className="btn btn-link ml-2 underline"
                                                        >
                                                            Xem thêm
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="py-2 px-4">
                                            {new Date(review.created_at).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false,
                                            })}
                                        </td>
                                        <td className="py-2 px-4">
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="btn btn-danger px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reviews.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            Không có review nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <p className="text-center mb-6 text-gray-700">Tổng số đánh giá: <strong>{totalReviews}</strong></p>
                    </div>
                    <div className="mt-4 mb-4 flex justify-center space-x-4" align="center">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className="btn btn-primary px-4 py-2 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center">
                            &nbsp;Trang {page} / {lastPage} &nbsp;
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page === lastPage}
                            className="btn btn-primary px-4 py-2 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewsManagement;
