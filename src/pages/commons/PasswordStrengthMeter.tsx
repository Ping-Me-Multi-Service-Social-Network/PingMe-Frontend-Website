import { CheckCircle, X } from "lucide-react";
import { getPasswordStrength } from "@/utils/authFieldHandler.ts";
import { useTranslation } from "react-i18next";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const PasswordStrengthMeter = ({
  password,
  className = "",
}: PasswordStrengthMeterProps) => {
  const { t } = useTranslation("common");
  const passwordStrength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div
      className={`space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">
          {t("passwordStrength.label")}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength === 1
                ? "bg-red-500 w-1/4"
                : passwordStrength.strength === 2
                  ? "bg-yellow-500 w-2/4"
                  : passwordStrength.strength === 3
                    ? "bg-blue-500 w-3/4"
                    : passwordStrength.strength === 4
                      ? "bg-green-500 w-full"
                      : "w-0"
              }`}
          />
        </div>
        <span className={`text-sm font-medium ${passwordStrength.color}`}>
          {passwordStrength.text}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <ul className="space-y-1">
          <li
            className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-600" : "text-gray-400"
              }`}
          >
            {password.length >= 8 ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t("passwordStrength.minChars")}</span>
          </li>
          <li
            className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"
              }`}
          >
            {/[A-Z]/.test(password) ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t("passwordStrength.uppercase")}</span>
          </li>
        </ul>
        <ul className="space-y-1">
          <li
            className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"
              }`}
          >
            {/[a-z]/.test(password) ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t("passwordStrength.lowercase")}</span>
          </li>
          <li
            className={`flex items-center space-x-2 ${/\d/.test(password) ? "text-green-600" : "text-gray-400"
              }`}
          >
            {/\d/.test(password) ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t("passwordStrength.number")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
