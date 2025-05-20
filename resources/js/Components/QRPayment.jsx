import React from "react";

const QRPayment = ({ amount, onClose, onConfirm }) => {
  const qrURL = `https://img.vietqr.io/image/MB-9567899995-compact2.png?amount=${amount}&addInfo=Payment%20for%20room%20booking&accountName=HotelBookingVN`;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h4>Scan QR Code to Transfer</h4>
        <p><strong>Amount:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
        <img src={qrURL} alt="QR Code" width="300" />
        <p className="mt-2">Transfer Note: <b>Payment for room booking</b></p>
        <div className="mt-3 d-flex justify-content-between">
          <button className="btn btn-success" onClick={handleConfirm}>I Have Transferred</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;