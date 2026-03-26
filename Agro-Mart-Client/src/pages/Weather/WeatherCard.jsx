import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGeolocation from "../../hooks/useGeolocation";
import { requestNotificationPermission } from "../../store/requestNotificationPermission";

const API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY || import.meta.env.VITE_Weather_API_KEY;

const WeatherCard = ({ onWeatherTypeChange, setWeather }) => {
  const { t, i18n } = useTranslation();
  const location = useGeolocation();
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!location) {
      return;
    }

    if (!API_KEY) {
      setErrorMessage("Weather API key is missing. Add VITE_WEATHER_API_KEY to .env.");
      return;
    }

    const { lat, lon } = location;
    const lang = i18n.language === "bn" ? "bn" : "en";

    const fetchWeather = async () => {
      try {
        setErrorMessage("");
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || `Weather API request failed (${res.status})`);
        }

        if (!data?.main || !Array.isArray(data?.weather) || data.weather.length === 0) {
          throw new Error("Invalid weather response format.");
        }

        setWeatherData(data);
        setWeather?.(data);

        const weatherMain = data?.weather?.[0]?.main;
        if (weatherMain) {
          onWeatherTypeChange?.(weatherMain);
        }

        const granted = await requestNotificationPermission();
        if (!granted || !weatherMain) {
          return;
        }

        const alerts = {
          Rain: t(
            "dashboard.seller.weather-suggestion.weather_card.notifications.rain"
          ),
          Thunderstorm: t(
            "dashboard.seller.weather-suggestion.weather_card.notifications.thunderstorm"
          ),
          Extreme: t(
            "dashboard.seller.weather-suggestion.weather_card.notifications.extreme"
          ),
        };

        if (alerts[weatherMain]) {
          new Notification(
            t(
              "dashboard.seller.weather-suggestion.weather_card.notifications.title"
            ),
            {
              body: alerts[weatherMain],
              icon: "/path/to/weather-icon.png",
            }
          );
        }
      } catch (error) {
        setErrorMessage(error?.message || "Error fetching weather data.");
      }
    };

    fetchWeather();
  }, [location, onWeatherTypeChange, setWeather, t, i18n.language]);

  if (errorMessage) {
    return <div className="text-red-600">{errorMessage}</div>;
  }

  if (!weatherData || !weatherData.main || !weatherData.weather) {
    return (
      <div>{t("dashboard.seller.weather-suggestion.weather_card.loading")}</div>
    );
  }

  return (
    <div className="p-4 bg-blue-100/50 backdrop-blur-md w-fit rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">
        {t("dashboard.seller.weather-suggestion.weather_card.title")}
      </h2>
      <p>
        {t("dashboard.seller.weather-suggestion.weather_card.temperature", {
          temp: weatherData?.main?.temp,
        })}
      </p>
      <p>
        {t("dashboard.seller.weather-suggestion.weather_card.humidity", {
          humidity: weatherData?.main?.humidity,
        })}
      </p>
      <p>
        {t("dashboard.seller.weather-suggestion.weather_card.wind", {
          speed: weatherData?.wind?.speed,
        })}
      </p>
      <p>
        {t("dashboard.seller.weather-suggestion.weather_card.condition", {
          description: weatherData?.weather?.[0]?.description,
        })}
      </p>
    </div>
  );
};

export default WeatherCard;
