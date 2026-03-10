// components/PaymentSection.jsx
import { QRCodeCanvas } from 'qrcode.react'; // npm install qrcode.react

export default function PaymentSection({ amount, orderId }) {
  // Replace with the Admin's UPI ID
  const upiId = "alanroyff101@oksbi"; 
  const upiUrl = `upi://pay?pa=${upiId}&pn=FishingStore&am=${amount}&tr=${orderId}&cu=INR`;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold mb-4">Scan to Pay: ₹{amount}</h3>
      
      <QRCodeCanvas value={upiUrl} size={200} level={"H"} />
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        Scan with GPay, PhonePe, or Paytm.<br/>
        <strong>Amount is pre-filled.</strong>
      </p>
    </div>
  );
}