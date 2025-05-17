import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import Banner from "./banner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Complaints = ({ checkLogins }) => {
  const { user, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    customer_email: user?.email || "",
    customer_phone: user?.phone || "",
    complaint_type: "",
    description: "",
    contact_preference: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto fill lại khi user thay đổi
    setFormData((prev) => ({
      ...prev,
      user_id: user?.id || "",
      name: user?.name || "",
      customer_email: user?.email || "",
      customer_phone: user?.phone || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Yes" : "No") : value,
    }));
  };
  

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!formData.complaint_type || !formData.description) {
      toast.error("Vui lòng chọn loại khiếu nại và nhập nội dung!");
      return;
    }

    if (!token || token === "null" || token === "") {
      toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setLoading(true);
      console.log("Dữ liệu gửi lên:", formData);

      await axios.post(
        "/api/complaints",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Gửi khiếu nại thành công!");

      setFormData((prev) => ({
        ...prev,
        complaint_type: "",
        description: "",
        contact_preference: false,
      }));
    } catch (err) {
      console.error("Lỗi gửi khiếu nại:", err);
      toast.error("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Banner/>
      <ToastContainer />
      <div className="container border p-4 rounded mt-4 mb-4">
      <h4 Align="center">Complaints</h4>

      {user ? (
        <form onSubmit={handleComplaintSubmit}>
          <div className="mb-2">
            <input type="hidden" name="user_id" value={formData.id} readOnly className="form-control" />
          </div>

          <div className="mb-2">
            <label>Họ tên:</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              readOnly
            />
          </div>

          <div className="mb-2">
            <label>Email:</label>
            <input
              type="email"
              name="customer_email"
              className="form-control"
              value={formData.customer_email}
              readOnly
            />
          </div>

          <div className="mb-2">
            <label>Số điện thoại:</label>
            <input
              type="text"
              name="customer_phone"
              className="form-control"
              value={formData.customer_phone}
              readOnly
            />
          </div>

          <div className="mb-2">
            <label>Loại khiếu nại:</label>
            <select
              name="complaint_type"
              className="form-select"
              value={formData.complaint_type}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn loại --</option>
              <option value="Phòng ốc">Phòng ốc</option>
              <option value="Thanh toán">Thanh toán</option>
              <option value="Thái độ nhân viên">Thái độ nhân viên</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="mb-2">
            <label>Nội dung khiếu nại:</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              name="contact_preference"
              checked={formData.contact_preference === 'Yes'}
              onChange={handleChange}
              id="contactPreference"
            />
            <label className="form-check-label" htmlFor="contactPreference">
              Tôi muốn được liên hệ lại
            </label>
          </div>

          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi khiếu nại"}
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
          để gửi khiếu nại.
        </div>
      )}
    </div>
    </>
  );
};

export default Complaints;
