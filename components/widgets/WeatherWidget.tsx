/**
 * Weather Widget Component
 *
 * Displays weather information for London (static/mock for portfolio).
 * In production, could connect to a weather API.
 *
 * @module components/widgets/WeatherWidget
 */

import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  wind: number;
  location: string;
}

// Simulated weather that changes throughout the day
const getSimulatedWeather = (): WeatherData => {
  const hour = new Date().getHours();
  const conditions: Array<'sunny' | 'cloudy' | 'rainy' | 'snowy'> = ['sunny', 'cloudy', 'rainy', 'cloudy'];
  const conditionIndex = Math.floor(hour / 6) % 4;

  // Base temp varies by time of day (London weather)
  const baseTemp = 12;
  const hourVariation = Math.sin((hour - 6) * Math.PI / 12) * 6;

  return {
    temp: Math.round(baseTemp + hourVariation),
    condition: conditions[conditionIndex],
    // Derived from the hour (like temp) so values don't jitter on each refresh
    humidity: 65 + ((hour * 7) % 20),
    wind: 8 + ((hour * 3) % 10),
    location: 'London',
  };
};

const WeatherIcon: React.FC<{ condition: WeatherData['condition']; size?: number }> = ({
  condition,
  size = 32,
}) => {
  const iconProps = { size, className: 'text-zinc-600 dark:text-zinc-300' };

  switch (condition) {
    case 'sunny':
      return <Sun {...iconProps} />;
    case 'cloudy':
      return <Cloud {...iconProps} />;
    case 'rainy':
      return <CloudRain {...iconProps} />;
    case 'snowy':
      return <CloudSnow {...iconProps} />;
    default:
      return <Cloud {...iconProps} />;
  }
};

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(getSimulatedWeather);

  // Update weather periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setWeather(getSimulatedWeather());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const conditionText = {
    sunny: 'Sunny',
    cloudy: 'Cloudy',
    rainy: 'Rainy',
    snowy: 'Snowy',
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-soft w-48">
      {/* Location */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
        {weather.location}
      </div>

      {/* Main Weather */}
      <div className="flex items-center gap-3">
        <WeatherIcon condition={weather.condition} size={40} />
        <div>
          <div className="text-3xl font-bold text-black dark:text-white">
            {weather.temp}°
          </div>
          <div className="text-xs text-zinc-500">
            {conditionText[weather.condition]}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between">
        <div className="flex items-center gap-1">
          <Droplets size={12} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-500">{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind size={12} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-500">{weather.wind} km/h</span>
        </div>
      </div>
    </div>
  );
};
