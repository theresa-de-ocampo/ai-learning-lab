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
  tempInCelsius: string;
  description: string;
  humidity: number;
  precipitationInMillimeters: number;
  chanceOfRain: number;
  chanceOfSnow: number;
  windKph: number;
  gustKph: number;
  uv: number;
};
