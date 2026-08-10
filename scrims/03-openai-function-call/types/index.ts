export type Location = {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
};

export type Weather = {
  tempInCelsius: number;
  description: string;
  humidity: number;
  precipitationInMillimeters: number;
  chanceOfRain: number;
  chanceOfSnow: number;
  windKph: number;
  gustKph: number;
  uv: number;
};

export type WeatherApiResponse = {
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
    humidity: number;
    precip_mm: number;
    chance_of_rain: number;
    chance_of_snow: number;
    wind_kph: number;
    gust_kph: number;
    uv: number;
  };
};
