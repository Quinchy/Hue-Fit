// components/MapPicker.js
import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapPicker = ({ onLocationSelect, center }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const newPosition = { lat, lng };
    setSelectedPosition(newPosition); // Update marker position
    if (onLocationSelect) onLocationSelect(newPosition); // Notify parent component
  }, [onLocationSelect]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '700px' }}
        center={selectedPosition || center} // Only reset center if no position selected
        zoom={selectedPosition ? 15 : 6} // Zoom in when a marker is set
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          mapTypeControl: true,
        }}
      >
        {selectedPosition && (
          <Marker position={selectedPosition} /> // Render marker at selected position
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPicker;
