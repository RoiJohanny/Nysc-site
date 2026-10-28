import React, { useState, useEffect, useRef, Component, ErrorInfo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Pin
} from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { STATE_COORDINATES } from '../../data/mockSeed';
import firebaseConfigData from '../../../firebase-applet-config.json';
import {
  Navigation,
  Edit2,
  ExternalLink,
  Layers,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Maximize2
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

// React Error Boundary to catch any script/SDK initialization errors from Google Maps
class GoogleMapsErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[Google Maps ErrorBoundary caught error]', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Camera controller for Google Maps
function GoogleMapCameraController({
  ppaLat,
  ppaLng,
  cdsLat,
  cdsLng,
  triggerFit
}: {
  ppaLat: number;
  ppaLng: number;
  cdsLat: number;
  cdsLng: number;
  triggerFit: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      const googleMaps = (window as any).google?.maps;
      if (googleMaps?.LatLngBounds) {
        const bounds = new googleMaps.LatLngBounds();
        bounds.extend({ lat: ppaLat, lng: ppaLng });
        bounds.extend({ lat: cdsLat, lng: cdsLng });
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      } else {
        map.setCenter({ lat: ppaLat, lng: ppaLng });
        map.setZoom(13);
      }
    } catch {
      map.setCenter({ lat: ppaLat, lng: ppaLng });
      map.setZoom(13);
    }
  }, [map, ppaLat, ppaLng, cdsLat, cdsLng, triggerFit]);

  return null;
}

