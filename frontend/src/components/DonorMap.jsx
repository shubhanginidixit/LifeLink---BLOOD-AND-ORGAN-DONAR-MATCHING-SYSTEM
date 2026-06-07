import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const greenIcon = createIcon('green'); // Available donors
const redIcon = createIcon('red');     // Emergency/Hospitals
const blueIcon = createIcon('blue');   // Matched

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const DonorMap = ({ donors, requests, hospitals, center = [40.7128, -74.0060] }) => {
  // Demo data if none provided
  const demoDonors = donors || [
    { id: 1, name: 'Alex Johnson', type: 'Blood', group: 'O-', lat: 40.7128, lng: -74.0060 },
    { id: 2, name: 'Michael Brown', type: 'Organ', group: 'Kidney', lat: 40.7200, lng: -73.9900 },
  ];
  
  const demoRequests = requests || [
    { id: 1, hospital: 'City General', type: 'Blood', group: 'O-', urgency: 'Critical', lat: 40.7150, lng: -74.0100 },
  ];

  return (
    <div className="glass-panel w-full h-full relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-[1000] bg-[rgba(15,23,42,0.8)] backdrop-blur-md p-3 rounded-lg border border-[rgba(255,255,255,0.1)] pointer-events-auto">
        <h4 className="text-white text-sm font-semibold mb-2">Map Legend</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Available Donors</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Emergency Requests</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Hospitals</div>
        </div>
      </div>

      <div className="flex-1 w-full relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          zoomControl={false}
        >
          <MapUpdater center={center} />
          {/* Dark CARTO Basemap suitable for dark themes */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {demoDonors.map(donor => (
            <Marker key={`donor-${donor.id}`} position={[donor.lat, donor.lng]} icon={greenIcon}>
              <Popup className="dark-popup">
                <div className="p-1">
                  <h3 className="font-bold text-slate-800">{donor.name}</h3>
                  <p className="text-sm text-slate-600">{donor.type} Donor: <span className="font-semibold text-primary">{donor.group}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {demoRequests.map(req => (
            <Marker key={`req-${req.id}`} position={[req.lat, req.lng]} icon={redIcon}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-slate-800">{req.hospital}</h3>
                  <p className="text-sm font-semibold text-primary animate-pulse">{req.urgency} Request</p>
                  <p className="text-sm text-slate-600">{req.type}: {req.group}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DonorMap;
