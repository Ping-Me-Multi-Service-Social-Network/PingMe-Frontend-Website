export function HeroSection() {
  return (
    <div className="border-b border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "url(/blog-wallpaper.png)",
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">
          Khám Phá Blog Của Chúng Tôi
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl text-pretty">
          Những hiểu biết sâu sắc, hướng dẫn và câu chuyện về giao tiếp và công
          nghệ hiện đại.
        </p>
      </div>
    </div>
  );
}
