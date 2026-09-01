import { axiosInstance } from '../api/axiosInstance.js';

export const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '2ecb147800e2472eab47bbfeaf5d010a';

export const geoapifyService = {
  apiKey: GEOAPIFY_API_KEY,

  /**
   * Return tile URL for Leaflet / OpenStreetMap maps
   * Styles available: 'osm-bright', 'klokantech-basic', 'positron', 'darkmatter'
   */
  getTileUrl: (style = 'osm-bright') => {
    return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
  },

  /**
   * Reverse Geocode (Lat/Lng -> Address & City details)
   */
  reverseGeocode: async (lat, lng) => {
    try {
      // Try backend proxy endpoint first
      const res = await axiosInstance.get('/location/reverse-geocode', { params: { lat, lng } });
      if (res?.data) return res.data;
    } catch {
      // Direct Geoapify API fallback
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const props = data.features?.[0]?.properties || {};
    const isPincode = (str) => /^\d{5,6}$/.test(String(str || '').trim());

    let name = props.name || props.address_line1 || '';
    if (isPincode(name)) name = '';

    let street = props.street || props.suburb || props.district || props.county || '';
    if (isPincode(street)) street = '';

    let city = props.city || props.county || props.state_district || 'Azamgarh';
    if (isPincode(city)) city = 'Azamgarh';

    let state = props.state || props.state_code || 'UP';

    // Build clean full address without standalone pincode or country
    const addressParts = [];
    if (name) addressParts.push(name);
    if (street && street !== name) addressParts.push(street);
    if (city && city !== street && city !== name) addressParts.push(city);
    if (state && state !== city) addressParts.push(state);

    // Clean formatted address
    let cleanFormatted = addressParts.length > 0 ? addressParts.join(', ') : (props.formatted || `${city}, ${state}`);
    cleanFormatted = cleanFormatted.replace(/,?\s*\d{5,6}/g, '').replace(/,?\s*India$/i, '').trim();
    if (!cleanFormatted || cleanFormatted === 'UP' || cleanFormatted === 'India') {
      cleanFormatted = `${city}, ${state}`;
    }

    const addressLine1 = name || street || `${city} Premises`;
    const addressLine2 = street && street !== city ? street : city;

    return {
      formatted: cleanFormatted,
      addressLine1,
      addressLine2,
      city,
      state,
      postcode: props.postcode || '',
      country: props.country || 'India',
      lat: Number(props.lat || lat),
      lng: Number(props.lon || lng),
    };
  },

  /**
   * Forward Address Search / Auto-complete
   */
  forwardSearch: async (query) => {
    try {
      const res = await axiosInstance.get('/location/search', { params: { query } });
      if (res?.data) return res.data;
    } catch {
      // Direct fallback
    }

    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&filter=countrycode:in&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return (data.features || []).map((f) => {
      const p = f.properties || {};
      return {
        formatted: p.formatted,
        city: p.city || p.county || '',
        lat: p.lat,
        lng: p.lon,
      };
    });
  },

  /**
   * Driving Route & Distance Calculation between two points
   */
  getDrivingRoute: async (origin, destination) => {
    try {
      const res = await axiosInstance.post('/location/route', { origin, destination });
      if (res?.data) return res.data;
    } catch {
      // Direct fallback
    }

    const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const feature = data.features?.[0] || {};
    const props = feature.properties || {};
    const geometry = feature.geometry || {};

    const distanceMeters = props.distance || 0;
    const durationSeconds = props.time || 0;

    const coordinates = Array.isArray(geometry.coordinates)
      ? geometry.coordinates.flatMap((subPath) =>
          Array.isArray(subPath[0]) ? subPath.map(([lon, lat]) => [lat, lon]) : [[subPath[1], subPath[0]]]
        )
      : [];

    return {
      distanceKm: Math.round((distanceMeters / 1000) * 100) / 100,
      durationMins: Math.ceil(durationSeconds / 60),
      coordinates,
    };
  },
};
