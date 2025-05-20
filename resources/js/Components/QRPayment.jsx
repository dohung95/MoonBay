import React from "react";

const QRPayment = ({ amount, onClose, onConfirm, isDeposit }) => {
  const qrURL = `https://img.vietqr.io/image/MB-9567899995-compact2.png?amount=${amount}&addInfo=${isDeposit ? 'Deposit%20for%20room%20booking' : 'Payment%20for%20room%20booking'}&accountName=HotelBookingVN`;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h4>Scan QR Code to {isDeposit ? 'Pay Deposit' : 'Pay Full Amount'}</h4>
        <p><strong>{isDeposit ? 'Deposit Amount (20%)' : 'Total Amount'}:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
        <img src={qrURL} alt="QR Code" width="300" />
        <p className="mt-2">Transfer Note: <b>{isDeposit ? 'Deposit for room booking' : 'Payment for room booking'}</b></p>
        <div className="mt-3 d-flex justify-content-between">
          <button className="btn btn-success" onClick={handleConfirm}>I Have Transferred</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;