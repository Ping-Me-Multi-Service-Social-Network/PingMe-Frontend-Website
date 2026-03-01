import i18n from "@/i18n";

export const getPasswordStrength = (password: string) => {
  if (password.length === 0) return { strength: 0, text: "", color: "" };
  if (password.length < 6)
    return { strength: 1, text: i18n.t("common:passwordStrength.weak"), color: "text-red-500" };
  if (password.length < 8)
    return { strength: 2, text: i18n.t("common:passwordStrength.medium"), color: "text-yellow-500" };
  if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { strength: 4, text: i18n.t("common:passwordStrength.veryStrong"), color: "text-green-500" };
  }
  return { strength: 3, text: i18n.t("common:passwordStrength.strong"), color: "text-blue-500" };
};

export const getUserInitials = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
