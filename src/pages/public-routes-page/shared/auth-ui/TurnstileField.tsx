import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileFieldProps {
  onSuccess: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

/**
 * Centred Cloudflare Turnstile widget for auth forms.
 */
export default function TurnstileField({
  onSuccess,
  onError,
  onExpire,
}: Readonly<TurnstileFieldProps>) {
  return (
    <div className="flex justify-center overflow-hidden">
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
