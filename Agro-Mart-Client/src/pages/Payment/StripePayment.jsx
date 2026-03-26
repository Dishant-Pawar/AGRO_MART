import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { ThemeContext } from "../../provider/ThemeProvider";

const LocalPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const user = useAuth();
  const { theme } = useContext(ThemeContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = location.state?.totalAmount;
  const cartItems = location.state?.cartItems || [];

  if (!totalAmount || !cartItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-cyan-400 to-blue-300 flex justify-center items-center p-6 text-center">
        <p className="bg-white/90 rounded-lg px-4 py-3 text-red-600 font-medium">
          No payment data found. Please go back to cart and try again.
        </p>
      </div>
    );
  }

  const handleLocalPayment = async () => {
    setIsProcessing(true);
    setError("");

    const paymentInfo = {
      email: user?.email,
      name: user?.displayName,
      totalAmount,
      status: "pending",
      method: "Local-Test",
      transactionId: `LOCAL-${Date.now()}`,
      cartIds: cartItems.map((item) => item._id),
      cartItems: cartItems.map((item) => ({
        productId: item.productId,
        orderedQuantity: item.quantity || 1,
        price: item.price,
        name: item.name,
      })),
      date: new Date().toISOString(),
      invoiceNo: Math.floor(100000 + Math.random() * 900000).toString(),
    };

    try {
      const res = await axiosSecure.post("/payments", paymentInfo);

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Local Test Payment Successful",
          timer: 1500,
          showConfirmButton: false,
          background: `${theme === "dark" ? "#1D232A" : "#ffff"}`,
          color: `${theme === "dark" ? "#ffff" : " #1D232A"}`,
        });
        localStorage.removeItem("cartItems");
        navigate("/shop");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-400 to-blue-300 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-8 space-y-5">
        <h2 className="text-2xl font-semibold text-gray-800">Local Payment</h2>
        <p className="text-gray-600">
          This is a local test checkout. No real Stripe or external gateway is
          used.
        </p>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Items:</span> {cartItems.length}
          </p>
          <p>
            <span className="font-medium">Amount:</span> {totalAmount}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLocalPayment}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Confirm Local Payment"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default LocalPayment;
