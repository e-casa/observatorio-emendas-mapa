import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import { CorrelationResult, getVariableLabel } from '@/hooks/useCorrelation';
import type { EmendasData } from '@/types/emendas';

interface ScatterPlotProps {
  result: CorrelationResult;
  variableX: keyof EmendasData;
  variableY: keyof EmendasData;
}

export function ScatterPlot({ result, variableX, variableY }: ScatterPlotProps) {
  const { points, slope, intercept, correlation, rSquared, equation, strength, direction } = result;

  const xLabel = getVariableLabel(variableX);
  const yLabel = getVariableLabel(variableY);

  // Calcular linha de tendência
  const trendLinePoints = useMemo(() => {
    if (!points.length) return [];
    const xValues = points.map(p => p.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ];
  }, [points, slope, intercept]);

  const formatAxis = (value: number) => {
    if (Math.abs(value) >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(2);
  };

  return (
    <div className="w-full space-y-4">
      {/* Métricas de correlação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Correlação (r)</div>
          <div className="text-lg font-bold text-foreground font-serif">
            {correlation.toFixed(4)}
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">R²</div>
          <div className="text-lg font-bold text-foreground font-serif">
            {(rSquared * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Força</div>
          <div className="text-lg font-bold text-foreground font-serif capitalize">
            {strength}
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Direção</div>
          <div className="text-lg font-bold text-foreground font-serif capitalize">
            {direction}
          </div>
        </div>
      </div>

      {/* Equação */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="text-xs text-muted-foreground mb-1">Equação de Regressão</div>
        <div className="text-lg font-mono font-semibold text-primary">
          {equation}
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(350, 20%, 88%)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xLabel}
              tick={{ fontSize: 10, fill: 'hsl(350, 15%, 45%)' }}
              tickFormatter={formatAxis}
              label={{ 
                value: xLabel, 
                position: 'bottom',
                offset: 40,
                style: { fontSize: 11, fill: 'hsl(350, 15%, 45%)' }
              }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yLabel}
              tick={{ fontSize: 10, fill: 'hsl(350, 15%, 45%)' }}
              tickFormatter={formatAxis}
              label={{ 
                value: yLabel, 
                angle: -90, 
                position: 'left',
                offset: 45,
                style: { fontSize: 11, fill: 'hsl(350, 15%, 45%)' }
              }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground mb-2">{data.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {xLabel}: <span className="font-medium text-foreground">{formatAxis(data.x)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {yLabel}: <span className="font-medium text-foreground">{formatAxis(data.y)}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              data={points} 
              fill="hsl(350, 65%, 35%)"
              fillOpacity={0.7}
            />
            {/* Linha de tendência */}
            {trendLinePoints.length === 2 && (
              <ReferenceLine
                segment={[
                  { x: trendLinePoints[0].x, y: trendLinePoints[0].y },
                  { x: trendLinePoints[1].x, y: trendLinePoints[1].y },
                ]}
                stroke="hsl(35, 80%, 50%)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Linha tracejada representa a regressão linear • n = {points.length} observações
      </div>
    </div>
  );
}
