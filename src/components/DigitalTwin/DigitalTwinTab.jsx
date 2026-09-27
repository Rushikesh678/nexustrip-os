import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WeatherPanel } from './WeatherPanel';
import { MapView } from './MapView';
import { ImpactDashboard } from './ImpactDashboard';
import { WhatIfSimulator } from './WhatIfSimulator';
import { SocialSignals } from './SocialSignals';
import {
  Cpu, CloudRain, MapPin, Activity, Sliders, Radio,
  RefreshCw, RotateCcw, ShieldCheck, ShieldAlert, AlertTriangle,
  Layers, Sparkles, Navigation, Globe
} from 'lucide-react';

export const DigitalTwinTab = ({
  trip,
  bookings = [],
  participants = []
}) => {
  const tripId = trip?._id;
  const destinationName = trip?.destination || (bookings[0]?.location) || 'Mumbai';

  // Sub-view Tab State: 'dashboard' | 'map' | 'weather' | 'simulator' | 'social'
  const [activeSubView, setActiveSubView] = useState('dashboard');

  // Core Data State
  const [weatherData, setWeatherData] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [simulatedData, setSimulatedData] = useState(null);

  // Loading States
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Simulation Flag
  const isSimulationActive = !!simulatedData;

  // Active Twin Data (switches between simulated and live)
  const activeTwinData = simulatedData || impactData;

  // Initial Data Loader
  const loadAllDigitalTwinData = async (forceRefresh = false) => {
    if (!tripId) return;

    setLoadingWeather(true);
    setLoadingSocial(true);
    setLoadingImpact(true);

    try {
      // 1. Fetch live weather
      const wRes = await api.getDigitalTwinWeather(tripId, destinationName, forceRefresh);
      if (wRes?.success) setWeatherData(wRes.data);
    } catch (e) {
      console.warn('[DigitalTwinTab] Weather load error:', e);
    } finally {
      setLoadingWeather(false);
    }

    try {
      // 2. Fetch social signals
      const sRes = await api.getDigitalTwinSocial(tripId, destinationName);
      if (sRes?.success) setSocialData(sRes.data);
    } catch (e) {
      console.warn('[DigitalTwinTab] Social load error:', e);
    } finally {
      setLoadingSocial(false);
    }

    try {
      // 3. Fetch digital twin impact state
      const iRes = await api.getDigitalTwinImpact(tripId);
      if (iRes?.success) setImpactData(iRes.data);
    } catch (e) {
      console.warn('[DigitalTwinTab] Impact load error:', e);
    } finally {
      setLoadingImpact(false);
    }
  };

  useEffect(() => {
    loadAllDigitalTwinData();
  }, [tripId, destinationName]);

  // Handler for What-If Simulation
  const handleRunSimulation = async (scenarioParams) => {
    if (!tripId) return;
    setSimulating(true);
    try {
      const res = await api.simulateDigitalTwin(tripId, scenarioParams);
      if (res?.success && res.data) {
        setSimulatedData(res.data);
        setActiveSubView('dashboard'); // Jump to dashboard to see simulated effects
      }
    } catch (err) {
      alert('Simulation error: ' + (err.message || err));
    } finally {
      setSimulating(false);
    }
  };

  // Handler to Reset Simulation back to Live Data
  const handleResetSimulation = () => {
    setSimulatedData(null);
  };

  const overallRisk = activeTwinData?.overallRiskScore ?? 35;
  const twinHealth = activeTwinData?.twinState || (overallRisk > 70 ? 'critical' : overallRisk > 38 ? 'degraded' : 'normal');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Digital Twin Master Header Banner */}
      <div style={{
        backgroundColor: 'var(--color-forest-ink, #122315)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-preview)',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid var(--color-sage-border)'
      }}>
        {/* Decorative Grid Backdrop */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '40%',
          backgroundImage: 'radial-gradient(rgba(85, 221, 74, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.7,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(85, 221, 74, 0.2)',
                color: 'var(--color-meadow, #55dd4a)',
                border: '1.5px solid var(--color-meadow)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em'
              }}>
                <Cpu size={14} /> AI DIGITAL TWIN SIMULATION SUITE
              </span>

              {isSimulationActive ? (
                <span style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sliders size={12} /> SCENARIO OVERRIDE ACTIVE
                </span>
              ) : (
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                  Live Meteorological Sync
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: 'var(--font-deacon)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, margin: '10px 0 4px', letterSpacing: '0.04em', color: '#ffffff' }}>
              WEATHER & CASCADING IMPACT DIGITAL TWIN
            </h1>

            <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', maxWidth: '720px', lineHeight: 1.5 }}>
              Continuously simulating how meteorological volatility propagates through transit, hotel check-ins, outdoor activities, and group budget settlements for <strong>{destinationName}</strong>.
            </p>
          </div>

          {/* Master Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isSimulationActive && (
              <button
                onClick={handleResetSimulation}
                className="btn-ghost-cream"
                style={{
                  backgroundColor: '#fee2e2',
                  borderColor: '#f87171',
                  color: '#991b1b',
                  fontSize: '12px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Back to Live Telemetry
              </button>
            )}

            <button
              onClick={() => loadAllDigitalTwinData(true)}
              disabled={loadingWeather || loadingImpact}
              className="btn-meadow"
              style={{ fontSize: '12px', padding: '10px 18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={14} className={(loadingWeather || loadingImpact) ? 'spin-animation' : ''} />
              {(loadingWeather || loadingImpact) ? 'Recalibrating...' : 'Sync Live Radar'}
            </button>
          </div>
        </div>

        {/* Digital Twin Sub-Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {[
            { id: 'dashboard', label: 'Impact Dashboard', icon: Activity },
            { id: 'map', label: 'Geospatial Radar Map', icon: MapPin },
            { id: 'weather', label: 'Live Weather Telemetry', icon: CloudRain },
            { id: 'simulator', label: 'What-If Simulation Lab', icon: Sliders },
            { id: 'social', label: 'Reddit Social Signals', icon: Radio }
          ].map(tab => {
            const IconC = tab.icon;
            const isActive = activeSubView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id)}
                style={{
                  backgroundColor: isActive ? 'var(--color-meadow, #55dd4a)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? 'var(--color-forest-ink, #122315)' : '#f1f5f9',
                  border: isActive ? '1.5px solid var(--color-meadow)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-deacon)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconC size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-View Content Routing */}

      {/* 1. IMPACT DASHBOARD VIEW */}
      {activeSubView === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ImpactDashboard
            twinData={activeTwinData}
            loading={loadingImpact}
            onOpenSimulator={() => setActiveSubView('simulator')}
            onResetSimulation={handleResetSimulation}
          />

          {/* Embedded Geospatial Preview */}
          <MapView
            destinationCoords={activeTwinData?.tripDestinationCoords || weatherData?.coordinates}
            destinationName={destinationName}
            entities={activeTwinData?.entities || []}
            overallRiskScore={overallRisk}
            twinState={twinHealth}
            weatherSnapshot={activeTwinData?.weatherSnapshot || weatherData?.weather?.current}
          />
        </div>
      )}

      {/* 2. GEOSPATIAL MAP VIEW */}
      {activeSubView === 'map' && (
        <MapView
          destinationCoords={activeTwinData?.tripDestinationCoords || weatherData?.coordinates}
          destinationName={destinationName}
          entities={activeTwinData?.entities || []}
          overallRiskScore={overallRisk}
          twinState={twinHealth}
          weatherSnapshot={activeTwinData?.weatherSnapshot || weatherData?.weather?.current}
        />
      )}

      {/* 3. LIVE WEATHER VIEW */}
      {activeSubView === 'weather' && (
        <WeatherPanel
          weatherData={weatherData}
          loading={loadingWeather}
          onRefresh={() => loadAllDigitalTwinData(true)}
          locationName={destinationName}
        />
      )}

      {/* 4. WHAT-IF SIMULATOR VIEW */}
      {activeSubView === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <WhatIfSimulator
            onRunSimulation={handleRunSimulation}
            onResetSimulation={handleResetSimulation}
            simulating={simulating}
            isSimulationActive={isSimulationActive}
            locationName={destinationName}
            liveWeather={weatherData?.weather?.current}
            simulatedData={simulatedData}
          />

          {/* If simulation has been run, show immediate visual map and impact results */}
          {isSimulationActive && (
            <>
              <MapView
                destinationCoords={activeTwinData?.tripDestinationCoords || weatherData?.coordinates}
                destinationName={destinationName}
                entities={activeTwinData?.entities || []}
                overallRiskScore={overallRisk}
                twinState={twinHealth}
                weatherSnapshot={activeTwinData?.weatherSnapshot || weatherData?.weather?.current}
                isSimulation={true}
              />

              <ImpactDashboard
                twinData={activeTwinData}
                loading={simulating}
                onOpenSimulator={() => setActiveSubView('simulator')}
                onResetSimulation={handleResetSimulation}
              />
            </>
          )}
        </div>
      )}

      {/* 5. REDDIT SOCIAL SIGNALS VIEW */}
      {activeSubView === 'social' && (
        <SocialSignals
          socialData={socialData}
          loading={loadingSocial}
          onRefresh={() => loadAllDigitalTwinData(true)}
          destinationName={destinationName}
        />
      )}
    </div>
  );
};
