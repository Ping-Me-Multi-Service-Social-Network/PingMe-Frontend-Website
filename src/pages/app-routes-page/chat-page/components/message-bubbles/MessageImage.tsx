interface MessageImageProps {
  src: string;
  alt?: string;
}

export default function MessageImage({
  src,
  alt = "Image",
}: MessageImageProps) {
  return (
    <div className="relative group">
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="min-w-[300px] max-w-[500px] max-h-[500px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(src, "_blank")}
      />
    </div>
  );
}
