import { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATES_INFO } from '@/types/emendas';

interface LeafletMapProps {
  stateValues: Record<string, number>;
  selectedState?: string;
  onStateClick?: (state: string) => void;
  variableLabel?: string;
  formatValue?: (v: number) => string;
}

// Map GeoJSON names to our state names
const GEOJSON_NAME_MAP: Record<string, string> = {
  'Rondônia': 'Rondônia',
  'Acre': 'Acre',
  'Amazonas': 'Amazonas',
  'Roraima': 'Roraima',
  'Pará': 'Pará',
  'Amapá': 'Amapá',
  'Tocantins': 'Tocantins',
  'Maranhão': 'Maranhão',
  'Piauí': 'Piauí',
  'Ceará': 'Ceará',
  'Rio Grande do Norte': 'Rio Grande do Norte',
  'Paraíba': 'Paraíba',
  'Pernambuco': 'Pernambuco',
  'Alagoas': 'Alagoas',
  'Sergipe': 'Sergipe',
  'Bahia': 'Bahia',
  'Minas Gerais': 'Minas Gerais',
  'Espírito Santo': 'Espírito Santo',
  'Rio de Janeiro': 'Rio de Janeiro',
  'São Paulo': 'São Paulo',
  'Paraná': 'Paraná',
  'Santa Catarina': 'Santa Catarina',
  'Rio Grande do Sul': 'Rio Grande do Sul',
  'Mato Grosso do Sul': 'Mato Grosso do Sul',
  'Mato Grosso': 'Mato Grosso',
  'Goiás': 'Goiás',
  'Distrito Federal': 'Distrito Federal',
};

function getColor(value: number, max: number): string {
  if (!value || !max) return '#e8edf2';
  const ratio = Math.min(value / max, 1);
  // Navy gradient
  const r = Math.round(232 - ratio * 182);
  const g = Math.round(237 - ratio * 197);
  const b = Math.round(242 - ratio * 142);
  return `rgb(${r},${g},${b})`;
}

export function LeafletMap({ stateValues, selectedState, onStateClick, variableLabel, formatValue }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  const maxValue = useMemo(() => {
    const vals = Object.values(stateValues).filter(v => v > 0);
    return vals.length ? Math.max(...vals) : 1;
  }, [stateValues]);

  // Load GeoJSON
  useEffect(() => {
    fetch('/data/brazil-states.geojson')
      .then(r => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-14.5, -51],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 8,
      minZoom: 3,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update GeoJSON layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const layer = L.geoJSON(geoData, {
      style: (feature) => {
        const name = feature?.properties?.name;
        const stateName = GEOJSON_NAME_MAP[name] || name;
        const value = stateValues[stateName] || 0;
        const isSelected = selectedState === stateName;

        return {
          fillColor: getColor(value, maxValue),
          weight: isSelected ? 3 : 1,
          opacity: 1,
          color: isSelected ? 'hsl(220, 60%, 25%)' : '#fff',
          fillOpacity: isSelected ? 0.9 : 0.75,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature?.properties?.name;
        const stateName = GEOJSON_NAME_MAP[name] || name;
        const value = stateValues[stateName] || 0;
        const abbr = STATES_INFO[stateName]?.abbr || '';
        const formattedVal = formatValue ? formatValue(value) : value.toLocaleString('pt-BR');

        layer.bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:12px">
            <strong>${abbr} - ${stateName}</strong><br/>
            ${variableLabel || 'Valor'}: <strong>${formattedVal}</strong>
          </div>`,
          { sticky: true, direction: 'top', className: 'leaflet-tooltip-custom' }
        );

        layer.on({
          click: () => onStateClick?.(stateName),
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 2, fillOpacity: 0.9 });
            l.bringToFront();
          },
          mouseout: (e) => {
            geoJsonLayerRef.current?.resetStyle(e.target);
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [geoData, stateValues, selectedState, maxValue, formatValue, variableLabel, onStateClick]);

  const minValue = useMemo(() => {
    const vals = Object.values(stateValues).filter(v => v > 0);
    return vals.length ? Math.min(...vals) : 0;
  }, [stateValues]);

  return (
    <div className="relative w-full">
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden border border-border" />
      
      <div className="absolute bottom-4 right-4 bg-card rounded-lg p-3 border border-border z-[1000]">
        <div className="text-xs font-medium text-foreground mb-2">{variableLabel || 'Intensidade'}</div>
        <div className="flex items-center gap-1">
          <div className="w-full h-3 rounded" style={{
            background: 'linear-gradient(to right, #e8edf2, #4a6fa5, #1a2e50)'
          }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{formatValue ? formatValue(minValue) : minValue.toLocaleString('pt-BR')}</span>
          <span>{formatValue ? formatValue(maxValue) : maxValue.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}
