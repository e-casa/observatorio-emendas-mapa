import { useMemo } from 'react';
import type { EmendasData } from '@/types/emendas';
import { VARIABLES } from '@/types/emendas';

interface CorrelationHeatmapProps {
  data: EmendasData[];
  variableKeys?: string[];
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function getHeatColor(r: number): string {
  // -1 = blue, 0 = white, +1 = burgundy
  if (r >= 0) {
    const intensity = Math.min(r, 1);
    const red = Math.round(255 - intensity * 155);
    const green = Math.round(255 - intensity * 225);
    const blue = Math.round(255 - intensity * 215);
    return `rgb(${red},${green},${blue})`;
  } else {
    const intensity = Math.min(Math.abs(r), 1);
    const red = Math.round(255 - intensity * 215);
    const green = Math.round(255 - intensity * 195);
    const blue = Math.round(255 - intensity * 105);
    return `rgb(${red},${green},${blue})`;
  }
}

export function CorrelationHeatmap({ data, variableKeys }: CorrelationHeatmapProps) {
  const vars = useMemo(() => {
    const keys = variableKeys || VARIABLES.map(v => v.key);
    return VARIABLES.filter(v => keys.includes(v.key));
  }, [variableKeys]);

  const matrix = useMemo(() => {
    return vars.map(vRow => 
      vars.map(vCol => {
        if (vRow.key === vCol.key) return 1;
        const validData = data.filter(d => {
          const x = Number(d[vRow.key as keyof EmendasData]);
          const y = Number(d[vCol.key as keyof EmendasData]);
          return !isNaN(x) && !isNaN(y) && x !== 0 && y !== 0;
        });
        const xVals = validData.map(d => Number(d[vRow.key as keyof EmendasData]));
        const yVals = validData.map(d => Number(d[vCol.key as keyof EmendasData]));
        return pearsonCorrelation(xVals, yVals);
      })
    );
  }, [data, vars]);

  const shortLabels = vars.map(v => {
    const label = v.label;
    if (label.length > 15) return label.substring(0, 13) + '…';
    return label;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header row */}
        <div className="flex">
          <div className="w-32 shrink-0" />
          {shortLabels.map((label, i) => (
            <div key={i} className="flex-1 min-w-[60px] px-1">
              <div className="text-[9px] text-muted-foreground font-medium truncate -rotate-45 origin-left translate-y-8 translate-x-2 whitespace-nowrap">
                {label}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12">
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center">
              <div className="w-32 shrink-0 text-[10px] text-foreground font-medium truncate pr-2 text-right">
                {shortLabels[i]}
              </div>
              {row.map((value, j) => (
                <div
                  key={j}
                  className="flex-1 min-w-[60px] aspect-square flex items-center justify-center border border-background/50 relative group cursor-default"
                  style={{ backgroundColor: getHeatColor(value) }}
                >
                  <span className={`text-[10px] font-mono font-bold ${
                    Math.abs(value) > 0.5 ? 'text-white' : 'text-foreground'
                  }`}>
                    {value.toFixed(2)}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    <div className="text-[10px] font-medium text-foreground">{vars[i].label}</div>
                    <div className="text-[10px] text-muted-foreground">× {vars[j].label}</div>
                    <div className="text-xs font-bold text-primary mt-1">r = {value.toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Color legend */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="text-[10px] text-muted-foreground">−1.0 (inversa)</span>
          <div className="w-48 h-3 rounded" style={{
            background: 'linear-gradient(to right, rgb(40,60,150), rgb(255,255,255), rgb(100,30,40))'
          }} />
          <span className="text-[10px] text-muted-foreground">+1.0 (direta)</span>
        </div>
      </div>
    </div>
  );
}
