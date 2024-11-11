// components/MapPicker.js
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Manila's coordinates

const MapPicker = ({ onLocationSelect, center = DEFAULT_CENTER }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const autocompleteRef = useRef(null);

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      setSelectedPosition(newPosition);
      if (onLocationSelect) onLocationSelect(newPosition, "None"); // Send "None" as the place name
    },
    [onLocationSelect]
  );

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const newPosition = { lat, lng };

      setSelectedPosition(newPosition);
      if (onLocationSelect) onLocationSelect(newPosition, place.name); // Send place name
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '700px', borderRadius: '10px' }}
        center={selectedPosition || center}
        zoom={selectedPosition ? 15 : 6}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          mapTypeControl: true,
        }}
      >
        <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceSelected}>
          <Input
            type="text"
            placeholder="Search for a place"
            className="absolute top-2 left-2 z-10 w-80 p-2 border rounded-md shadow-sm"
          />
        </Autocomplete>

        {selectedPosition && <Marker position={selectedPosition} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPicker;
