/**
 * @file LocationContext.jsx
 * @description Context provider module managing location services, coordinates, and pincodes.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { getCoordsFromPincode } from '../utils/helpers';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState({
    lat: 18.5204,
    lng: 73.8567,
    city: 'Pune',
    pincode: '411001',
    source: 'default',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 const requestGPS = useCallback(() => {
  setLoading(true);
  setError(null);

  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser");
    setLoading(false);
    return Promise.reject(new Error("Not supported"));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          const loc = {
            lat,
            lng,
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              "Unknown",
            pincode: data.address.postcode || "",
            source: "gps",
          };

          setLocation(loc);
          setLoading(false);
          resolve(loc);
        } catch (err) {
          console.error(err);
          setError("Unable to detect your location.");
          setLoading(false);
          reject(err);
        }
      },
      (err) => {
        console.error(err);
        setError("Unable to access location.");
        setLoading(false);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}, []);

  const setPincode = useCallback((pincode) => {
    const coords = getCoordsFromPincode(pincode);
    const loc = {
      lat: coords.lat,
      lng: coords.lng,
      city: coords.city,
      pincode,
      source: 'pincode',
    };
    setLocation(loc);
    setError(null);
    return loc;
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, loading, error, requestGPS, setPincode, setLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
