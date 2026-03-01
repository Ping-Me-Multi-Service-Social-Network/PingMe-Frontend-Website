import { useTranslation } from "react-i18next";

export default function LandingFooter() {
  const { t } = useTranslation("landing");
  return (
    <footer className="py-4 text-center border-t border-gray-200 bg-white">
      <p className="text-sm text-gray-500">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}
