export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  formattedAddress: string;
  quarter?: string;
  city: string;
  country: string;
  googleMapsUrl: string;
  osmEmbedUrl: string;
  timestamp: number;
  isLive: boolean;
}

// Emplacement par défaut si le GPS est désactivé
export const DEFAULT_BENIN_LOCATION: GpsLocationResult = {
  latitude: 6.3774,
  longitude: 2.3903,
  accuracy: 10,
  formattedAddress: 'Avenue Jean Paul II, Cotonou, Bénin',
  city: 'Cotonou',
  country: 'Bénin',
  googleMapsUrl: 'https://www.google.com/maps?q=6.3774,2.3903',
  osmEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=2.3803%2C6.3674%2C2.4003%2C6.3874&layer=mapnik&marker=6.3774%2C2.3903',
  timestamp: Date.now(),
  isLive: false,
};

/**
 * Convertit automatiquement les coordonnées (latitude, longitude) en adresse textuelle réelle.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{
  formattedAddress: string;
  city: string;
  quarter?: string;
  country: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nominatim error ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const street = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
    const quarter = addr.suburb || addr.quarter || addr.residential || addr.neighbourhood || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || 'Cotonou';
    const country = addr.country || 'Bénin';

    const parts = [];
    if (street) parts.push(street);
    if (quarter && quarter !== street) parts.push(quarter);
    if (city) parts.push(city);
    if (country) parts.push(country);

    const formattedAddress =
      parts.length > 0
        ? parts.join(', ')
        : data.display_name?.split(',').slice(0, 3).join(', ') || `Position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    return {
      formattedAddress,
      city,
      quarter,
      country,
    };
  } catch (err) {
    console.warn('Reverse geocoding fallback:', err);
    return {
      formattedAddress: `Position GPS (${lat.toFixed(5)}, ${lng.toFixed(5)}) • Bénin`,
      city: 'Cotonou',
      country: 'Bénin',
    };
  }
}

/**
 * Détecte les coordonnées GPS réelles du capteur du smartphone de l'agent.
 */
export async function getCurrentGpsLocation(): Promise<GpsLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation API is not supported by this browser.');
      resolve(DEFAULT_BENIN_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const geoInfo = await reverseGeocode(latitude, longitude);

        const delta = 0.005;
        const bbox = `${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}`;
        const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy || 5),
          formattedAddress: geoInfo.formattedAddress,
          quarter: geoInfo.quarter,
          city: geoInfo.city,
          country: geoInfo.country,
          googleMapsUrl,
          osmEmbedUrl,
          timestamp: position.timestamp || Date.now(),
          isLive: true,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}