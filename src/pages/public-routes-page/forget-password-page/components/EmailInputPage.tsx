import { sendOtpToEmailApi } from "@/services/mail/mailManageMentApi";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailInputPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    try {
      const response = await sendOtpToEmailApi({
        email: email,
        otpType: "USER_FORGET_PASSWORD",
      });

      const resData = response.data;

      if (resData.errorCode === 200 && resData.data.isSent === true) {
        console.log("OTP Sent:", resData.data);
        navigate("/forgot-password/verify-otp", { state: { email: email } });
      } else {
        alert(resData.errorMessage || "Gửi OTP thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Có lỗi xảy ra, vui lòng kiểm tra lại email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter your email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="example@gmail.com"
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
          {isLoading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default EmailInputPage;
