'use client';

import { useEffect, useRef, useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  address: string;
  city: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onLocationChange: (coords: { lat: number; lng: number } | null) => void;
};

const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };
const MAP_HEIGHT = 240;

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { Accept: 'application/json' } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const parts = [
    data.address?.road,
    data.address?.neighbourhood || data.address?.suburb,
    data.address?.city || data.address?.town || data.address?.village,
  ].filter(Boolean);
  return {
    label: parts.length
      ? parts.join(', ')
      : String(data.display_name || '')
          .split(',')
          .slice(0, 3)
          .join(',')
          .trim(),
    city: String(
      data.address?.city || data.address?.town || data.address?.village || data.address?.state || ''
    ).trim(),
  };
}

export default function DoorstepLocationPicker({
  address,
  city,
  onAddressChange,
  onCityChange,
  onLocationChange,
}: Props) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const cityRef = useRef(city);
  const onAddressChangeRef = useRef(onAddressChange);
  const onCityChangeRef = useRef(onCityChange);
  const onLocationChangeRef = useRef(onLocationChange);
  const askedRef = useRef(false);
  const userEditedAddressRef = useRef(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    cityRef.current = city;
  }, [city]);
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);
  useEffect(() => {
    onCityChangeRef.current = onCityChange;
  }, [onCityChange]);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const refreshMapSize = () => {
    window.setTimeout(() => mapRef.current?.invalidateSize(), 60);
    window.setTimeout(() => mapRef.current?.invalidateSize(), 220);
  };

  const placeMarker = async (lat: number, lng: number, fillAddress: boolean) => {
    const map = mapRef.current;
    if (!map) return;
    const leafletMod = await import('leaflet');
    const L = (leafletMod.default ?? leafletMod) as typeof import('leaflet');

    onLocationChangeRef.current({ lat, lng });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current?.getLatLng();
        if (!pos) return;
        // Map pin moved by user — allow address fill once.
        userEditedAddressRef.current = false;
        void placeMarker(pos.lat, pos.lng, true);
      });
    }

    map.setView([lat, lng], Math.max(map.getZoom(), 16));
    refreshMapSize();

    if (!fillAddress) return;
    // Never wipe text the customer is already typing.
    if (userEditedAddressRef.current) {
      setStatus('Location pinned. Address left as you typed — edit freely.');
      return;
    }

    try {
      const result = await reverseGeocode(lat, lng);
      if (result?.label && !userEditedAddressRef.current) {
        onAddressChangeRef.current(result.label);
      }
      if (result?.city && !cityRef.current.trim()) {
        onCityChangeRef.current(result.city);
      }
      setStatus('Location pinned. Drag the pin or keep typing your address.');
    } catch {
      setStatus('Location pinned. You can type the address manually.');
    }
    refreshMapSize();
  };

  const ensureMap = async () => {
    if (mapRef.current || !mapNodeRef.current) return;
    const leafletMod = await import('leaflet');
    const L = (leafletMod.default ?? leafletMod) as typeof import('leaflet');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapNodeRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    map.on('click', (event) => {
      userEditedAddressRef.current = false;
      void placeMarker(event.latlng.lat, event.latlng.lng, true);
    });

    mapRef.current = map;
    refreshMapSize();
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Location is not supported here. Tap the map to choose manually.');
      return;
    }
    setLocating(true);
    setStatus('Allow location access to pin your doorstep…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        void placeMarker(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        setLocating(false);
        setStatus('Permission denied. Tap the map or type your address.');
        refreshMapSize();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const openMapAndLocate = async (requestLocation: boolean) => {
    setMapVisible(true);
    await new Promise((resolve) => window.setTimeout(resolve, 40));
    await ensureMap();
    refreshMapSize();
    if (requestLocation && !askedRef.current) {
      askedRef.current = true;
      requestCurrentLocation();
    }
  };

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapVisible) return;
    refreshMapSize();
  }, [mapVisible]);

  return (
    <div className={`repair-address-map ${mapVisible ? 'is-open' : ''}`}>
      <div className="repair-address-field">
        <label htmlFor="repair-doorstep-address">
          <MapPin size={14} /> Doorstep address
        </label>
        <textarea
          id="repair-doorstep-address"
          className="form-input"
          required
          rows={4}
          value={address}
          placeholder="Type your address, or use current location"
          onFocus={() => {
            if (!mapVisible) void openMapAndLocate(true);
          }}
          onChange={(event) => {
            userEditedAddressRef.current = true;
            onAddressChange(event.target.value);
          }}
        />
        <div className="repair-address-actions">
          <button
            type="button"
            className="repair-locate-btn"
            disabled={locating}
            onClick={() => {
              userEditedAddressRef.current = false;
              askedRef.current = false;
              void openMapAndLocate(true);
            }}
          >
            <Crosshair size={14} />
            {locating ? 'Finding you…' : 'Use current location'}
          </button>
          {status ? <small>{status}</small> : null}
        </div>
      </div>

      <div className="repair-map-pane" style={{ height: MAP_HEIGHT }}>
        <div className="repair-map-canvas" ref={mapNodeRef} style={{ height: MAP_HEIGHT }} />
        {!mapVisible ? (
          <div className="repair-map-placeholder">
            <MapPin size={18} />
            <span>Map opens when you tap the address field</span>
          </div>
        ) : (
          <p className="repair-map-hint">Tap the map or drag the pin to fine-tune</p>
        )}
      </div>
    </div>
  );
}
