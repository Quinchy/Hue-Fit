// components/MapView.js
import React from 'react';
import { GoogleMap, LoadScript, Marker, MarkerF } from '@react-google-maps/api';

const MapView = ({ latitude, longitude }) => {
  if (!latitude || !longitude) {
    return <p>Location not available</p>;
  }

  const position = { lat: latitude, lng: longitude };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '10px' }}
        center={position}
        zoom={15}
        options={{
          disableDefaultUI: true, // Hide default map UI
          draggable: true,       // Prevent map dragging
          zoomControl: false,     // Disable zoom control
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'road',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'administrative',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        <MarkerF position={position} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapView;
