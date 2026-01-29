import { resetPasswordApi } from "@/services/mail/mailManageMentApi";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("resetPasswordToken"));

  useEffect(() => {
    if (!token) {
      alert("Phiên làm việc hết hạn hoặc không hợp lệ.");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordApi({
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
        resetPasswordToken: token,
      });

      const resData = response.data;

      if (
        resData.errorCode === 200 &&
        resData.data.isPasswordChanged === true
      ) {
        console.log("Password changed successfully");

        localStorage.removeItem("resetPasswordToken");

        // Chuyển trang
        navigate("/auth?mode=login");
      } else {
        alert(resData.errorMessage || "Đổi mật khẩu thất bại.");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="••••••••"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              newPassword && confirmPassword && newPassword !== confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
            placeholder="••••••••"
          />
          {newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full text-white py-2 px-4 rounded transition-colors ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
