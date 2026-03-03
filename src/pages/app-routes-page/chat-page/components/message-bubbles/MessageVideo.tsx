import { useTranslation } from "react-i18next";

interface MessageVideoProps {
  src: string;
}

export default function MessageVideo({ src }: MessageVideoProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="relative max-w-md">
      <video
        src={src}
        controls
        className="w-full min-w-[300px] max-w-[500px] max-h-[500px] rounded-lg"
        preload="metadata"
      >
        {t("bubbles.video.unsupported")}
      </video>
    </div>
  );
}
