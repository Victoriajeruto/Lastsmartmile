import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Locate, AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { position: LatLng | null, setPosition: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} draggable eventHandlers={{
    dragend: (e) => {
      setPosition(e.target.getLatLng());
    }
  }} /> : null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  // Default to Nairobi, Kenya center if no coordinates provided
  const defaultLat = -1.286389;
  const defaultLng = 36.817223;
  
  const [position, setPosition] = useState<LatLng | null>(
    latitude && longitude 
      ? new LatLng(parseFloat(latitude), parseFloat(longitude))
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const mapRef = useRef<any>(null);

  // Update parent component when position changes
  useEffect(() => {
    if (position) {
      // Use 7 decimal places for ~1cm accuracy
      onLocationChange(
        position.lat.toFixed(7),
        position.lng.toFixed(7)
      );
    }
  }, [position, onLocationChange]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const newPos = new LatLng(location.coords.latitude, location.coords.longitude);
        setPosition(newPos);
        setIsLocating(false);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 16);
        }
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true, // Request high accuracy for better precision
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handlePositionChange = (newPos: LatLng) => {
    setPosition(newPos);
  };

  return (
    <div className="space-y-4" data-testid="location-picker">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Pin Your Location
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          data-testid="button-use-location"
        >
          <Locate className="w-4 h-4 mr-2" />
          {isLocating ? "Locating..." : "Use My Location"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] w-full rounded-md overflow-hidden" data-testid="map-container">
            <MapContainer
              center={position || [defaultLat, defaultLng]}
              zoom={position ? 16 : 12}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {locationError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {position && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">Selected Location:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Latitude:</span>
              <p className="font-mono font-medium" data-testid="display-latitude">{position.lat.toFixed(7)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude:</span>
              <p className="font-mono font-medium" data-testid="display-longitude">{position.lng.toFixed(7)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <MapPin className="w-3 h-3 inline mr-1" />
            Accuracy: ~1-10 meters • Click or drag the marker to adjust
          </p>
        </div>
      )}

      {!position && (
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click on the map to pin your location or use "Use My Location" button
          </p>
        </div>
      )}
    </div>
  );
}
