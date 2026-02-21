import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { VARIABLES } from '@/types/emendas';

interface TimeSeriesChartProps {
  data: Array<{ year: number; value: number }>;
  variableKey: string;
  title?: string;
  color?: string;
}

export function TimeSeriesChart({ 
  data, 
  variableKey, 
  title,
  color = 'hsl(220, 60%, 30%)'
}: TimeSeriesChartProps) {
  const variable = VARIABLES.find(v => v.key === variableKey);
  
  const formatValue = (value: number) => {
    if (!variable) return value.toString();
    return variable.format(value);
  };

  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      formattedValue: formatValue(d.value),
    }));
  }, [data, variable]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-medium text-foreground mb-4">{title}</h4>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }}
              axisLine={{ stroke: 'hsl(220, 13%, 88%)' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
              axisLine={{ stroke: 'hsl(220, 13%, 88%)' }}
              tickFormatter={(value) => {
                if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}B`;
                if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toFixed(2);
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground">Ano: {label}</p>
                      <p className="text-sm text-primary font-semibold">
                        {formatValue(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
