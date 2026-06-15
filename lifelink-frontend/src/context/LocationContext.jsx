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
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return Promise.reject(new Error('Not supported'));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            city: 'Your Location',
            pincode: '',
            source: 'gps',
          };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        () => {
          setError('Unable to access location. Please enter pincode manually.');
          setLoading(false);
          reject(new Error('Permission denied'));
        },
        { enableHighAccuracy: true, timeout: 10000 }
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
