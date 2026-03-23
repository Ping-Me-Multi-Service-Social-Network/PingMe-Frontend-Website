import { useState } from "react";
import type { WeatherResponse } from "@/types/weather";
import {
  Cloud,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { formatMessageTime } from "../../utils/formatMessageTime.ts";
import type { ChatTheme } from "../../utils/chatThemes.ts";
import { useTranslation } from "react-i18next";

interface WeatherMessageBubbleProps {
  weather: WeatherResponse;
  createdAt: string;
  isSent: boolean;
  theme: ChatTheme;
}

export default function WeatherMessageBubble({
  weather,
  createdAt,
  isSent,
  theme,
}: WeatherMessageBubbleProps) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation("chat");

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const renderWeatherSummary = () => (
    <div
      onClick={() => setShowModal(true)}
      className={`${isSent
          ? theme.messages.sentBubbleText
          : theme.messages.receivedBubbleText
        } rounded-2xl ${isSent ? "rounded-br-md" : "rounded-bl-md"
        } px-4 py-3 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 max-w-sm ${!isSent && `border ${theme.messages.receivedBubbleBorder}`
        }`}
      style={isSent ? theme.messages.sentBubbleStyle : theme.messages.receivedBubbleStyle}
    >
      <div className="flex items-center gap-3">
        <img
          src={getWeatherIcon(weather.weather[0].icon) || "/placeholder.svg"}
          alt={weather.weather[0].description}
          className="w-16 h-16"
        />
        <div className="flex-1">
          <div className="font-semibold text-lg">{weather.name}</div>
          <div className="text-2xl font-bold">
            {Math.round(weather.main.temp)}°C
          </div>
          <div className="text-sm capitalize">
            {weather.weather[0].description}
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-70">{t("bubbles.weather.tapToView")}</div>
    </div>
  );

  const renderWeatherDetail = () => (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t("bubbles.weather.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'oklch(0.95 0.04 240)' }}>
            <div>
              <div className="text-3xl font-bold">
                {weather.name}, {weather.sys.country}
              </div>
              <div className="text-5xl font-bold mt-2">
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="text-lg capitalize mt-1">
                {weather.weather[0].description}
              </div>
            </div>
            <img
              src={
                getWeatherIcon(weather.weather[0].icon) || "/placeholder.svg"
              }
              alt={weather.weather[0].description}
              className="w-24 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Gauge className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.feelsLike")}</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(weather.main.feels_like)}°C
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Droplets className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.humidity")}</span>
              </div>
              <div className="text-2xl font-bold">{weather.main.humidity}%</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Wind className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.windSpeed")}</span>
              </div>
              <div className="text-2xl font-bold">{weather.wind.speed} m/s</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Cloud className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.cloudiness")}</span>
              </div>
              <div className="text-2xl font-bold">{weather.clouds.all}%</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.pressure")}</span>
              </div>
              <div className="text-2xl font-bold">
                {weather.main.pressure} hPa
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Gauge className="w-5 h-5" />
                <span className="font-medium">{t("bubbles.weather.temperature")}</span>
              </div>
              <div className="text-sm">
                <div>Min: {Math.round(weather.main.temp_min)}°C</div>
                <div>Max: {Math.round(weather.main.temp_max)}°C</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around p-4 rounded-lg" style={{ background: 'oklch(0.96 0.04 70)' }}>
            <div className="flex items-center gap-2">
              <Sunrise className="w-6 h-6 text-orange-500" />
              <div>
                <div className="text-xs text-gray-600">{t("bubbles.weather.sunrise")}</div>
                <div className="font-semibold">
                  {formatTime(weather.sys.sunrise)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-6 h-6 text-orange-600" />
              <div>
                <div className="text-xs text-gray-600">{t("bubbles.weather.sunset")}</div>
                <div className="font-semibold">
                  {formatTime(weather.sys.sunset)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-4`}>
      <div className="max-w-[80%]">
        {renderWeatherSummary()}
        {renderWeatherDetail()}
        <div
          className={`text-xs text-muted-foreground mt-1.5 ${isSent ? "text-right" : ""
            } opacity-70`}
        >
          {formatMessageTime(createdAt)}
        </div>
      </div>
    </div>
  );
}
