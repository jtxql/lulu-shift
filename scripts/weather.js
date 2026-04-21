/**
 * Weather Display Module
 * Uses Open-Meteo API (free, no API key required, CORS enabled)
 */
const Weather = {
  CACHE_KEY: 'lulu-shift-weather',
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes

  cities: [
    { name: 'Ottawa', nameZh: '渥太华', lat: 45.42, lon: -75.69 },
    { name: 'Yantai', nameZh: '烟台', lat: 37.54, lon: 121.39 },
    { name: 'Nanjing', nameZh: '南京', lat: 32.06, lon: 118.79 }
  ],

  async init() {
    // Load cached data first if available
    const cached = this._getCache();
    if (cached) {
      this._updateUI(cached);
    }

    // Fetch fresh data
    try {
      const data = await this.fetchAll();
      this._updateUI(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }

    // Update every 30 minutes
    setInterval(async () => {
      try {
        const data = await this.fetchAll();
        this._updateUI(data);
      } catch (error) {
        console.error('Failed to update weather:', error);
      }
    }, this.CACHE_DURATION);
  },

  async fetchAll() {
    const results = await Promise.all(this.cities.map(city => this._fetchCity(city)));
    const data = Object.fromEntries(this.cities.map((city, i) => [city.name, results[i]]));
    this._setCache(data);
    return data;
  },

  async _fetchCity(city) {
    // Use current weather API for real-time data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weathercode&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      code: json.current.weathercode,
      temp: Math.round(json.current.temperature_2m)
    };
  },

  _getWeatherIcon(code) {
    const icons = {
      0: '☀️',   // Clear sky
      1: '🌤️',  // Mainly clear
      2: '⛅',  // Partly cloudy
      3: '☁️',   // Overcast
      45: '🌫️', // Fog
      48: '🌫️', // Depositing rime fog
      51: '🌧️', // Light drizzle
      53: '🌧️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      61: '🌧️', // Slight rain
      63: '🌧️', // Moderate rain
      65: '🌧️', // Heavy rain
      71: '❄️',  // Slight snow
      73: '❄️',  // Moderate snow
      75: '❄️',  // Heavy snow
      77: '❄️',  // Snow grains
      80: '🌧️', // Slight rain showers
      81: '🌧️', // Moderate rain showers
      82: '⛈️',  // Violent rain showers
      85: '🌨️', // Slight snow showers
      86: '🌨️', // Heavy snow showers
      95: '⛈️',  // Thunderstorm
      96: '⛈️',  // Thunderstorm with slight hail
      99: '⛈️'   // Thunderstorm with heavy hail
    };
    return icons[code] || '❓';
  },

  _getCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  _setCache(data) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache weather:', error);
    }
  },

  _updateUI(data) {
    const container = document.getElementById('status-weather');
    if (!container) return;

    const lang = Language?.currentLang || 'en';
    const isZh = lang === 'zh';

    container.innerHTML = this.cities.map(city => {
      const cityData = data[city.name];
      if (!cityData) return '';
      const icon = this._getWeatherIcon(cityData.code);
      const name = isZh ? city.nameZh : city.name;
      return `<span class="weather-item"><span class="weather-city">${name}</span><span class="weather-icon">${icon}</span><span class="weather-temp">${cityData.temp}°C</span></span>`;
    }).join('');
  }
};