// Leaflet Map fallback implementation
const LeafletInteractiveMap: React.FC<{
  ppaLat: number;
  ppaLng: number;
  ppaName: string;
  ppaAddress: string;
  ppaNotes?: string;
  cdsLat: number;
  cdsLng: number;
  cdsGroup: string;
  cdsAddress: string;
  cdsMeetingDay: string;
  cdsMeetingTime: string;
  transitFareNotes?: string;
  triggerFit: number;
}> = ({
  ppaLat,
  ppaLng,
  ppaName,
  ppaAddress,
  ppaNotes,
  cdsLat,
  cdsLng,
  cdsGroup,
  cdsAddress,
  cdsMeetingDay,
  cdsMeetingTime,
  transitFareNotes,
  triggerFit
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if already initialized to prevent duplicate map instances
    if ((mapContainerRef.current as any)._leaflet_id) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [ppaLat, ppaLng],
      zoom: 13,
      zoomControl: true
    });
    leafletMapRef.current = map;

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom Blue PPA SVG Pin
    const ppaIcon = L.divIcon({
      className: 'custom-leaflet-ppa-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 15px;">🏢</span>
          </div>
          <span style="background: rgba(15,23,42,0.9); color: #93c5fd; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-top: 4px; white-space: nowrap; border: 1px solid rgba(59,130,246,0.4);">PPA</span>
        </div>
      `,
      iconSize: [34, 48],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });

    // Custom Green CDS SVG Pin
    const cdsIcon = L.divIcon({
      className: 'custom-leaflet-cds-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #008751; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,135,81,0.6); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 15px;">👥</span>
          </div>
          <span style="background: rgba(15,23,42,0.9); color: #6ee7b7; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; margin-top: 4px; white-space: nowrap; border: 1px solid rgba(16,185,129,0.4);">CDS</span>
        </div>
      `,
      iconSize: [34, 48],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });

    // Add PPA Marker & Popup
    const ppaMarker = L.marker([ppaLat, ppaLng], { icon: ppaIcon }).addTo(map);
    ppaMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px;">
        <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase;">Primary Assignment (PPA)</div>
        <div style="font-weight: 700; margin-top: 2px;">${ppaName}</div>
        <div style="color: #64748b; font-size: 11px;">${ppaAddress}</div>
        ${ppaNotes ? `<div style="margin-top: 4px; padding: 4px; background: #fef3c7; border-radius: 4px; font-size: 10px; color: #92400e;">🧭 ${ppaNotes}</div>` : ''}
      </div>
    `);

    // Add CDS Marker & Popup
    const cdsMarker = L.marker([cdsLat, cdsLng], { icon: cdsIcon }).addTo(map);
    cdsMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px;">
        <div style="font-size: 10px; font-weight: 800; color: #008751; text-transform: uppercase;">CDS Secretariat Venue</div>
        <div style="font-weight: 700; margin-top: 2px;">${cdsGroup}</div>
        <div style="color: #64748b; font-size: 11px;">${cdsAddress}</div>
        <div style="color: #047857; font-weight: 600; font-size: 11px; margin-top: 2px;">📅 Every ${cdsMeetingDay} @ ${cdsMeetingTime}</div>
        ${transitFareNotes ? `<div style="margin-top: 4px; padding: 4px; background: #e0f2fe; border-radius: 4px; font-size: 10px; color: #0369a1;">🚌 Fare: ${transitFareNotes}</div>` : ''}
      </div>
    `);

    // Fit bounds to show both pins
    const bounds = L.latLngBounds([[ppaLat, ppaLng], [cdsLat, cdsLng]]);
    map.fitBounds(bounds, { padding: [50, 50] });

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      leafletMapRef.current = null;
    };
  }, [ppaLat, ppaLng, cdsLat, cdsLng]);

  // Fit bounds when trigger changes
  useEffect(() => {
    if (leafletMapRef.current) {
      const bounds = L.latLngBounds([[ppaLat, ppaLng], [cdsLat, cdsLng]]);
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [triggerFit, ppaLat, ppaLng, cdsLat, cdsLng]);

  return <div ref={mapContainerRef} className="w-full h-full z-10" />;
};

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
  const [activeMarker, setActiveMarker] = useState<'ppa' | 'cds' | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Custom key from localStorage or VITE_GOOGLE_MAPS_API_KEY
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [gmpApiKey, setGmpApiKey] = useState<string>(() => {
    return (
      localStorage.getItem('nysc_gmp_api_key') ||
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      ''
    );
  });

  // State to track if Maps JavaScript API failed to activate
  const [isApiNotActivated, setIsApiNotActivated] = useState<boolean>(() => {
    return localStorage.getItem('nysc_gmp_api_not_activated') === 'true';
  });

  // Preferred Map Provider: 'google' or 'leaflet'
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>(() => {
    // If no valid Maps key or previously deactivated, default to interactive Leaflet
    const savedKey = localStorage.getItem('nysc_gmp_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const previouslyFailed = localStorage.getItem('nysc_gmp_api_not_activated') === 'true';
    if (!savedKey || previouslyFailed) {
      return 'leaflet';
    }
    return 'google';
  });

  // Listen to global GMP activation and auth failure events
  useEffect(() => {
    const handleApiNotActivated = (e: any) => {
      console.warn('[GeolocationMap] Google Maps API Not Activated event detected', e);
      setIsApiNotActivated(true);
      setMapProvider('leaflet');
      localStorage.setItem('nysc_gmp_api_not_activated', 'true');
    };

    const handleAuthFailed = () => {
      console.warn('[GeolocationMap] Google Maps Auth Failed');
      setIsApiNotActivated(true);
      setMapProvider('leaflet');
    };

    window.addEventListener('gmp-api-not-activated', handleApiNotActivated);
    window.addEventListener('gmp-auth-failed', handleAuthFailed);
    window.addEventListener('gmp-script-error', handleAuthFailed);

    return () => {
      window.removeEventListener('gmp-api-not-activated', handleApiNotActivated);
      window.removeEventListener('gmp-auth-failed', handleAuthFailed);
      window.removeEventListener('gmp-script-error', handleAuthFailed);
    };
  }, []);

  // Compute straight-line distance in km
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
    return (R * c).toFixed(2);
  };

  const distanceKm = calculateDistanceKm(ppaLat, ppaLng, cdsLat, cdsLng);

  // Fallback state coordinates
  const fallbackCoords = STATE_COORDINATES[stateName] || [6.5925, 3.3444];
  const initialLat = ppaLat || fallbackCoords[0];
  const initialLng = ppaLng || fallbackCoords[1];

  // Apply custom key
  const handleSaveCustomKey = () => {
    const trimmed = customKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('nysc_gmp_api_key', trimmed);
      localStorage.removeItem('nysc_gmp_api_not_activated');
      setGmpApiKey(trimmed);
      setIsApiNotActivated(false);
      setMapProvider('google');
      setShowKeyConfig(false);
    }
  };

  // Google Cloud Project ID
  const projectId = firebaseConfigData?.projectId || 'gen-lang-client-0545512303';
  const gcpEnableUrl = `https://console.cloud.google.com/apis/library/maps-backend.googleapis.com?project=${projectId}`;
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ppaLat},${ppaLng}&destination=${cdsLat},${cdsLng}`;

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
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
              {stateName} State ({lgaName} LGA)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              mapProvider === 'google' && !isApiNotActivated
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {mapProvider === 'google' && !isApiNotActivated ? 'Google Maps' : 'Interactive Map (OSM)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time coordinates and transit routing for Primary Assignment (Blue) and CDS Secretariat (Green).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Engine Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => {
                if (!gmpApiKey) {
                  setShowKeyConfig(true);
                } else {
                  setMapProvider('google');
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                mapProvider === 'google' && !isApiNotActivated
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Maps
            </button>
            <button
              onClick={() => setMapProvider('leaflet')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                mapProvider === 'leaflet'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Leaflet
            </button>
          </div>

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

      {/* Activation Notice / Info Banner if Maps API not enabled */}
      {isApiNotActivated && mapProvider === 'leaflet' && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300">
                Maps JavaScript API is pending activation on Cloud Project:
              </span>
              <p className="text-[11px] text-amber-300/80">
                Your interactive service map is active via OpenStreetMap. To switch to Google Maps, enable the Maps JavaScript API in Google Cloud Console or enter an active key.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <a
              href={gcpEnableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all"
            >
              <span>Enable in Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setShowKeyConfig(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Configure Key
            </button>
          </div>
        </div>
      )}

      {/* API Key Configuration Drawer */}
      {showKeyConfig && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#008751]" />
              <span>Google Maps Platform API Key Setup</span>
            </h4>
            <button
              onClick={() => setShowKeyConfig(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste your Google Maps API Key below. Ensure that <strong className="text-white">Maps JavaScript API</strong> is enabled on your Google Cloud Console project (<span className="text-emerald-400 font-mono">{projectId}</span>).
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
            />
            <button
              onClick={handleSaveCustomKey}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold transition-all shadow-md"
            >
              Save & Test Key
            </button>
            <a
              href={gcpEnableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>1-Click Enable API</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      )}

      {/* Map Canvas with Floating Controls */}
      <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
        
        {/* Conditional Rendering between Google Maps & Leaflet */}
        {mapProvider === 'google' && gmpApiKey && !isApiNotActivated ? (
          <GoogleMapsErrorBoundary
            onError={() => {
              setIsApiNotActivated(true);
              setMapProvider('leaflet');
            }}
            fallback={
              <LeafletInteractiveMap
                ppaLat={ppaLat}
                ppaLng={ppaLng}
                ppaName={ppaName}
                ppaAddress={ppaAddress}
                ppaNotes={ppaNotes}
                cdsLat={cdsLat}
                cdsLng={cdsLng}
                cdsGroup={cdsGroup}
                cdsAddress={cdsAddress}
                cdsMeetingDay={cdsMeetingDay}
                cdsMeetingTime={cdsMeetingTime}
                transitFareNotes={transitFareNotes}
                triggerFit={fitTrigger}
              />
            }
          >
            <APIProvider apiKey={gmpApiKey}>
              <Map
                id="nysc-service-map"
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: initialLat, lng: initialLng }}
                defaultZoom={13}
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
                disableDefaultUI={false}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              >
                {/* Camera bound controller */}
                <GoogleMapCameraController
                  ppaLat={ppaLat}
                  ppaLng={ppaLng}
                  cdsLat={cdsLat}
                  cdsLng={cdsLng}
                  triggerFit={fitTrigger}
                />

                {/* Blue AdvancedMarker for PPA */}
                <AdvancedMarker
                  position={{ lat: ppaLat, lng: ppaLng }}
                  title={`PPA: ${ppaName}`}
                  onClick={() => setActiveMarker('ppa')}
                >
                  <Pin
                    background="#2563eb"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={1.2}
                  />
                </AdvancedMarker>

                {/* Green AdvancedMarker for CDS */}
                <AdvancedMarker
                  position={{ lat: cdsLat, lng: cdsLng }}
                  title={`CDS: ${cdsGroup}`}
                  onClick={() => setActiveMarker('cds')}
                >
                  <Pin
                    background="#008751"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={1.2}
                  />
                </AdvancedMarker>

                {/* InfoWindow for PPA Marker */}
                {activeMarker === 'ppa' && (
                  <InfoWindow
                    position={{ lat: ppaLat, lng: ppaLng }}
                    onCloseClick={() => setActiveMarker(null)}
                  >
                    <div className="p-1 max-w-xs text-slate-900 font-sans">
                      <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide">
                        Primary Assignment (PPA)
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">{ppaName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{ppaAddress}</div>
                      {ppaNotes && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1.5 border border-amber-200">
                          🧭 {ppaNotes}
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}

                {/* InfoWindow for CDS Marker */}
                {activeMarker === 'cds' && (
                  <InfoWindow
                    position={{ lat: cdsLat, lng: cdsLng }}
                    onCloseClick={() => setActiveMarker(null)}
                  >
                    <div className="p-1 max-w-xs text-slate-900 font-sans">
                      <div className="text-[10px] font-extrabold text-[#008751] uppercase tracking-wide">
                        CDS Secretariat Venue
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">{cdsGroup}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{cdsAddress}</div>
                      <div className="text-[11px] font-bold text-emerald-700 mt-1">
                        📅 Every {cdsMeetingDay} @ {cdsMeetingTime}
                      </div>
                      {transitFareNotes && (
                        <div className="text-[10px] text-sky-700 bg-sky-50 p-1.5 rounded mt-1.5 border border-sky-200">
                          🚌 Fare: {transitFareNotes}
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}

              </Map>
            </APIProvider>
          </GoogleMapsErrorBoundary>
        ) : (
          <LeafletInteractiveMap
            ppaLat={ppaLat}
            ppaLng={ppaLng}
            ppaName={ppaName}
            ppaAddress={ppaAddress}
            ppaNotes={ppaNotes}
            cdsLat={cdsLat}
            cdsLng={cdsLng}
            cdsGroup={cdsGroup}
            cdsAddress={cdsAddress}
            cdsMeetingDay={cdsMeetingDay}
            cdsMeetingTime={cdsMeetingTime}
            transitFareNotes={transitFareNotes}
            triggerFit={fitTrigger}
          />
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveMarker('ppa')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-blue-300 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>PPA Pin</span>
          </button>

          <button
            onClick={() => setActiveMarker('cds')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
            <span>CDS Pin</span>
          </button>

          <button
            onClick={() => {
              setActiveMarker(null);
              setFitTrigger(prev => prev + 1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md shadow-md transition-all"
            title="Fit Both Locations"
          >
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>Fit Both</span>
          </button>
        </div>

        {/* Floating Distance Badge & Turn-by-Turn Nav Link */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 text-xs font-mono font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="text-[#008751]">Distance:</span>
            <span className="text-amber-300">{distanceKm} km</span>
          </div>

          <a
            href={gmapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold border border-blue-400/40 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all"
            title="Open turn-by-turn directions in Google Maps"
          >
            <span>Directions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Location Pin Details Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        
        {/* Blue Pin Card: PPA */}
        <div
          onClick={() => setActiveMarker('ppa')}
          className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-blue-500/30 flex items-start gap-3.5 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <span className="text-xl">🏢</span>
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wide">
                🔵 Blue Pin: Primary Assignment (PPA)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {ppaLat.toFixed(4)}°N, {ppaLng.toFixed(4)}°E
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
          onClick={() => setActiveMarker('cds')}
          className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-[#008751]/40 flex items-start gap-3.5 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#008751]/20 text-[#008751] flex items-center justify-center shrink-0 border border-[#008751]/40">
            <span className="text-xl">👥</span>
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                🟢 Green Pin: Weekly CDS Secretariat
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {cdsLat.toFixed(4)}°N, {cdsLng.toFixed(4)}°E
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

      </div>

    </div>
  );
};
