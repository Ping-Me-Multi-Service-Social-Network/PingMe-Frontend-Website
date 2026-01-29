import { verifyOtpApi } from "@/services/mail/mailManageMentApi";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    try {
      const response = await verifyOtpApi({
        otp: otp,
        mailRecipient: email,
        otpType: "USER_FORGET_PASSWORD",
      });

      const resData = response.data;

      if (resData.errorCode === 200 && resData.data.isValid === true) {
        console.log("OTP Validated:", resData.data);

        if (resData.data.resetPasswordToken) {
          localStorage.setItem(
            "resetPasswordToken",
            resData.data.resetPasswordToken,
          );
        }

        navigate("/forgot-password/reset-password", {
          state: {
            email: email,
          },
        });
      } else {
        alert("Mã OTP không chính xác hoặc đã hết hạn.");
      }
    } catch (error) {
      console.error("Verify OTP Error:", error);
      alert("Có lỗi xảy ra khi xác thực OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>

      {/* Hiển thị email để user biết đang verify cho nick nào */}
      <p className="text-sm text-gray-500 mb-6">
        Sent to: <span className="font-medium text-gray-700">{email}</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter the OTP code
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg"
          required
          maxLength={6} // Thường OTP có 6 số
          placeholder="XXXXXX"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-4 text-white py-2 px-4 rounded transition-colors ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
