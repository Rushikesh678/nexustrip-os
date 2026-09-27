import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, AlertTriangle, ShieldCheck, CheckCircle2, ShieldAlert,
  Layers, Navigation, Hotel, Car, Utensils, Ticket, Info, Radio, Zap
} from 'lucide-react';

// Fix default Leaflet icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically re-center map when coordinates change
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export const MapView = ({
  destinationCoords,
  destinationName,
  entities = [],
  overallRiskScore = 0,
  twinState = 'normal',
  weatherSnapshot = {},
  isSimulation = false
}) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showRadarOverlay, setShowRadarOverlay] = useState(true);
  const [showRipples, setShowRipples] = useState(true);

  // Fallback center coordinates (Mumbai or destination)
  const defaultLat = destinationCoords?.lat || 11.9674;
  const defaultLon = destinationCoords?.lon || 121.9248;
  const mapCenter = [defaultLat, defaultLon];

  // Helper to create custom HTML Pin for Leaflet
  const createCustomPin = (type, riskLevel) => {
    let bgColor = '#22c55e'; // green low
    let ringColor = 'rgba(34, 197, 94, 0.4)';
    let iconChar = '📍';

    if (riskLevel === 'critical') {
      bgColor = '#0f172a'; // dark black
      ringColor = 'rgba(239, 68, 68, 0.6)';
    } else if (riskLevel === 'high') {
      bgColor = '#dc2626'; // red
      ringColor = 'rgba(220, 38, 38, 0.4)';
    } else if (riskLevel === 'medium') {
      bgColor = '#f59e0b'; // yellow
      ringColor = 'rgba(245, 158, 11, 0.4)';
    }

    if (type === 'accommodation') iconChar = '🏨';
    else if (type === 'transportation') iconChar = '✈️';
    else if (type === 'activity') iconChar = '🎟️';
    else if (type === 'meal') iconChar = '🍽️';

    const html = `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: ${bgColor};
        color: #ffffff;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 14px ${ringColor}, 0 2px 6px rgba(0,0,0,0.3);
        font-size: 17px;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span>${iconChar}</span>
        <div style="
          position: absolute;
          bottom: -4px;
          width: 6px;
          height: 6px;
          background: ${bgColor};
          transform: rotate(45deg);
        "></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Center anchor pin for trip destination
  const destinationIcon = L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        background-color: #122315;
        color: #55dd4a;
        border: 3px solid #55dd4a;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(85, 221, 74, 0.7), 0 4px 10px rgba(0,0,0,0.4);
        font-size: 22px;
      ">
        ⚓
      </div>
    `,
    className: 'destination-marker',
    iconSize: [46, 46],
    iconAnchor: [23, 46],
    popupAnchor: [0, -46]
  });

  const rainAmount = weatherSnapshot?.rainfallMm || weatherSnapshot?.rainfall_1h || 0;
  const windAmount = weatherSnapshot?.windKph || weatherSnapshot?.wind_speed || 15;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Map Control Toolbar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-forest-ink)'
          }}>
            <Navigation size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '17px', margin: 0, color: 'var(--color-forest-ink)' }}>
                GEOSPATIAL DIGITAL TWIN RADAR ({destinationName?.toUpperCase() || 'DESTINATION'})
              </h4>
              {isSimulation && (
                <span style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  Simulated
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)' }}>
              {entities.length} monitored itinerary nodes plotted around atmospheric observation anchor
            </span>
          </div>
        </div>

        {/* Legend Pills & Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, paddingRight: '12px', borderRight: '1px solid #e2e8f0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Low
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> Med
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} /> High
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0f172a' }} /> Critical
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowRadarOverlay(!showRadarOverlay)}
            className="btn-ghost-cream"
            style={{
              fontSize: '11px',
              padding: '5px 10px',
              backgroundColor: showRadarOverlay ? '#e0f2fe' : 'transparent',
              borderColor: showRadarOverlay ? '#38bdf8' : 'var(--color-sage-border)'
            }}
          >
            <Radio size={13} color={showRadarOverlay ? '#0284c7' : 'inherit'} /> Radar Heatmap
          </button>

          <button
            type="button"
            onClick={() => setShowRipples(!showRipples)}
            className="btn-ghost-cream"
            style={{
              fontSize: '11px',
              padding: '5px 10px',
              backgroundColor: showRipples ? '#fef3c7' : 'transparent',
              borderColor: showRipples ? '#f59e0b' : 'var(--color-sage-border)'
            }}
          >
            <Layers size={13} color={showRipples ? '#b45309' : 'inherit'} /> Risk Ripples
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div style={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid var(--color-sage-border)',
        boxShadow: 'var(--shadow-preview)',
        height: '520px',
        position: 'relative',
        backgroundColor: '#e2e8f0'
      }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <RecenterMap center={mapCenter} zoom={13} />

          {/* OpenStreetMap Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Center Anchor Marker */}
          <Marker position={mapCenter} icon={destinationIcon}>
            <Popup>
              <div style={{ padding: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)' }}>
                  ⚓ {destinationName || 'Trip Anchor Hub'}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4b5563' }}>
                  Atmospheric telemetry base: <strong>{weatherSnapshot?.temp || 28}°C</strong>, <strong>{rainAmount} mm rain</strong>, <strong>{windAmount} km/h wind</strong>.
                </p>
                <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>
                  Overall Digital Twin Risk: {overallRiskScore}/100 ({twinState.toUpperCase()})
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Atmospheric Simulated Radar / Precipitation Buffer Circles */}
          {showRadarOverlay && (
            <Circle
              center={mapCenter}
              radius={twinState === 'critical' ? 8500 : 5000}
              pathOptions={{
                color: twinState === 'critical' ? '#ef4444' : twinState === 'degraded' ? '#f59e0b' : '#38bdf8',
                fillColor: twinState === 'critical' ? '#ef4444' : twinState === 'degraded' ? '#f59e0b' : '#38bdf8',
                fillOpacity: twinState === 'critical' ? 0.22 : 0.12,
                weight: 2,
                dashArray: '4, 8'
              }}
            />
          )}

          {/* Individual Booking Nodes */}
          {entities.map((ent, idx) => {
            const pinLat = ent.coordinates?.lat || (defaultLat + (idx % 2 === 0 ? 0.012 : -0.014) * (idx + 1));
            const pinLon = ent.coordinates?.lon || (defaultLon + (idx % 3 === 0 ? 0.014 : -0.012) * (idx + 1));
            const pinPos = [pinLat, pinLon];

            const riskCol = ent.riskLevel === 'critical' ? '#0f172a' : ent.riskLevel === 'high' ? '#dc2626' : ent.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';

            return (
              <React.Fragment key={ent.bookingId || idx}>
                {/* Risk Ripple Rings around vulnerable nodes */}
                {showRipples && (ent.riskLevel === 'high' || ent.riskLevel === 'critical') && (
                  <Circle
                    center={pinPos}
                    radius={ent.riskLevel === 'critical' ? 2200 : 1200}
                    pathOptions={{
                      color: riskCol,
                      fillColor: riskCol,
                      fillOpacity: 0.18,
                      weight: 1.5
                    }}
                  />
                )}

                <Marker
                  position={pinPos}
                  icon={createCustomPin(ent.type, ent.riskLevel)}
                  eventHandlers={{
                    click: () => setSelectedEntity(ent)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '240px', padding: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                          {ent.type}
                        </span>
                        <span style={{
                          backgroundColor: riskCol,
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          textTransform: 'uppercase'
                        }}>
                          {ent.riskLevel} ({ent.riskScore}/100)
                        </span>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)', lineHeight: 1.3 }}>
                        {ent.bookingName}
                      </div>

                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        📍 {ent.location || destinationName}
                      </div>

                      <div style={{ marginTop: '8px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>Direct Effect:</div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.3 }}>
                          {ent.directEffect}
                        </div>
                      </div>

                      {ent.cascadingEffects && ent.cascadingEffects.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                            Cascading Propagation:
                          </div>
                          <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px', lineHeight: 1.3 }}>
                            ↳ {ent.cascadingEffects[0]}
                          </div>
                        </div>
                      )}

                      {ent.recommendedAction && (
                        <div style={{ marginTop: '8px', backgroundColor: '#f0fdf4', padding: '6px 8px', borderRadius: '6px', border: '1px solid #86efac' }}>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                            Mitigation Action:
                          </div>
                          <div style={{ fontSize: '11px', color: '#14532d', marginTop: '1px', fontWeight: 600 }}>
                            {ent.recommendedAction}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#64748b' }}>Impact Probability:</span>
                        <strong style={{ color: '#0f172a' }}>{Math.round((ent.probabilityOfImpact || 0.15) * 100)}%</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
