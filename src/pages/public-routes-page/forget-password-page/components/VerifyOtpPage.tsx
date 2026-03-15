import { verifyOtpApi } from "@/services/authentication/authOtpApi";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { useTranslation } from "react-i18next";

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("landing");

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

    if (!otp || otp.length < 6) {
      toast.error(t("forgotPassword.otpStep.fail"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtpApi({
        otp: otp,
        mailRecipient: email,
        authOtpType: "USER_FORGET_PASSWORD",
      });

      const resData = response.data;

      if (resData.errorCode === 200 && resData.data.isValid === true) {
        toast.success(t("forgotPassword.otpStep.success"));

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
        toast.error(t("forgotPassword.otpStep.fail"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t("forgotPassword.otpStep.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <ShieldCheck className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("forgotPassword.otpStep.title")}</h1>
        <p className="text-gray-500 text-sm">
          {t("forgotPassword.otpStep.subtitle", { email })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
            {t("forgotPassword.otpStep.otpLabel")}
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
              {t("forgotPassword.otpStep.verifying")}
            </>
          ) : (
            t("forgotPassword.otpStep.btnVerify")
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("forgotPassword.emailStep.backToLogin")}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
