import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useNysc } from '../../context/NyscContext';
import { STATE_COORDINATES } from '../../data/mockSeed';
import {
  Navigation,
  Edit2,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Maximize2,
  Locate,
  MapPin,
  Compass,
  AlertCircle,
  Building2,
  Users,
  Bus,
  Route,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Crosshair
} from 'lucide-react';

interface GeolocationMapProps {
  stateName: string;
  lgaName: string;
  ppaName: string;
  ppaAddress: string;
  ppaLat: number;
  ppaLng: number;
  ppaNotes?: string;
  cdsGroup: string;
  cdsAddress: string;
  cdsLat: number;
  cdsLng: number;
  cdsMeetingDay: string;
  cdsMeetingTime: string;
  transitFareNotes?: string;
  onOpenEditModal: () => void;
}

interface RouteStep {
  instruction: string;
  distance: string;
}

export const GeolocationMap: React.FC<GeolocationMapProps> = ({
  stateName,
  lgaName,
  ppaName,
  ppaAddress,
  ppaLat,
  ppaLng,
  ppaNotes,
  cdsGroup,
  cdsAddress,
  cdsLat,
  cdsLng,
  cdsMeetingDay,
  cdsMeetingTime,
  transitFareNotes,
  onOpenEditModal
}) => {
  const { updateLocationSchedule, fireConfetti } = useNysc();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const ppaMarkerRef = useRef<L.Marker | null>(null);
  const cdsMarkerRef = useRef<L.Marker | null>(null);

  // Normalize and validate coordinates (prevent 0, NaN, or null values from breaking pin placement)
  const validPpaLat = (typeof ppaLat === 'number' && !isNaN(ppaLat) && ppaLat !== 0) ? ppaLat : 6.5925;
  const validPpaLng = (typeof ppaLng === 'number' && !isNaN(ppaLng) && ppaLng !== 0) ? ppaLng : 3.3444;
  const validCdsLat = (typeof cdsLat === 'number' && !isNaN(cdsLat) && cdsLat !== 0) ? cdsLat : 6.5982;
  const validCdsLng = (typeof cdsLng === 'number' && !isNaN(cdsLng) && cdsLng !== 0) ? cdsLng : 3.3401;

  // Live User Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<'ppa' | 'cds' | 'user' | null>(null);

  // Updating CDS with GPS state
  const [isUpdatingCdsGps, setIsUpdatingCdsGps] = useState(false);
  const [cdsUpdateSuccess, setCdsUpdateSuccess] = useState(false);

  // Routing / Directions state
  const [routeMode, setRouteMode] = useState<'ppa-to-cds' | 'user-to-cds' | 'user-to-ppa'>('ppa-to-cds');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeDistanceKm, setRouteDistanceKm] = useState<string>('0.0');
  const [routeDurationMins, setRouteDurationMins] = useState<number>(0);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [isBasisExpanded, setIsBasisExpanded] = useState(true);

  // Calculate straight-line distance in km between two lat/lng pairs
  const calculateDistanceKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }, []);

  const distancePpaToCds = calculateDistanceKm(validPpaLat, validPpaLng, validCdsLat, validCdsLng);
  const distanceUserToPpa = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, validPpaLat, validPpaLng)
    : null;
  const distanceUserToCds = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, validCdsLat, validCdsLng)
    : null;

  // Active Origin & Destination based on current route mode
  const isGpsMode = routeMode === 'user-to-cds' && userLocation !== null;
  const originName = isGpsMode ? 'Your Live GPS Location' : `Primary Assignment: ${ppaName}`;
  const originAddress = isGpsMode ? 'Current device coordinates' : ppaAddress;
  const originLat = isGpsMode ? userLocation!.lat : validPpaLat;
  const originLng = isGpsMode ? userLocation!.lng : validPpaLng;

  const destName = `CDS Secretariat: ${cdsGroup}`;
  const destAddress = cdsAddress;
  const destLat = validCdsLat;
  const destLng = validCdsLng;

  // Draw or update directions polyline on the Leaflet map
  const renderDirectionsRoute = useCallback(async (
    start: [number, number],
    end: [number, number],
    label: string
  ) => {
    if (!leafletMapRef.current || !routeLayerGroupRef.current) return;
    const map = leafletMapRef.current;
    const layerGroup = routeLayerGroupRef.current;
    layerGroup.clearLayers();

    setIsLoadingRoute(true);

    let routeCoords: [number, number][] = [];
    let calculatedKm = calculateDistanceKm(start[0], start[1], end[0], end[1]).toFixed(1);
    let calculatedMins = Math.round(Number(calculatedKm) * 2.5) || 5;
    let extractedSteps: RouteStep[] = [];

    try {
      // Fetch realistic road route from Open Source Routing Machine (OSRM)
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const r = data.routes[0];
          routeCoords = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          calculatedKm = (r.distance / 1000).toFixed(1);
          calculatedMins = Math.max(1, Math.round(r.duration / 60));
          if (r.legs?.[0]?.steps) {
            extractedSteps = r.legs[0].steps.slice(0, 6).map((s: any) => ({
              instruction: s.name ? `Proceed onto ${s.name}` : (s.maneuver?.type ? `${s.maneuver.type} onto route` : 'Continue forward'),
              distance: s.distance ? `${Math.round(s.distance)}m` : ''
            }));
          }
        }
      }
    } catch {
      // Safe fallback if offline or request blocked
    }

    // Fallback direct connected line if OSRM failed
    if (routeCoords.length === 0) {
      routeCoords = [start, end];
      extractedSteps = [
        { instruction: `Depart from origin coordinates`, distance: '0m' },
        { instruction: `Follow direct transit trajectory to destination (${label})`, distance: `${calculatedKm} km` },
        { instruction: `Arrive at destination venue`, distance: '0m' }
      ];
    }

    setRouteDistanceKm(calculatedKm);
    setRouteDurationMins(calculatedMins);
    setRouteSteps(extractedSteps);
    setIsLoadingRoute(false);

    // 1. Shadow / Glow outline
    const glowLine = L.polyline(routeCoords, {
      color: '#0f172a',
      weight: 8,
      opacity: 0.6,
      lineCap: 'round',
      lineJoin: 'round'
    });
    layerGroup.addLayer(glowLine);

    // 2. Vibrant emerald/green primary direction path
    const mainLine = L.polyline(routeCoords, {
      color: '#008751',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: routeCoords.length === 2 ? '8, 8' : undefined
    });

    mainLine.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px;">
        <div style="font-size: 10px; font-weight: 800; color: #008751; text-transform: uppercase;">🗺️ Commute Route</div>
        <div style="font-weight: 700; margin-top: 2px;">${label}</div>
        <div style="color: #047857; font-weight: 600; font-size: 11px; margin-top: 2px;">
          Distance: ${calculatedKm} km • ~${calculatedMins} mins
        </div>
      </div>
    `);

    layerGroup.addLayer(mainLine);

    // Fit map bounds to show route AND both markers with padding
    const allPoints: [number, number][] = [...routeCoords, [validPpaLat, validPpaLng], [validCdsLat, validCdsLng]];
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [calculateDistanceKm, validPpaLat, validPpaLng, validCdsLat, validCdsLng]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [validPpaLat, validPpaLng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true
    });

    leafletMapRef.current = map;

    // Layer group for route polylines
    const routeLayerGroup = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = routeLayerGroup;

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom Blue Pin for PPA
    const ppaIcon = L.divIcon({
      className: 'custom-leaflet-ppa-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          background: #2563eb;
          transform: rotate(-45deg);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.6);
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 16px;
          ">🏢</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    // Custom Green Pin for CDS (Prominent, High z-index so it is always visible)
    const cdsIcon = L.divIcon({
      className: 'custom-leaflet-cds-marker',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          background: #008751;
          transform: rotate(-45deg);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,135,81,0.6);
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 16px;
          ">👥</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    // Add PPA Marker with permanent visible label tooltip
    const ppaMarker = L.marker([validPpaLat, validPpaLng], { icon: ppaIcon, zIndexOffset: 500 }).addTo(map);
    ppaMarkerRef.current = ppaMarker;
    ppaMarker.bindTooltip(
      `🔵 PPA: ${ppaName} (${validPpaLat.toFixed(4)}°N, ${validPpaLng.toFixed(4)}°E)`,
      { permanent: true, direction: 'top', className: 'custom-nysc-tooltip', offset: [0, -38] }
    );
    ppaMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px; min-width: 200px;">
        <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase;">Primary Assignment (PPA)</div>
        <div style="font-weight: 700; margin-top: 2px; font-size: 13px;">${ppaName}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${ppaAddress}</div>
        <div style="color: #2563eb; font-mono; font-size: 10px; font-weight: bold; margin-top: 4px;">📍 Coords: ${validPpaLat.toFixed(5)}°N, ${validPpaLng.toFixed(5)}°E</div>
        ${ppaNotes ? `<div style="margin-top: 6px; padding: 4px 8px; background: #fef3c7; border-radius: 6px; font-size: 10px; color: #92400e;">🧭 ${ppaNotes}</div>` : ''}
      </div>
    `);

    // Add CDS Marker with permanent visible label tooltip (GUARANTEED VISIBLE)
    const cdsMarker = L.marker([validCdsLat, validCdsLng], { icon: cdsIcon, zIndexOffset: 600 }).addTo(map);
    cdsMarkerRef.current = cdsMarker;
    cdsMarker.bindTooltip(
      `🟢 CDS: ${cdsGroup} (${validCdsLat.toFixed(4)}°N, ${validCdsLng.toFixed(4)}°E)`,
      { permanent: true, direction: 'top', className: 'custom-nysc-tooltip', offset: [0, -38] }
    );
    cdsMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px; min-width: 200px;">
        <div style="font-size: 10px; font-weight: 800; color: #008751; text-transform: uppercase;">CDS Secretariat Venue</div>
        <div style="font-weight: 700; margin-top: 2px; font-size: 13px;">${cdsGroup}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${cdsAddress}</div>
        <div style="color: #047857; font-mono; font-size: 10px; font-weight: bold; margin-top: 4px;">📍 Coords: ${validCdsLat.toFixed(5)}°N, ${validCdsLng.toFixed(5)}°E</div>
        <div style="color: #047857; font-weight: 700; font-size: 11px; margin-top: 4px;">📅 Every ${cdsMeetingDay} @ ${cdsMeetingTime}</div>
        ${transitFareNotes ? `<div style="margin-top: 6px; padding: 4px 8px; background: #e0f2fe; border-radius: 6px; font-size: 10px; color: #0369a1;">🚌 Transit: ${transitFareNotes}</div>` : ''}
      </div>
    `);

    // Fit map bounds to show BOTH pins comfortably
    const initialBounds = L.latLngBounds([
      [validPpaLat, validPpaLng],
      [validCdsLat, validCdsLng]
    ]);
    map.fitBounds(initialBounds, { padding: [60, 60] });

    // Render initial directions route between PPA and CDS
    renderDirectionsRoute([validPpaLat, validPpaLng], [validCdsLat, validCdsLng], 'PPA to CDS Venue');

    // Handle container resize
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      leafletMapRef.current = null;
      routeLayerGroupRef.current = null;
    };
  }, []); // Run once on mount

  // Update existing markers and route in-place when coordinates change
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Update PPA Marker position & tooltip
    if (ppaMarkerRef.current) {
      ppaMarkerRef.current.setLatLng([validPpaLat, validPpaLng]);
      ppaMarkerRef.current.setTooltipContent(`🔵 PPA: ${ppaName} (${validPpaLat.toFixed(4)}°N, ${validPpaLng.toFixed(4)}°E)`);
    }

    // Update CDS Marker position & tooltip
    if (cdsMarkerRef.current) {
      cdsMarkerRef.current.setLatLng([validCdsLat, validCdsLng]);
      cdsMarkerRef.current.setTooltipContent(`🟢 CDS: ${cdsGroup} (${validCdsLat.toFixed(4)}°N, ${validCdsLng.toFixed(4)}°E)`);
    }

    // Re-render route for active mode
    if (routeMode === 'ppa-to-cds') {
      renderDirectionsRoute([validPpaLat, validPpaLng], [validCdsLat, validCdsLng], 'PPA to CDS Venue');
    } else if (routeMode === 'user-to-cds' && userLocation) {
      renderDirectionsRoute([userLocation.lat, userLocation.lng], [validCdsLat, validCdsLng], 'Your GPS to CDS Venue');
    } else if (routeMode === 'user-to-ppa' && userLocation) {
      renderDirectionsRoute([userLocation.lat, userLocation.lng], [validPpaLat, validPpaLng], 'Your GPS to PPA');
    }
  }, [validPpaLat, validPpaLng, validCdsLat, validCdsLng, ppaName, cdsGroup, routeMode, userLocation, renderDirectionsRoute]);

  // Request live user location via HTML5 Geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser environment.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring real-time GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setIsLocating(false);
        setLocationStatus(`GPS fixed: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(accuracy)}m)`);

        if (leafletMapRef.current) {
          const map = leafletMapRef.current;

          // Remove previous live user marker if any
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Custom Cyan/Purple Pulsing Marker for Live Corper Location
          const liveUserIcon = L.divIcon({
            className: 'custom-leaflet-user-marker',
            html: `
              <div style="position: relative; width: 32px; height: 32px;">
                <div style="
                  position: absolute;
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: rgba(168, 85, 247, 0.4);
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: relative;
                  width: 22px;
                  height: 22px;
                  top: 5px;
                  left: 5px;
                  border-radius: 50%;
                  background: #9333ea;
                  border: 3px solid #ffffff;
                  box-shadow: 0 0 14px rgba(147, 51, 234, 0.8);
                "></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
          });

          const userMarker = L.marker([latitude, longitude], { icon: liveUserIcon, zIndexOffset: 700 }).addTo(map);
          userMarkerRef.current = userMarker;
          userMarker.bindTooltip(`📍 You Are Here: (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`, {
            permanent: true,
            direction: 'top',
            className: 'custom-nysc-tooltip',
            offset: [0, -18]
          });
          userMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px;">
              <div style="font-size: 10px; font-weight: 800; color: #9333ea; text-transform: uppercase;">📍 Your Live Location</div>
              <div style="font-weight: 700; margin-top: 2px;">Corper GPS Position</div>
              <div style="color: #64748b; font-size: 11px;">${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E</div>
            </div>
          `).openPopup();

          // Auto switch to user-to-cds routing
          setRouteMode('user-to-cds');
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can still navigate via PPA and CDS pins.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location position unavailable. Check GPS or network signal.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Retrying recommended.';
        }
        setLocationStatus(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Direct "Use Current GPS for CDS" handler
  const handleUseCurrentGpsForCds = () => {
    setIsUpdatingCdsGps(true);
    setCdsUpdateSuccess(false);

    const applyCdsCoords = (lat: number, lng: number) => {
      // 1. Update persistent NyscContext & LocalStorage
      updateLocationSchedule({
        cds_latitude: lat,
        cds_longitude: lng
      });

      // 2. Update local marker position immediately on the Leaflet map
      if (cdsMarkerRef.current) {
        cdsMarkerRef.current.setLatLng([lat, lng]);
        cdsMarkerRef.current.setTooltipContent(`🟢 CDS: ${cdsGroup} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
        cdsMarkerRef.current.openPopup();
      }

      setIsUpdatingCdsGps(false);
      setCdsUpdateSuccess(true);
      fireConfetti();

      // 3. Recalculate route to new CDS venue
      renderDirectionsRoute([validPpaLat, validPpaLng], [lat, lng], 'PPA to Updated CDS Venue');

      setTimeout(() => setCdsUpdateSuccess(false), 4500);
    };

    // If userLocation already captured, use it instantly!
    if (userLocation) {
      applyCdsCoords(userLocation.lat, userLocation.lng);
      return;
    }

    // Otherwise, fetch GPS location
    if (!navigator.geolocation) {
      setIsUpdatingCdsGps(false);
      setLocationStatus('Geolocation is not supported by your browser environment.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        applyCdsCoords(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setIsUpdatingCdsGps(false);
        setLocationStatus('Could not capture GPS position. Please check location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Focus on PPA pin
  const handleFocusPpa = () => {
    setActiveMarker('ppa');
    if (leafletMapRef.current && ppaMarkerRef.current) {
      leafletMapRef.current.setView([validPpaLat, validPpaLng], 15);
      ppaMarkerRef.current.openPopup();
    }
  };

  // Focus on CDS pin
  const handleFocusCds = () => {
    setActiveMarker('cds');
    if (leafletMapRef.current && cdsMarkerRef.current) {
      leafletMapRef.current.setView([validCdsLat, validCdsLng], 15);
      cdsMarkerRef.current.openPopup();
    }
  };

  // Fit bounds to show all markers
  const handleFitAll = () => {
    setActiveMarker(null);
    if (leafletMapRef.current) {
      const points: [number, number][] = [[validPpaLat, validPpaLng], [validCdsLat, validCdsLng]];
      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng]);
      }
      const bounds = L.latLngBounds(points);
      leafletMapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  };

  const navOriginLat = isGpsMode ? userLocation!.lat : validPpaLat;
  const navOriginLng = isGpsMode ? userLocation!.lng : validPpaLng;
  const navDestLat = validCdsLat;
  const navDestLng = validCdsLng;
  const directionsAppUrl = `https://www.google.com/maps/dir/?api=1&origin=${navOriginLat},${navOriginLng}&destination=${navDestLat},${navDestLng}`;

  return (
    <div className="bg-slate-900/95 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col space-y-4 p-5 sm:p-6">
      
      {/* Top Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#008751]" />
              <span>Interactive Service Geolocation</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
              {stateName} State ({lgaName} LGA)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn-by-turn route directions and real-time commute calculations for Primary Assignment & CDS Secretariat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Real GPS Locate Me Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              userLocation
                ? 'bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Request current GPS location"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-purple-400' : 'text-purple-400'}`} />
            <span>{isLocating ? 'Locating...' : userLocation ? 'GPS Fixed 📍' : 'Locate Me'}</span>
          </button>

          {/* Edit Location / Schedule Button */}
          <button
            onClick={onOpenEditModal}
            className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#008751]/30 transition-all hover:scale-102"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Coordinates</span>
          </button>
        </div>
      </div>

      {/* Geolocation Status / Feedback Bar */}
      {(locationStatus || cdsUpdateSuccess) && (
        <div className={`rounded-2xl px-3.5 py-2 text-xs flex items-center justify-between gap-2 border transition-all ${
          cdsUpdateSuccess
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/40'
            : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 truncate">
            {cdsUpdateSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            )}
            <span className="truncate">
              {cdsUpdateSuccess ? `CDS Venue pin successfully relocated to ${validCdsLat.toFixed(5)}°N, ${validCdsLng.toFixed(5)}°E!` : locationStatus}
            </span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
              <span className="text-blue-300">To PPA: {distanceUserToPpa} km</span>
              <span className="text-emerald-300">To CDS: {distanceUserToCds} km</span>
            </div>
          )}
        </div>
      )}

      {/* Direction & Commute Routing Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Route Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
            <Route className="w-3.5 h-3.5 text-[#008751]" />
            <span>Direction:</span>
          </span>

          <button
            onClick={() => setRouteMode('ppa-to-cds')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              routeMode === 'ppa-to-cds'
                ? 'bg-[#008751] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>🔵 PPA ➔ 🟢 CDS</span>
          </button>

          {userLocation && (
            <button
              onClick={() => setRouteMode('user-to-cds')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                routeMode === 'user-to-cds'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>📍 Live GPS ➔ 🟢 CDS</span>
            </button>
          )}

          {userLocation && (
            <button
              onClick={() => setRouteMode('user-to-ppa')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                routeMode === 'user-to-ppa'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>📍 Live GPS ➔ 🔵 PPA</span>
            </button>
          )}
        </div>

        {/* Live Route Distance & Commute Estimate */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
              {isLoadingRoute ? 'Calculating...' : `${routeDistanceKm} km road`}
            </span>
            <span className="text-slate-300 font-semibold flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>~{routeDurationMins} mins (Keke/Car)</span>
            </span>
          </div>

          <button
            onClick={() => setIsBasisExpanded(prev => !prev)}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-[11px] underline"
          >
            <span>{isBasisExpanded ? 'Hide Calculation' : 'Calculation Basis'}</span>
            {isBasisExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

      </div>

      {/* =========================================================================
          EXACT CALCULATION BASIS CARD (Shows exact coordinates where distance/route was calculated on)
         ========================================================================= */}
      {isBasisExpanded && (
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3 text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-white text-xs">
                Calculation Basis: Location Coordinates & Navigation Waypoints
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Calculated on WGS84 Geodetic Datum
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            
            {/* Origin Location Calculated On */}
            <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-blue-400">
                  Point A (Origin Departure)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                  {isGpsMode ? 'Live GPS' : 'PPA Venue'}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {originName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {originAddress}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span>Latitude: <strong>{originLat.toFixed(5)}°N</strong></span>
                <span>Longitude: <strong>{originLng.toFixed(5)}°E</strong></span>
              </div>
            </div>

            {/* Destination Location Calculated On */}
            <div className="p-3 rounded-xl bg-slate-900 border border-[#008751]/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400">
                  Point B (Destination Venue)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                  CDS Venue
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {destName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {destAddress}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span>Latitude: <strong>{destLat.toFixed(5)}°N</strong></span>
                <span>Longitude: <strong>{destLng.toFixed(5)}°E</strong></span>
              </div>
            </div>

          </div>

          {/* Commute Distance Breakdown Bar */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Road Route Distance: <strong className="text-white font-mono">{routeDistanceKm} km</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">
                Direct Straight-Line: <strong className="text-emerald-400 font-mono">{distancePpaToCds} km</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">
                Est. Commute: <strong className="text-amber-300 font-mono">~{routeDurationMins} mins</strong>
              </span>
            </div>

            <button
              onClick={() => setIsStepsExpanded(prev => !prev)}
              className="text-slate-300 hover:text-white font-semibold underline text-[10px]"
            >
              {isStepsExpanded ? 'Hide Turn Trajectory' : 'View Turn Trajectory (Waypoints)'}
            </button>
          </div>

          {/* Turn by turn list */}
          {isStepsExpanded && routeSteps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              {routeSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="w-4 h-4 rounded-full bg-[#008751]/30 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-[11px] leading-tight text-slate-300">
                    <div>{step.instruction}</div>
                    {step.distance && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{step.distance}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Map Canvas with Floating Controls */}
      <div className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
        
        {/* Leaflet Map Container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-20 flex flex-wrap gap-1 sm:gap-1.5 max-w-[calc(100%-1.25rem)]">
          <button
            onClick={handleFocusPpa}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all ${
              activeMarker === 'ppa'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-blue-300 border border-blue-500/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>PPA Pin</span>
          </button>

          <button
            onClick={handleFocusCds}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all ${
              activeMarker === 'cds'
                ? 'bg-[#008751] text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
            <span>CDS Pin</span>
          </button>

          {userLocation && (
            <button
              onClick={() => {
                setActiveMarker('user');
                if (leafletMapRef.current && userMarkerRef.current) {
                  leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 15);
                  userMarkerRef.current.openPopup();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>My Location</span>
            </button>
          )}

          <button
            onClick={handleFitAll}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
            title="Fit Both Locations in view"
          >
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>Fit Both Pins</span>
          </button>
        </div>

        {/* Floating Direction Info & External App Link */}
        <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 left-2.5 sm:left-auto z-20 flex flex-wrap sm:flex-nowrap items-center justify-end gap-1.5 sm:gap-2 pointer-events-none">
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 text-xs font-mono font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <span className="text-[#008751]">Calculated:</span>
            <span className="text-emerald-400">{routeDistanceKm} km</span>
            <span className="text-slate-400 text-[10px]">({routeDurationMins}m)</span>
          </div>

          <a
            href={directionsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold border border-blue-400/40 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all pointer-events-auto"
            title="Open turn-by-turn directions in external navigation app"
          >
            <span>Live Navigation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Location Pin Details Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        
        {/* Blue Pin Card: PPA */}
        <div
          onClick={handleFocusPpa}
          className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-blue-500/30 flex items-start gap-3.5 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wide">
                🔵 Blue Pin: Primary Assignment (PPA)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {validPpaLat.toFixed(4)}°N, {validPpaLng.toFixed(4)}°E
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-white">
              {ppaName}
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              {ppaAddress}
            </p>
            {ppaNotes && (
              <p className="text-[11px] text-amber-300/90 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/30 inline-block mt-1">
                🧭 {ppaNotes}
              </p>
            )}
          </div>
        </div>

        {/* Green Pin Card: CDS */}
        <div
          onClick={handleFocusCds}
          className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-[#008751]/40 flex flex-col justify-between gap-3 cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#008751]/20 text-[#008751] flex items-center justify-center shrink-0 border border-[#008751]/40">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                  🟢 Green Pin: Weekly CDS Secretariat
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {validCdsLat.toFixed(4)}°N, {validCdsLng.toFixed(4)}°E
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {cdsGroup}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                {cdsAddress}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-emerald-300 font-bold bg-[#008751]/20 px-2 py-0.5 rounded border border-[#008751]/30">
                  📅 Every {cdsMeetingDay} @ {cdsMeetingTime}
                </span>
                {transitFareNotes && (
                  <span className="text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/30 font-medium">
                    🚌 Fare: {transitFareNotes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick "Use Current GPS for CDS" button inside CDS card */}
          <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-slate-400">
              At your CDS meeting venue right now?
            </span>
            <button
              onClick={handleUseCurrentGpsForCds}
              disabled={isUpdatingCdsGps}
              className="px-3 py-1.5 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-102 shrink-0 w-full sm:w-auto"
              title="Save your current GPS coordinates as your CDS meeting venue"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Use Current GPS for CDS</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
