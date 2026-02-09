import { verifyOtpApi } from "@/services/mail/mailManageMentApi";
import { activateAccountApi } from "@/services/user/currentUserProfileApi"; // [NEW] Import API active
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { useAppDispatch } from "@/features/hooks"; // [NEW]
import { getCurrentUserSession } from "@/features/slices/authThunk"; // [NEW]

const ActiveAccountVerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const email = location.state?.email;
  const otpType = location.state?.type || "USER_FORGET_PASSWORD"; // Lấy type từ state

  useEffect(() => {
    if (!email) {
      navigate("/auth"); // Hoặc trang login tuỳ ý
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!otp || otp.length < 6) {
      toast.error("Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify OTP
      const response = await verifyOtpApi({
        otp: otp,
        mailRecipient: email,
        otpType: otpType, // Truyền đúng type (ACCOUNT_ACTIVATION)
      });

      const resData = response.data;

      if (resData.errorCode === 200 && resData.data.isValid === true) {
        // --- LOGIC RIÊNG CHO KÍCH HOẠT TÀI KHOẢN ---
        if (otpType === "ACCOUNT_ACTIVATION") {
          try {
            // 2. Gọi API Activate
            await activateAccountApi();

            toast.success("Kích hoạt tài khoản thành công!");

            // 3. Cập nhật lại thông tin user trong Redux để nút Active biến mất
            await dispatch(getCurrentUserSession());

            // 4. Quay về trang Profile
            navigate("/app/profile/user-info");
          } catch (actErr) {
            toast.error(
              getErrorMessage(
                actErr,
                "Lỗi khi kích hoạt tài khoản sau khi xác thực OTP",
              ),
            );
          }
        }
        // --- LOGIC CŨ CHO QUÊN MẬT KHẨU ---
        else {
          toast.success("Xác thực OTP thành công");
          if (resData.data.resetPasswordToken) {
            localStorage.setItem(
              "resetPasswordToken",
              resData.data.resetPasswordToken,
            );
          }
          navigate("/forgot-password/reset-password", {
            state: { email: email },
          });
        }
      } else {
        toast.error("Mã OTP không chính xác hoặc đã hết hạn.");
      }
    } catch (error_) {
      toast.error(getErrorMessage(error_, "Xác thực OTP thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Giữ nguyên UI cũ của bạn, chỉ bọc thêm div ngoài cho đẹp nếu verify page dùng chung layout */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xác thực OTP</h1>
          <p className="text-gray-500 text-sm">
            Nhập mã 6 số chúng tôi đã gửi đến email
            <br />
            <span className="font-medium text-purple-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
              Mã OTP
            </Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replaceAll(/\D/g, ""))}
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg text-center text-xl tracking-[0.5em] font-semibold"
              required
              maxLength={6}
              placeholder="......"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveAccountVerifyOtpPage;
