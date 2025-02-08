import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";

const libraries = ["places"];
const DEFAULT_CENTER = { lat: 14.676041, lng: 120.536389 };

const MapPicker = ({
  onLocationSelect,
  disabled = false,
  initialPosition = null,
  initialPlaceName = "None",
  center = DEFAULT_CENTER,
}) => {
  // Helper: convert a position object to numbers if provided.
  const convertPosition = (pos) => {
    if (pos && pos.lat != null && pos.lng != null) {
      return { lat: Number(pos.lat), lng: Number(pos.lng) };
    }
    return null;
  };

  // Initialize state with the converted initial position.
  const [selectedPosition, setSelectedPosition] = useState(convertPosition(initialPosition));
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const mapRef = useRef(null);

  // Update state if initial props change.
  useEffect(() => {
    setSelectedPosition(convertPosition(initialPosition));
    setPlaceName(initialPlaceName);
  }, [initialPosition, initialPlaceName]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleMapClick = (event) => {
    if (disabled) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    console.log("MapPicker clicked coordinates:", lat, lng);
    const clickedLocation = { lat, lng };
    setSelectedPosition(clickedLocation);
    setPlaceName("None");
    if (onLocationSelect) {
      onLocationSelect(clickedLocation, "None");
    }
    if (event.placeId) {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails(
        { placeId: event.placeId, fields: ["name"] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.name) {
            console.log("Retrieved place name:", place.name);
            setPlaceName(place.name);
            if (onLocationSelect) {
              onLocationSelect(clickedLocation, place.name);
            }
          } else {
            setPlaceName("No place details available");
          }
        }
      );
    }
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)
    return (
      <div style={{ width: "100%", height: "700px", borderRadius: "10px" }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );

  // If no position is selected, fall back to the provided center.
  const mapCenter = selectedPosition ? selectedPosition : center;

  return (
    <div style={{ position: "relative", height: "700px" }}>
      <div
        className="absolute top-14 left-2 bg-card/90 border border-primary/50 p-4 rounded-lg shadow-card shadow-md z-10"
        style={{ maxWidth: "300px" }}
      >
        <h3 className="text-lg font-bold uppercase">Location Details:</h3>
        <p className="text-sm font-light">
          <strong className="font-bold">Latitude:</strong>{" "}
          {selectedPosition?.lat ?? "N/A"}
        </p>
        <p className="text-sm font-light">
          <strong className="font-bold">Longitude:</strong>{" "}
          {selectedPosition?.lng ?? "N/A"}
        </p>
        <p className="text-sm font-light">
          <strong className="font-bold">Place Name:</strong> {placeName}
        </p>
      </div>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "10px" }}
        center={mapCenter}
        zoom={selectedPosition ? 15 : 10}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        options={{ disableDefaultUI: false, mapTypeControl: true }}
      >
        {selectedPosition && <MarkerF position={selectedPosition} />}
      </GoogleMap>
    </div>
  );
};

export default MapPicker;
