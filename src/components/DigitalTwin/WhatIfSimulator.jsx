import React, { useState } from 'react';
import {
  Sliders, Play, RefreshCw, AlertTriangle, CloudRain, Thermometer,
  Wind, Clock, Waves, Flame, Sparkles, Check, RotateCcw, ArrowRight,
  TrendingUp, ShieldAlert, ShieldCheck, Zap
} from 'lucide-react';

export const WhatIfSimulator = ({
  onRunSimulation,
  onResetSimulation,
  simulating,
  isSimulationActive,
  locationName = 'Destination',
  liveWeather = {},
  simulatedData = null
}) => {
  const [params, setParams] = useState({
    rainfallMm: 350,
    tempDeltaCelsius: -2,
    stormDurationHours: 12,
    windKph: 75,
    floodRisk: true,
    extremeHeat: false,
    location: locationName
  });

  const presets = [
    {
      id: 'monsoon_deluge',
      name: 'Monsoon Cloudburst',
      icon: '🌧️',
      desc: '350mm rain, 12h storm, 75km/h wind + urban flood trigger',
      config: { rainfallMm: 350, tempDeltaCelsius: -2, stormDurationHours: 12, windKph: 75, floodRisk: true, extremeHeat: false }
    },
    {
      id: 'cyclone',
      name: 'Tropical Cyclone',
      icon: '🌀',
      desc: '130km/h gale winds, 280mm downpour, 24h duration',
      config: { rainfallMm: 280, tempDeltaCelsius: -4, stormDurationHours: 24, windKph: 130, floodRisk: true, extremeHeat: false }
    },
    {
      id: 'heatwave',
      name: 'Heatwave Crisis',
      icon: '🔥',
      desc: '+8°C temperature spike, extreme heat index warning',
      config: { rainfallMm: 0, tempDeltaCelsius: 8, stormDurationHours: 0, windKph: 12, floodRisk: false, extremeHeat: true }
    },
    {
      id: 'alpine_blizzard',
      name: 'Alpine Blizzard',
      icon: '❄️',
      desc: '-14°C temperature drop, 90km/h winds, zero visibility',
      config: { rainfallMm: 45, tempDeltaCelsius: -14, stormDurationHours: 36, windKph: 90, floodRisk: false, extremeHeat: false }
    },
    {
      id: 'clear_skies',
      name: 'Clear & Favorable',
      icon: '☀️',
      desc: '0mm rain, gentle 10km/h breeze, nominal status',
      config: { rainfallMm: 0, tempDeltaCelsius: 0, stormDurationHours: 0, windKph: 10, floodRisk: false, extremeHeat: false }
    }
  ];

  const handleApplyPreset = (preset) => {
    setParams(prev => ({
      ...prev,
      ...preset.config
    }));
  };

  const handleSliderChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleToggle = (field) => {
    setParams(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onRunSimulation(params);
  };

  const liveRain = liveWeather?.rainfall_1h || liveWeather?.rainfallMm || 0;
  const liveWind = liveWeather?.wind_speed || 15;
  const liveTemp = liveWeather?.temp || 28;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Simulation Header & Live Baseline Contrast */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-muted)',
              color: 'var(--color-forest-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-deacon)', fontSize: '22px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
                  WHAT-IF COUNTERFACTUAL SIMULATION LAB
                </h3>
                <span style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  Interactive
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Test atmospheric volatility against <strong>{locationName}</strong> itinerary nodes. See cascading cancellations and budget impact in real-time.
              </p>
            </div>
          </div>

          {isSimulationActive && (
            <button
              type="button"
              onClick={onResetSimulation}
              className="btn-ghost-cream"
              style={{
                fontSize: '12px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#fee2e2',
                borderColor: '#fca5a5',
                color: '#b91c1c',
                fontWeight: 800
              }}
            >
              <RotateCcw size={14} /> Restore Live Telemetry
            </button>
          )}
        </div>

        {/* Live Baseline Telemetry vs Active Simulation Comparison Pill */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1.5px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>
              📍 Live Ground-Truth Baseline
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-forest-ink)', marginTop: '2px' }}>
              {liveTemp}°C • {liveRain} mm/h rain • {liveWind} km/h wind
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
              🧪 Scenario Input Delta
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
              {params.rainfallMm} mm rain • {params.windKph} km/h wind • {params.stormDurationHours}h storm
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isSimulationActive ? '#fef2f2' : '#f0fdf4',
              color: isSimulationActive ? '#dc2626' : '#15803d',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 800,
              border: `1px solid ${isSimulationActive ? '#f87171' : '#86efac'}`
            }}>
              {isSimulationActive ? '⚠️ SIMULATED OVERRIDE ACTIVE' : '✅ SYNCHRONIZED WITH LIVE METAR'}
            </span>
          </div>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-moss-gray)', marginBottom: '10px' }}>
            1-Click Scenario Presets:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {presets.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-forest-ink)'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              >
                <span style={{ fontSize: '22px' }}>{p.icon}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-forest-ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px', lineHeight: 1.2 }}>
                    {p.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Controls Form */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* 1. Rainfall Slider */}
          <div style={{ backgroundColor: '#f0f9ff', padding: '18px', borderRadius: '16px', border: '1.5px solid #bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, fontSize: '13px' }}>
                <CloudRain size={18} /> RAINFALL INTENSITY
              </div>
              <span style={{ fontFamily: 'var(--font-deacon)', fontSize: '22px', fontWeight: 900, color: '#0369a1' }}>
                {params.rainfallMm} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={params.rainfallMm}
              onChange={(e) => handleSliderChange('rainfallMm', e.target.value)}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>0 mm (Drizzle)</span>
              <span>200 mm (Monsoon)</span>
              <span>500 mm (Cloudburst)</span>
            </div>
          </div>

          {/* 2. Storm Duration Slider */}
          <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 800, fontSize: '13px' }}>
                <Clock size={18} /> STORM DURATION
              </div>
              <span style={{ fontFamily: 'var(--font-deacon)', fontSize: '22px', fontWeight: 900, color: '#1e293b' }}>
                {params.stormDurationHours} Hours
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="72"
              step="2"
              value={params.stormDurationHours}
              onChange={(e) => handleSliderChange('stormDurationHours', e.target.value)}
              style={{ width: '100%', accentColor: '#475569', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>0h (Passing)</span>
              <span>24h (Prolonged)</span>
              <span>72h (3-Day Crisis)</span>
            </div>
          </div>

          {/* 3. Temperature Delta Slider */}
          <div style={{ backgroundColor: '#fff7ed', padding: '18px', borderRadius: '16px', border: '1.5px solid #fed7aa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 800, fontSize: '13px' }}>
                <Thermometer size={18} /> TEMPERATURE DELTA
              </div>
              <span style={{ fontFamily: 'var(--font-deacon)', fontSize: '22px', fontWeight: 900, color: '#c2410c' }}>
                {params.tempDeltaCelsius > 0 ? `+${params.tempDeltaCelsius}` : params.tempDeltaCelsius}°C
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={params.tempDeltaCelsius}
              onChange={(e) => handleSliderChange('tempDeltaCelsius', e.target.value)}
              style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>-20°C (Cold snap)</span>
              <span>0°C (Baseline)</span>
              <span>+20°C (Extreme heat)</span>
            </div>
          </div>

          {/* 4. Wind Speed Slider */}
          <div style={{ backgroundColor: '#fefce8', padding: '18px', borderRadius: '16px', border: '1.5px solid #fef08a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a16207', fontWeight: 800, fontSize: '13px' }}>
                <Wind size={18} /> WIND VELOCITY
              </div>
              <span style={{ fontFamily: 'var(--font-deacon)', fontSize: '22px', fontWeight: 900, color: '#a16207' }}>
                {params.windKph} km/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={params.windKph}
              onChange={(e) => handleSliderChange('windKph', e.target.value)}
              style={{ width: '100%', accentColor: '#ca8a04', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>0 km/h (Calm)</span>
              <span>80 km/h (Squall)</span>
              <span>200 km/h (Cat-3 Gale)</span>
            </div>
          </div>
        </div>

        {/* Hazard Toggles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {/* Flood Inundation Toggle */}
          <div
            onClick={() => handleToggle('floodRisk')}
            style={{
              backgroundColor: params.floodRisk ? '#eff6ff' : '#f8fafc',
              border: `2px solid ${params.floodRisk ? '#3b82f6' : '#e2e8f0'}`,
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Waves size={22} color={params.floodRisk ? '#2563eb' : '#64748b'} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)' }}>
                  Arterial Flooding Hazard
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Triggers &gt;30cm surface waterlogging & port ferry halts
                </div>
              </div>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: params.floodRisk ? '#2563eb' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {params.floodRisk && <Check size={16} />}
            </div>
          </div>

          {/* Extreme Heat Toggle */}
          <div
            onClick={() => handleToggle('extremeHeat')}
            style={{
              backgroundColor: params.extremeHeat ? '#fff1f2' : '#f8fafc',
              border: `2px solid ${params.extremeHeat ? '#f43f5e' : '#e2e8f0'}`,
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Flame size={22} color={params.extremeHeat ? '#e11d48' : '#64748b'} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)' }}>
                  Extreme Heat Advisory
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Suspends strenuous midday excursions & water excursions
                </div>
              </div>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: params.extremeHeat ? '#e11d48' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {params.extremeHeat && <Check size={16} />}
            </div>
          </div>
        </div>

        {/* Submit Simulation Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-moss-gray)' }}>
            Simulation Engine: <strong>Groq LLaMA-3.3 (70B) & Physics Reasoner</strong>
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="btn-meadow"
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-preview)'
            }}
          >
            {simulating ? (
              <>
                <RefreshCw size={18} className="spin-animation" />
                SIMULATING CASCADING GRAPH...
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                RUN WHAT-IF SIMULATION
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
