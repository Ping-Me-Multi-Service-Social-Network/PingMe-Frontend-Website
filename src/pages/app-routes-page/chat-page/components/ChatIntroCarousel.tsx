import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, ShieldCheck, Sparkle, ArrowRightCircle } from "lucide-react";

export function ChatIntroCarousel() {
  const { t } = useTranslation("chat");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <MessageSquare className="w-16 h-16 text-purple-500 animate-pulse" />,
      title: t("introCarousel.slide1.title"),
      description: t("introCarousel.slide1.description"),
      bgGradient: "from-purple-50 to-indigo-50",
      accentColor: "bg-purple-600",
      visual: (
        <div className="relative w-72 h-48 mx-auto mt-6">
          <div className="absolute top-0 left-0 p-3 bg-white rounded-2xl shadow-md max-w-[180px] border border-gray-100 transform -rotate-6 animate-bounce-slow">
            <p className="text-xs font-medium text-gray-800">{t("introCarousel.slide1.bubble1")}</p>
          </div>
          <div className="absolute bottom-4 right-0 p-3 bg-purple-600 text-white rounded-2xl shadow-lg max-w-[180px] transform rotate-3 animate-float">
            <p className="text-xs">{t("introCarousel.slide1.bubble2")}</p>
          </div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      )
    },
    {
      icon: <ShieldCheck className="w-16 h-16 text-emerald-500" />,
      title: t("introCarousel.slide2.title"),
      description: t("introCarousel.slide2.description"),
      bgGradient: "from-emerald-50 to-teal-50",
      accentColor: "bg-emerald-600",
      visual: (
        <div className="relative w-72 h-48 mx-auto mt-6 flex items-center justify-center">
          <div className="relative w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-emerald-50">
            <div className="absolute inset-2 border-2 border-dashed border-emerald-200 rounded-2xl animate-spin-slow"></div>
            <ShieldCheck className="w-14 h-14 text-emerald-600 drop-shadow-sm" />
          </div>
          <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-emerald-400 animate-ping"></div>
          <div className="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-teal-400 animate-pulse"></div>
        </div>
      )
    },
    {
      icon: <Sparkle className="w-16 h-16 text-indigo-500 animate-spin-slow" />,
      title: t("introCarousel.slide3.title"),
      description: t("introCarousel.slide3.description"),
      bgGradient: "from-indigo-50 to-pink-50",
      accentColor: "bg-indigo-600",
      visual: (
        <div className="relative w-72 h-48 mx-auto mt-6 flex items-center justify-center">
          <div className="absolute flex gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center animate-bounce animation-delay-100">
              <Sparkle className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center animate-bounce animation-delay-300">
              <Sparkle className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center animate-bounce animation-delay-500">
              <Sparkle className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <svg className="absolute w-64 h-40 text-indigo-200 opacity-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="1 1"/>
          </svg>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-700 bg-gradient-to-br ${slides[currentSlide].bgGradient}`}>
      <div className="max-w-md w-full text-center space-y-6">
        {/* Visual Frame */}
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/50 aspect-[4/3] flex flex-col justify-center overflow-hidden transition-all duration-500">
          {slides[currentSlide].visual}
        </div>

        {/* Text Area */}
        <div className="space-y-3 px-4">
          <div className="flex justify-center mb-2">
            {slides[currentSlide].icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-300">
            {slides[currentSlide].title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed font-light transition-all duration-300">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Indicators and Interactive Button */}
        <div className="flex flex-col items-center gap-4">
          {/* Indicator dots */}
          <div className="flex items-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  currentSlide === index 
                    ? `w-6 ${slides[currentSlide].accentColor}` 
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 font-medium flex items-center gap-1 animate-pulse">
            {t("introCarousel.sidebarNotice")} <ArrowRightCircle className="w-3 h-3 rotate-180" />
          </p>
        </div>
      </div>
      
      {/* Thêm style inline hỗ trợ animation mượt */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%) rotate(-6deg); }
          50% { transform: translateY(0) rotate(-6deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-3%) rotate(3deg); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(15px, -15px) scale(1.1); }
          66% { transform: translate(-10px, 10px) scale(0.9); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
}
