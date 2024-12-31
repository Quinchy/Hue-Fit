import React, { useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';

const libraries = ['places'];
const BATAAN_CENTER = { lat: 14.676041, lng: 120.536389 };

const MapPicker = ({ onLocationSelect, center = BATAAN_CENTER }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [placeName, setPlaceName] = useState('None');
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const clickedLocation = { lat, lng };

    setSelectedPosition(clickedLocation);
    setPlaceName('None');

    if (onLocationSelect) {
      onLocationSelect(clickedLocation, 'None');
    }

    if (event.placeId) {
      // Fetch details about the place
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails(
        { placeId: event.placeId, fields: ['name'] },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.name
          ) {
            setPlaceName(place.name);
          } else {
            setPlaceName('No place details available');
          }
        }
      );
    }
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div style={{ width: '100%', height: '700px', borderRadius: '10px' }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '700px' }}>
      {/* Location Details Overlay */}
      <div
        className="absolute top-14 left-2 bg-card/90 border border-primary/50 p-4 rounded-lg shadow-card shadow-md z-10"
        style={{ maxWidth: '300px' }}
      >
        <h3 className="text-lg font-bold uppercase">Location Details:</h3>
        <p className="text-sm font-light">
          <strong className="font-bold">Latitude:</strong> {selectedPosition?.lat || 'N/A'}
        </p>
        <p className="text-sm font-light">
          <strong className="font-bold">Longitude:</strong> {selectedPosition?.lng || 'N/A'}
        </p>
        <p className="text-sm font-light">
          <strong className="font-bold">Place Name:</strong> {placeName}
        </p>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '10px' }}
        center={center}
        zoom={selectedPosition ? 15 : 10}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        options={{
          disableDefaultUI: false,
          mapTypeControl: true,
        }}
      >
        {selectedPosition && (
          <Marker position={selectedPosition} />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapPicker;
