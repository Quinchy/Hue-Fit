// components/MapView.js
import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component for loading

const libraries = []; // No additional libraries needed for basic map view

const MapView = ({ latitude, longitude }) => {
  if (!latitude || !longitude) {
    return <p>Location not available</p>;
  }

  const position = { lat: latitude, lng: longitude };

  // Load Google Maps API script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    // Display Skeleton while the map is loading
    return (
      <div style={{ width: '100%', height: '400px', borderRadius: '10px' }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '700px', borderRadius: '10px' }}
      center={position}
      zoom={15}
      options={{
        disableDefaultUI: true,
        draggable: true,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    >
      <MarkerF position={position} />
    </GoogleMap>
  );
};

export default MapView;
