import { useState, useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { LeafletMap } from '@/components/LeafletMap';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { VariableSelector } from '@/components/VariableSelector';
import { VARIABLES, STATES_INFO, REGION_COLORS, type EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Database, MapPin, BarChart3, TrendingUp } from 'lucide-react';

export default function ExploradorVariaveis() {
  const { data, loading, getYears, getTimeSeriesForState } = useEmendasData();
  const [selectedVariable, setSelectedVariable] = useState<string>('VL_Emendas_Parlamentares');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = getYears();
  const latestYear = years[years.length - 1];
  const currentYear = selectedYear || latestYear;
  const variableInfo = VARIABLES.find(v => v.key === selectedVariable);

  // Per-state values for current year
  const stateValues = useMemo(() => {
    if (!data.length) return {};
    return data.filter(d => d.Ano === currentYear).reduce((acc, d) => {
      acc[d.Estado] = Number(d[selectedVariable as keyof EmendasData]) || 0;
      return acc;
    }, {} as Record<string, number>);
  }, [data, selectedVariable, currentYear]);

  // Ranking (all states sorted)
  const ranking = useMemo(() => {
    return Object.entries(stateValues)
      .map(([state, value]) => ({ state, value, abbr: STATES_INFO[state]?.abbr || '', region: STATES_INFO[state]?.region || '' }))
      .sort((a, b) => b.value - a.value);
  }, [stateValues]);

  // Time series for selected state
  const timeSeries = useMemo(() => {
    if (!selectedState) return [];
    return getTimeSeriesForState(selectedState, selectedVariable as keyof EmendasData);
  }, [selectedState, selectedVariable, getTimeSeriesForState]);

  // Bar chart data (top 15 for readability)
  const barData = useMemo(() => {
    return ranking.slice(0, 15).map(r => ({
      name: r.abbr,
      value: r.value,
      region: r.region,
    }));
  }, [ranking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-primary">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <VariableSelector value={selectedVariable} onValueChange={setSelectedVariable} label="Variável para explorar" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano</label>
              <div className="flex flex-wrap gap-1.5">
                {years.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                      currentYear === y ? 'bg-primary text-primary-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >{y}</button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map + Bar chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <MapPin className="w-5 h-5 text-primary" />
              {variableInfo?.label} — Mapa ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <LeafletMap
              stateValues={stateValues}
              selectedState={selectedState}
              onStateClick={setSelectedState}
              variableLabel={variableInfo?.label}
              formatValue={variableInfo?.format}
            />
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top 15 Estados ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(350, 20%, 88%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(350, 15%, 45%)' }}
                    tickFormatter={v => variableInfo?.format(v) || String(v)} />
                  <YAxis type="category" dataKey="name" width={35} tick={{ fontSize: 11, fill: 'hsl(350, 15%, 45%)' }} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
                      <p className="text-sm text-primary">{variableInfo?.format(payload[0].value as number)}</p>
                    </div>
                  ) : null} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={REGION_COLORS[entry.region] || 'hsl(350, 65%, 35%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time series for selected state */}
      {selectedState && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução de {variableInfo?.label} — {selectedState}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <TimeSeriesChart data={timeSeries} variableKey={selectedVariable} />
            <button onClick={() => setSelectedState('')} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
              Limpar seleção
            </button>
          </CardContent>
        </Card>
      )}

      {/* Data table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Database className="w-5 h-5 text-primary" />
            Dados — {variableInfo?.label} ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-foreground">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-foreground">Estado</th>
                  <th className="text-left px-4 py-2.5 font-medium text-foreground">UF</th>
                  <th className="text-left px-4 py-2.5 font-medium text-foreground">Região</th>
                  <th className="text-right px-4 py-2.5 font-medium text-foreground">{variableInfo?.label}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.state}
                    onClick={() => setSelectedState(r.state)}
                    className={`border-t border-border/30 cursor-pointer transition-colors hover:bg-primary/5 ${
                      selectedState === r.state ? 'bg-primary/10' : ''
                    }`}>
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-foreground">{r.state}</td>
                    <td className="px-4 py-2 text-muted-foreground font-mono">{r.abbr}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${REGION_COLORS[r.region]}20`, color: REGION_COLORS[r.region] }}>
                        {r.region}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-foreground">{variableInfo?.format(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!selectedState && (
        <p className="text-center text-sm text-muted-foreground">
          Clique em um estado no mapa ou na tabela para ver a série temporal.
        </p>
      )}
    </div>
  );
}
