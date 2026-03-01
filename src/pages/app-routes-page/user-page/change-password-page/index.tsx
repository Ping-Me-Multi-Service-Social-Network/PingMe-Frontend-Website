import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Eye, EyeOff, Loader2, Lock, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import PasswordStrengthMeter from "@/pages/commons/PasswordStrengthMeter.tsx";
import { updateCurrentUserPasswordApi } from "@/services/user/currentUserProfileApi.ts";
import { useTranslation } from "react-i18next";

const ChangePasswordPage = () => {
  const { t } = useTranslation("profile");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("changePassword.validation.notMatch"));
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error(t("changePassword.validation.minLength"));
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error(t("changePassword.validation.sameAsOld"));
      return;
    }

    setIsLoading(true);

    try {
      await updateCurrentUserPasswordApi({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(t("changePassword.success"));

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, t("changePassword.fail")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Lock className="w-6 h-6 mr-3 text-purple-600" />
          {t("changePassword.title")}
        </h2>
        <p className="text-gray-500 mt-2">
          {t("changePassword.subtitle")}
        </p>
      </div>

      <form id="profile-password-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Password */}
          <div id="profile-current-password" className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm font-medium text-gray-700"
            >
              {t("changePassword.fields.currentPassword")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                placeholder={t("changePassword.fields.currentPasswordPlaceholder")}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div id="profile-new-password" className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700"
            >
              {t("changePassword.fields.newPassword")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder={t("changePassword.fields.newPasswordPlaceholder")}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div id="profile-confirm-password" className="space-y-2 md:col-span-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              {t("changePassword.fields.confirmPassword")} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder={t("changePassword.fields.confirmPasswordPlaceholder")}
                className="pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password Match Indicator */}
            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  {t("changePassword.indicator.notMatch")}
                </p>
              )}
            {formData.confirmPassword &&
              formData.newPassword === formData.confirmPassword && (
                <p className="text-xs text-green-500 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  {t("changePassword.indicator.match")}
                </p>
              )}
          </div>
        </div>

        <PasswordStrengthMeter password={formData.newPassword} />

        {/* Submit Button */}
        <div id="profile-password-submit" className="pt-4">
          <Button
            type="submit"
            disabled={
              isLoading || formData.newPassword !== formData.confirmPassword
            }
            className="h-12 bg-purple-600 hover:bg-purple-700 text-white px-8 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>{t("common.updating")}</span>
              </>
            ) : (
              t("changePassword.updateBtn")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
