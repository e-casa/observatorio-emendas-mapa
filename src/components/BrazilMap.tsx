import { useMemo } from 'react';
import { STATES_INFO } from '@/types/emendas';

interface BrazilMapProps {
  selectedState?: string;
  onStateClick?: (state: string) => void;
  stateValues?: Record<string, number>;
  highlightedStates?: string[];
}

// Paths SVG simplificados para os estados do Brasil
const STATE_PATHS: Record<string, string> = {
  'AC': 'M 85 195 L 105 185 L 130 190 L 140 210 L 125 230 L 95 225 L 75 210 Z',
  'AM': 'M 110 120 L 180 100 L 240 110 L 260 150 L 230 190 L 170 200 L 130 190 L 100 160 Z',
  'RR': 'M 160 50 L 200 40 L 230 60 L 220 100 L 180 100 L 150 80 Z',
  'AP': 'M 290 60 L 320 50 L 345 75 L 335 110 L 300 115 L 280 90 Z',
  'PA': 'M 230 100 L 310 90 L 360 120 L 380 170 L 340 220 L 280 230 L 230 200 L 240 150 Z',
  'RO': 'M 145 215 L 200 205 L 230 230 L 220 270 L 170 280 L 140 250 Z',
  'TO': 'M 290 235 L 330 220 L 355 260 L 345 320 L 310 340 L 280 300 Z',
  'MT': 'M 175 280 L 260 270 L 295 300 L 290 380 L 230 410 L 180 380 L 165 320 Z',
  'MS': 'M 225 410 L 275 395 L 305 430 L 295 490 L 245 510 L 210 470 Z',
  'GO': 'M 290 340 L 340 320 L 380 360 L 375 420 L 330 440 L 295 400 Z',
  'DF': 'M 345 380 L 365 375 L 370 395 L 355 405 L 340 395 Z',
  'MA': 'M 345 150 L 410 140 L 440 180 L 420 230 L 370 240 L 340 210 Z',
  'PI': 'M 380 240 L 430 220 L 460 260 L 450 320 L 400 340 L 370 290 Z',
  'CE': 'M 445 200 L 490 185 L 515 220 L 500 265 L 455 275 L 440 240 Z',
  'RN': 'M 500 220 L 540 210 L 555 240 L 535 270 L 500 265 Z',
  'PB': 'M 500 270 L 545 260 L 555 285 L 530 310 L 495 305 Z',
  'PE': 'M 455 290 L 535 275 L 550 310 L 520 340 L 450 350 L 440 320 Z',
  'AL': 'M 520 340 L 550 330 L 560 360 L 540 385 L 515 370 Z',
  'SE': 'M 505 380 L 535 370 L 545 400 L 520 420 L 495 405 Z',
  'BA': 'M 400 350 L 470 340 L 520 380 L 535 460 L 480 530 L 400 510 L 370 440 Z',
  'MG': 'M 330 440 L 420 420 L 470 470 L 460 550 L 390 580 L 330 540 L 320 480 Z',
  'ES': 'M 465 500 L 500 485 L 515 530 L 495 565 L 460 555 Z',
  'RJ': 'M 435 565 L 490 550 L 510 580 L 475 610 L 430 600 Z',
  'SP': 'M 330 540 L 410 520 L 440 560 L 420 620 L 350 640 L 305 590 Z',
  'PR': 'M 295 590 L 360 575 L 390 620 L 365 670 L 300 680 L 275 640 Z',
  'SC': 'M 320 680 L 370 670 L 390 710 L 360 745 L 310 740 Z',
  'RS': 'M 280 720 L 350 710 L 380 760 L 355 830 L 280 845 L 250 790 Z',
};

// Mapeamento de nomes de estados para siglas
const STATE_NAME_TO_ABBR: Record<string, string> = {};
Object.entries(STATES_INFO).forEach(([name, info]) => {
  STATE_NAME_TO_ABBR[name] = info.abbr;
});

export function BrazilMap({ selectedState, onStateClick, stateValues, highlightedStates = [] }: BrazilMapProps) {
  const maxValue = useMemo(() => {
    if (!stateValues) return 1;
    return Math.max(...Object.values(stateValues).filter(v => v > 0));
  }, [stateValues]);

  const getStateColor = (stateName: string) => {
    const abbr = STATE_NAME_TO_ABBR[stateName];
    
    if (selectedState === stateName) {
      return 'hsl(350 65% 35%)';
    }
    
    if (highlightedStates.includes(stateName)) {
      return 'hsl(35 80% 55%)';
    }
    
    if (stateValues && stateValues[stateName]) {
      const value = stateValues[stateName];
      const intensity = Math.min(value / maxValue, 1);
      const lightness = 85 - (intensity * 50);
      return `hsl(350 ${30 + intensity * 35}% ${lightness}%)`;
    }
    
    return 'hsl(350 20% 85%)';
  };

  const handleStateClick = (stateName: string) => {
    if (onStateClick) {
      onStateClick(stateName);
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
      <svg
        viewBox="0 0 600 900"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <filter id="state-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>
        
        {Object.entries(STATES_INFO).map(([stateName, info]) => {
          const path = STATE_PATHS[info.abbr];
          if (!path) return null;
          
          const isSelected = selectedState === stateName;
          
          return (
            <g key={stateName}>
              <path
                d={path}
                fill={getStateColor(stateName)}
                stroke={isSelected ? 'hsl(350 65% 25%)' : 'hsl(0 0% 98%)'}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-300 cursor-pointer hover:brightness-90"
                onClick={() => handleStateClick(stateName)}
                style={{ 
                  filter: isSelected ? 'url(#state-shadow)' : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center',
                }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Legenda */}
      {stateValues && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-sm">
          <div className="text-xs font-medium text-foreground mb-2">Intensidade</div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm" style={{ background: 'hsl(350 20% 85%)' }} />
            <span className="text-xs text-muted-foreground">Baixo</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-4 h-3 rounded-sm" style={{ background: 'hsl(350 65% 35%)' }} />
            <span className="text-xs text-muted-foreground">Alto</span>
          </div>
        </div>
      )}
    </div>
  );
}
