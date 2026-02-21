import { useState, useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { useCorrelation, getVariableLabel } from '@/hooks/useCorrelation';
import { ScatterPlot } from '@/components/ScatterPlot';
import { VariableSelector } from '@/components/VariableSelector';
import { StateSelector } from '@/components/StateSelector';
import { RegionSelector } from '@/components/RegionSelector';
import { VARIABLES, STATES_INFO, REGION_COLORS, CORRELATION_PAIRS, type EmendasData, type CorrelDadosRow } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { AlertCircle, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function getHeatColor(r: number): string {
  if (r >= 0) {
    const intensity = Math.min(r, 1);
    return `rgb(${Math.round(255 - intensity * 155)},${Math.round(255 - intensity * 225)},${Math.round(255 - intensity * 215)})`;
  } else {
    const intensity = Math.min(Math.abs(r), 1);
    return `rgb(${Math.round(255 - intensity * 215)},${Math.round(255 - intensity * 195)},${Math.round(255 - intensity * 105)})`;
  }
}

export default function AnaliseComparativa() {
  const { data, loading, getYears, correlDados, baseTrabalhada } = useEmendasData();
  const [variableX, setVariableX] = useState<string>('VL_Emendas_Parlamentares');
  const [variableY, setVariableY] = useState<string>('IDH_Educação');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [compareYear, setCompareYear] = useState<number | null>(null);
  const [selectedCorrelPair, setSelectedCorrelPair] = useState<string>(CORRELATION_PAIRS[0].key);

  const years = getYears();
  const latestYear = years[years.length - 1];

  const filteredData = useMemo(() => {
    let d = data;
    if (selectedRegion && selectedRegion !== 'all') {
      d = d.filter(row => row.Região === selectedRegion);
    }
    return d;
  }, [data, selectedRegion]);

  const correlationResult = useCorrelation({
    data: filteredData,
    variableX: variableX as keyof EmendasData,
    variableY: variableY as keyof EmendasData,
    filterState: selectedState || undefined,
  });

  const comparisonData = useMemo(() => {
    const year = compareYear || latestYear;
    let yearData = data.filter(d => d.Ano === year);
    if (selectedRegion && selectedRegion !== 'all') {
      yearData = yearData.filter(d => d.Região === selectedRegion);
    }
    return yearData
      .map(d => ({
        estado: STATES_INFO[d.Estado]?.abbr || d.Estado,
        fullName: d.Estado,
        regiao: d.Região,
        x: Number(d[variableX as keyof EmendasData]) || 0,
      }))
      .sort((a, b) => b.x - a.x);
  }, [data, variableX, compareYear, latestYear, selectedRegion]);

  const correlDadosFiltered = useMemo(() => {
    if (selectedRegion && selectedRegion !== 'all') {
      return correlDados.filter(c => c.Região === selectedRegion);
    }
    return correlDados;
  }, [correlDados, selectedRegion]);

  const correlTimeSeries = useMemo(() => {
    if (!selectedState) return [];
    return baseTrabalhada
      .filter(d => d.Estado === selectedState)
      .sort((a, b) => a.Ano - b.Ano)
      .map(d => ({
        year: d.Ano,
        value: d[selectedCorrelPair as keyof typeof d] as number || 0,
      }));
  }, [baseTrabalhada, selectedState, selectedCorrelPair]);

  const xLabel = getVariableLabel(variableX as keyof EmendasData);
  const yLabel = getVariableLabel(variableY as keyof EmendasData);
  const varInfoX = VARIABLES.find(v => v.key === variableX);
  const selectedCorrelLabel = CORRELATION_PAIRS.find(p => p.key === selectedCorrelPair)?.label || '';

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
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Selecione as Variáveis para Comparação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <VariableSelector value={variableX} onValueChange={setVariableX} label="Variável X" placeholder="Selecione X" />
            <VariableSelector value={variableY} onValueChange={setVariableY} label="Variável Y" placeholder="Selecione Y" excludeKeys={[variableX]} />
            <StateSelector value={selectedState} onValueChange={setSelectedState} label="Estado (opcional)" placeholder="Todos os estados" />
            <RegionSelector value={selectedRegion} onValueChange={setSelectedRegion} label="Região" />
          </div>
        </CardContent>
      </Card>

      {/* Scatter */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Análise de Correlação — {xLabel} × {yLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              {selectedState
                ? `Correlação para ${selectedState} ao longo dos anos.`
                : selectedRegion && selectedRegion !== 'all'
                  ? `Correlação para a região ${selectedRegion} (todos estados e anos).`
                  : `Correlação para todos os estados e anos.`}
            </p>
          </div>

          {variableX === variableY ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <p className="text-sm font-medium text-destructive">Selecione variáveis diferentes.</p>
            </div>
          ) : correlationResult ? (
            <>
              <ScatterPlot result={correlationResult} variableX={variableX as keyof EmendasData} variableY={variableY as keyof EmendasData} />
              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2 text-sm">Interpretação</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {correlationResult.direction === 'positiva' && correlationResult.strength !== 'muito fraca' && (
                    <>Correlação <strong className="text-foreground">{correlationResult.strength} positiva</strong>: quando {xLabel.toLowerCase()} aumenta, {yLabel.toLowerCase()} tende a aumentar.</>
                  )}
                  {correlationResult.direction === 'negativa' && correlationResult.strength !== 'muito fraca' && (
                    <>Correlação <strong className="text-foreground">{correlationResult.strength} negativa</strong>: quando {xLabel.toLowerCase()} aumenta, {yLabel.toLowerCase()} tende a diminuir.</>
                  )}
                  {(correlationResult.direction === 'nula' || correlationResult.strength === 'muito fraca') && (
                    <>Correlação <strong className="text-foreground">muito fraca ou inexistente</strong> entre as variáveis.</>
                  )}
                  {' '}R² = <strong className="text-foreground">{(correlationResult.rSquared * 100).toFixed(1)}%</strong>.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center p-6">
                <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-base font-medium text-foreground mb-1">Dados insuficientes</h4>
                <p className="text-sm text-muted-foreground">Não há dados suficientes para os filtros selecionados.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correlations table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Quadro de Correlações por Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-foreground sticky left-0 bg-card z-10">Estado</th>
                  <th className="text-left p-2 font-medium text-foreground">Região</th>
                  {CORRELATION_PAIRS.map(p => (
                    <th key={p.key} className="text-center p-2 font-medium text-foreground whitespace-nowrap">{p.label}</th>
                  ))}
                  <th className="text-right p-2 font-medium text-foreground whitespace-nowrap">Média Emenda</th>
                  <th className="text-right p-2 font-medium text-foreground whitespace-nowrap">Média Empr. Criat.</th>
                  <th className="text-right p-2 font-medium text-foreground whitespace-nowrap">Média Empr. Bruto</th>
                </tr>
              </thead>
              <tbody>
                {correlDadosFiltered.map(row => (
                  <tr key={row.Estado} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-2 font-medium text-foreground sticky left-0 bg-card z-10 whitespace-nowrap">
                      {STATES_INFO[row.Estado]?.abbr || row.Estado}
                    </td>
                    <td className="p-2 text-muted-foreground">{row.Região}</td>
                    {CORRELATION_PAIRS.map(p => {
                      const val = row[p.key as keyof CorrelDadosRow] as number;
                      return (
                        <td key={p.key} className="text-center p-2">
                          <span className="inline-block px-1.5 py-0.5 rounded font-mono text-[10px] font-bold"
                            style={{
                              backgroundColor: getHeatColor(val),
                              color: Math.abs(val) > 0.5 ? 'white' : 'inherit',
                            }}>
                            {val.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-right p-2 text-muted-foreground font-mono">R$ {(row.Media_Emenda_Periodo / 1e6).toFixed(1)}M</td>
                    <td className="text-right p-2 text-muted-foreground font-mono">{row.Media_Empregos_Criativos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                    <td className="text-right p-2 text-muted-foreground font-mono">{row.Media_Empregos_Bruto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Correlation time series */}
      {selectedState && (
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base font-semibold">
                Evolução da Correlação — {selectedState}
              </CardTitle>
              <div className="w-64">
                <Select value={selectedCorrelPair} onValueChange={setSelectedCorrelPair}>
                  <SelectTrigger className="bg-card border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CORRELATION_PAIRS.map(p => (
                      <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={correlTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                  <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                    label={{ value: 'Correlação (r)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: 'hsl(220, 10%, 46%)' } }} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-sm text-primary">{selectedCorrelLabel}: {(payload[0].value as number)?.toFixed(4)}</p>
                    </div>
                  ) : null} />
                  <Bar dataKey="value" name={selectedCorrelLabel} radius={[4, 4, 0, 0]}>
                    {correlTimeSeries.map((d, i) => (
                      <Cell key={i} fill={d.value >= 0 ? 'hsl(160, 45%, 40%)' : 'hsl(0, 60%, 45%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparative bar chart */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Comparativo por Estado — {xLabel}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {years.map(y => (
                <button key={y} onClick={() => setCompareYear(y)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    (compareYear || latestYear) === y ? 'bg-primary text-primary-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >{y}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }}
                  tickFormatter={v => {
                    if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
                    return v.toFixed(2);
                  }}
                  label={{ value: varInfoX?.unit || xLabel, position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: 'hsl(220, 10%, 46%)' } }}
                />
                <YAxis type="category" dataKey="estado" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} width={40}
                  label={{ value: 'Estado', angle: -90, position: 'insideLeft', offset: -30, style: { fontSize: 11, fill: 'hsl(220, 10%, 46%)' } }} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-foreground">{payload[0].payload.fullName}</p>
                    <p className="text-sm text-primary">{xLabel}: {varInfoX?.format(payload[0].value as number)}</p>
                    <p className="text-xs text-muted-foreground">Região: {payload[0].payload.regiao}</p>
                  </div>
                ) : null} />
                <Bar dataKey="x" name={xLabel} radius={[0, 4, 4, 0]}>
                  {comparisonData.map((d, i) => (
                    <Cell key={i} fill={REGION_COLORS[d.regiao] || 'hsl(220, 60%, 30%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
