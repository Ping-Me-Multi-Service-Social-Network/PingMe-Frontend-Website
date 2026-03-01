import { resetPasswordApi } from "@/services/mail/mailManageMentApi";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { useTranslation } from "react-i18next";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("landing");

  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("resetPasswordToken"));

  useEffect(() => {
    if (!token) {
      toast.error(t("forgotPassword.resetStep.fail"));
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (newPassword !== confirmPassword) {
      toast.error(t("auth.fields.confirmPassword"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("auth.fields.passwordMin"));
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
        toast.success(t("forgotPassword.resetStep.success"));

        localStorage.removeItem("resetPasswordToken");

        // Chuyển trang
        navigate("/auth?mode=login");
      } else {
        toast.error(resData.errorMessage || t("forgotPassword.resetStep.fail"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t("forgotPassword.resetStep.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("forgotPassword.resetStep.title")}</h1>
        <p className="text-gray-500 text-sm">
          {t("forgotPassword.resetStep.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-700"
          >
            {t("forgotPassword.resetStep.newPassword")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              placeholder={t("forgotPassword.resetStep.newPassword")}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <PasswordStrengthMeter password={newPassword} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            {t("forgotPassword.resetStep.confirmPassword")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pl-12 pr-12 h-12 border rounded-lg focus:outline-none focus:ring-2 ${newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                }`}
              placeholder={t("forgotPassword.resetStep.confirmPassword")}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {t("auth.fields.confirmPassword")}
              </p>
            )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t("forgotPassword.resetStep.updating")}
            </>
          ) : (
            t("forgotPassword.resetStep.btnReset")
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
