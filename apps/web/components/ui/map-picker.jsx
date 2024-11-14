// components/MapPicker.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton'; // Import the Skeleton component

const libraries = ['places']; // Define libraries outside the component to prevent re-creation on each render
const BATAAN_CENTER = { lat: 14.676041, lng: 120.536389 }; // Precise Bataan coordinates

const MapPicker = ({ onLocationSelect, center = BATAAN_CENTER }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [inputValue, setInputValue] = useState(''); // State to control the input value
  const autocompleteRef = useRef(null);

  // Use useJsApiLoader instead of LoadScript for better performance
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries, // Use the predefined libraries array
  });

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };
      setSelectedPosition(newPosition);
      if (onLocationSelect) onLocationSelect(newPosition, 'None');
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
      setMapCenter(newPosition);
      setInputValue(place.name || ''); // Update input value to fix controlled/uncontrolled warning
      if (onLocationSelect) onLocationSelect(newPosition, place.name);
    }
  };

  useEffect(() => {
    setMapCenter(BATAAN_CENTER);
  }, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    // Display Skeleton while the map is loading
    return (
      <div style={{ width: '100%', height: '700px', borderRadius: '10px' }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '700px', borderRadius: '10px' }}
      center={mapCenter}
      zoom={selectedPosition ? 15 : 10}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: false,
        mapTypeControl: true,
      }}
    >
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceSelected}
      >
        <Input
          type="text"
          placeholder="Search for a place"
          value={inputValue} // Make input controlled
          onChange={(e) => setInputValue(e.target.value)} // Update input value on change
          className="absolute top-2 left-2 z-10 w-80 p-2 border rounded-md shadow-sm"
        />
      </Autocomplete>
      {selectedPosition && <Marker position={selectedPosition} />}
    </GoogleMap>
  );
};

export default MapPicker;
