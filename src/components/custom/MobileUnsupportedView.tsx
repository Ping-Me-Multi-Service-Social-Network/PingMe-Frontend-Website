import { useTranslation } from "react-i18next";

export default function MobileUnsupportedView() {
  const { t } = useTranslation("common");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card p-4 shadow-sm">
          <img
            src="/icons/logo.webp"
            alt={t("mobileUnsupported.previewAlt")}
            className="h-full w-full object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("mobileUnsupported.title")}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          {t("mobileUnsupported.description")}
        </p>
      </section>
    </main>
  );
}