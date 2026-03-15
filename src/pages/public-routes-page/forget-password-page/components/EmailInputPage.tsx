import { sendOtpToEmailApi } from "@/services/authentication/authOtpApi";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler";
import { useTranslation } from "react-i18next";
import { Turnstile } from "@marsidev/react-turnstile";

const EmailInputPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("landing");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("forgotPassword.emailStep.emailLabel"));
      return;
    }

    if (!turnstileToken) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendOtpToEmailApi({
        email: email,
        otpType: "USER_FORGET_PASSWORD",
        turnstileToken: turnstileToken,
      });

      const resData = response.data;

      if (resData.errorCode === 200 && resData.data.isSent === true) {
        toast.success(t("forgotPassword.emailStep.success"));
        navigate("/forgot-password/verify-otp", { state: { email: email } });
      } else {
        toast.error(resData.errorMessage || t("forgotPassword.emailStep.fail"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t("forgotPassword.emailStep.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("forgotPassword.emailStep.title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {t("forgotPassword.emailStep.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("forgotPassword.emailStep.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder={t("auth.fields.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-center my-2">
          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
            options={{ theme: "light" }}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isLoading || !turnstileToken}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t("forgotPassword.emailStep.sending")}
            </>
          ) : (
            t("forgotPassword.emailStep.btnSend")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/auth?mode=login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("forgotPassword.emailStep.backToLogin")}
        </Link>
      </div>
    </div>
  );
};

export default EmailInputPage;
