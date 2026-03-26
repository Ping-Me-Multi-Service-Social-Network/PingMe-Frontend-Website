import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileFieldProps {
  onSuccess: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

/**
 * Centred Cloudflare Turnstile widget with the standard auth-form chrome
 * (rounded container, inner shadow, light theme).
 */
export default function TurnstileField({
  onSuccess,
  onError,
  onExpire,
}: Readonly<TurnstileFieldProps>) {
  return (
    <div className="flex justify-center rounded-[16px] overflow-hidden shadow-inner ring-1 ring-black/5 bg-black/5 p-1">
      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{ theme: "light" }}
      />
    </div>
  );
}
