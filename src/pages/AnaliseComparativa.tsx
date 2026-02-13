import { useState, useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { useCorrelation, getVariableLabel } from '@/hooks/useCorrelation';
import { ScatterPlot } from '@/components/ScatterPlot';
import { VariableSelector } from '@/components/VariableSelector';
import { StateSelector } from '@/components/StateSelector';
import { RegionSelector } from '@/components/RegionSelector';
import { VARIABLES, STATES_INFO, REGION_COLORS, type EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { GitCompare, AlertCircle, Lightbulb, BarChart3, ArrowRightLeft } from 'lucide-react';

export default function AnaliseComparativa() {
  const { data, loading, getYears } = useEmendasData();
  const [variableX, setVariableX] = useState<string>('VL_Emendas_Parlamentares');
  const [variableY, setVariableY] = useState<string>('IDH_Educação');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [compareYear, setCompareYear] = useState<number | null>(null);

  const years = getYears();
  const latestYear = years[years.length - 1];

  // Filter data by region
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

  // Comparative bar chart: variable X and Y for each state in a given year
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
        y: Number(d[variableY as keyof EmendasData]) || 0,
      }))
      .sort((a, b) => b.x - a.x);
  }, [data, variableX, variableY, compareYear, latestYear, selectedRegion]);

  const xLabel = getVariableLabel(variableX as keyof EmendasData);
  const yLabel = getVariableLabel(variableY as keyof EmendasData);
  const varInfoX = VARIABLES.find(v => v.key === variableX);
  const varInfoY = VARIABLES.find(v => v.key === variableY);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-primary">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-serif">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Selecione as Variáveis para Comparação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <VariableSelector value={variableX} onValueChange={setVariableX} label="Variável X" placeholder="Selecione X" />
            <VariableSelector value={variableY} onValueChange={setVariableY} label="Variável Y" placeholder="Selecione Y" excludeKeys={[variableX]} />
            <StateSelector value={selectedState} onValueChange={setSelectedState} label="Estado (opcional)" placeholder="Todos os estados" />
            <RegionSelector value={selectedRegion} onValueChange={setSelectedRegion} label="Região" />
          </div>
        </CardContent>
      </Card>

      {/* Correlation */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-serif">
            <GitCompare className="w-5 h-5 text-primary" />
            Análise de Correlação — {xLabel} × {yLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* About */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {selectedState
                  ? `Correlação para ${selectedState} ao longo dos anos.`
                  : selectedRegion && selectedRegion !== 'all'
                    ? `Correlação para a região ${selectedRegion} (todos estados e anos).`
                    : `Correlação para todos os estados e anos.`}
              </p>
            </div>
          </div>

          {variableX === variableY ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <p className="text-sm font-medium text-destructive">Selecione variáveis diferentes.</p>
            </div>
          ) : correlationResult ? (
            <>
              <ScatterPlot result={correlationResult} variableX={variableX as keyof EmendasData} variableY={variableY as keyof EmendasData} />
              
              {/* Interpretation */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Interpretação
                </h4>
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
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Dados insuficientes</h4>
                <p className="text-sm text-muted-foreground">Não há dados suficientes para os filtros selecionados.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparative bar chart */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl font-serif">
              <BarChart3 className="w-5 h-5 text-primary" />
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
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(350, 20%, 88%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(350, 15%, 45%)' }}
                  tickFormatter={v => {
                    if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
                    return v.toFixed(2);
                  }}
                  label={{ value: varInfoX?.unit || xLabel, position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: 'hsl(350, 15%, 45%)' } }}
                />
                <YAxis type="category" dataKey="estado" tick={{ fontSize: 10, fill: 'hsl(350, 15%, 45%)' }} width={40}
                  label={{ value: 'Estado', angle: -90, position: 'insideLeft', offset: -30, style: { fontSize: 11, fill: 'hsl(350, 15%, 45%)' } }} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-foreground">{payload[0].payload.fullName}</p>
                    <p className="text-sm text-primary">{xLabel}: {varInfoX?.format(payload[0].value as number)}</p>
                    <p className="text-xs text-muted-foreground">Região: {payload[0].payload.regiao}</p>
                  </div>
                ) : null} />
                <Bar dataKey="x" name={xLabel} radius={[0, 4, 4, 0]}>
                  {comparisonData.map((d, i) => (
                    <Cell key={i} fill={REGION_COLORS[d.regiao] || 'hsl(350, 65%, 35%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Region color legend */}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {Object.entries(REGION_COLORS).map(([region, color]) => (
              <div key={region} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{region}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
