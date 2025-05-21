import React from "react";

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount);

  // Nếu giá nhỏ hơn 10.000 thì giả định là "nghìn đồng" (ví dụ: 500 = 500k)
  const amountInDong = amount < 10000 ? amount * 1000 : amount;

  return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0, // VND không có số lẻ
  }).format(amountInDong);
};

const QRPayment = ({ amount, onClose, onConfirm, isDeposit }) => {
  const safeAmount = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount);
    return amount < 10000 ? amount * 1000 : amount;
  };

  const qrAmount = safeAmount(amount);

  const qrURL = `https://img.vietqr.io/image/MB-9567899995-compact2.png?amount=${qrAmount}&addInfo=${isDeposit ? 'Deposit%20for%20room%20booking' : 'Payment%20for%20room%20booking'}&accountName=HotelBookingVN`;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h4>Scan QR Code to {isDeposit ? 'Pay Deposit' : 'Pay Full Amount'}</h4>
        <p><strong>{isDeposit ? 'Deposit Amount (20%)' : 'Total Amount'}:</strong> {formatCurrency(amount)}</p>
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