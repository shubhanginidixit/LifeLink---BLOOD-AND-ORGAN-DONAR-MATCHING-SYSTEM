/**
 * @file helpers.js
 * @description General utility helpers for age calculation, date/time formatting, phone masking, and distance checks.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateOTP() {
  return '123456';
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

export function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `****${digits.slice(-4)}`;
}

const PINCODE_COORDS = {
  '110001': { lat: 28.6139, lng: 77.209, city: 'New Delhi' },
  '400001': { lat: 19.076, lng: 72.8777, city: 'Mumbai' },
  '560001': { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
  '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
  '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
  '500001': { lat: 17.385, lng: 78.4867, city: 'Hyderabad' },
  '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune' },
  '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
  '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
  '452001': { lat: 22.7196, lng: 75.8577, city: 'Indore' },
};

export function getCoordsFromPincode(pincode) {
  return PINCODE_COORDS[pincode] || { lat: 20.5937, lng: 78.9629, city: 'India' };
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ORGANS = [
  'Kidney',
  'Liver',
  'Heart',
  'Lungs',
  'Pancreas',
  'Cornea',
  'Bone Marrow',
];
