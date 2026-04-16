interface MessageImageProps {
  src: string;
  alt?: string;
  mediaUrls?: string[] | null;
}

export default function MessageImage({
  src,
  alt = "Image",
  mediaUrls,
}: MessageImageProps) {
  const images = mediaUrls && mediaUrls.length > 0 ? mediaUrls : [src].filter(Boolean);

  if (images.length === 1) {
    return (
      <div className="relative group">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={alt}
          className="min-w-[150px] max-w-[500px] max-h-[500px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity drop-shadow-sm"
          onClick={() => window.open(images[0], "_blank")}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-[400px]">
      {images.map((imgUrl, idx) => (
        <img
          key={idx}
          src={imgUrl || "/placeholder.svg"}
          alt={`${alt} ${idx + 1}`}
          className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${images.length === 3 && idx === 2 ? 'col-span-2 h-48' : 'h-32'}`}
          onClick={() => window.open(imgUrl, "_blank")}
        />
      ))}
    </div>
  );
}
