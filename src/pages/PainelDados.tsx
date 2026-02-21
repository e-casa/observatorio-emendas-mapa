import { useState, useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { LeafletMap } from '@/components/LeafletMap';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { StatCard } from '@/components/StatCard';
import { VariableSelector } from '@/components/VariableSelector';
import { VARIABLES, REGION_COLORS, STATES_INFO, type EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, Users, Palette, GraduationCap, Building2,
  BarChart3, PieChart as PieChartIcon, MapPin, Sparkles, Briefcase,
} from 'lucide-react';

export default function PainelDados() {
  const { data, loading, getYears, getTimeSeriesForState, correlDados } = useEmendasData();
  const [selectedVariable, setSelectedVariable] = useState<string>('VL_Emendas_Parlamentares');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = getYears();
  const latestYear = years[years.length - 1];
  const currentYear = selectedYear || latestYear;
  const variableInfo = VARIABLES.find(v => v.key === selectedVariable);

  // Stats
  const stats = useMemo(() => {
    if (!data.length) return null;
    const latestData = data.filter(d => d.Ano === latestYear);
    const prevData = data.filter(d => d.Ano === latestYear - 1);
    const totalEmendas = data.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const latestEmendas = latestData.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const prevEmendas = prevData.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const growth = prevEmendas > 0 ? ((latestEmendas - prevEmendas) / prevEmendas * 100).toFixed(1) : '—';
    const totalGastos = latestData.reduce((acc, d) => acc + d.Gastos_Cultura, 0);
    // Find latest year with valid IDH data (2024 has no IDH)
    const findLatestYearWithData = (field: keyof EmendasData) => {
      for (let i = years.length - 1; i >= 0; i--) {
        const yd = data.filter(d => d.Ano === years[i] && Number(d[field]) > 0);
        if (yd.length > 0) return { year: years[i], data: yd };
      }
      return { year: latestYear, data: [] as typeof data };
    };
    const idhResult = findLatestYearWithData('IDH_Educação');
    const avgIDH = idhResult.data.length ? idhResult.data.reduce((acc, d) => acc + d.IDH_Educação, 0) / idhResult.data.length : 0;
    const idhYear = idhResult.year;
    const desempResult = findLatestYearWithData('Taxa_de_Desemprego');
    const avgDesemp = desempResult.data.length ? desempResult.data.reduce((acc, d) => acc + d.Taxa_de_Desemprego, 0) / desempResult.data.length : 0;
    const desempYear = desempResult.year;
    const qlResult = findLatestYearWithData('Quociente_Locacional_Cultura');
    const avgQL = qlResult.data.length ? qlResult.data.reduce((acc, d) => acc + d.Quociente_Locacional_Cultura, 0) / qlResult.data.length : 0;
    const qlYear = qlResult.year;

    // Empregos from correlDados (averages)
    const totalEmprCriat = correlDados.reduce((acc, d) => acc + d.Media_Empregos_Criativos, 0);
    const totalEmprBruto = correlDados.reduce((acc, d) => acc + d.Media_Empregos_Bruto, 0);

    const porRegiao = latestData.reduce((acc, d) => {
      if (!acc[d.Região]) acc[d.Região] = 0;
      acc[d.Região] += d.VL_Emendas_Parlamentares;
      return acc;
    }, {} as Record<string, number>);

    const evolucao = years.map(y => {
      const yd = data.filter(d => d.Ano === y);
      return { year: y, emendas: yd.reduce((a, d) => a + d.VL_Emendas_Parlamentares, 0) / 1e6 };
    });

    return { totalEmendas, latestEmendas, growth, totalGastos, avgIDH, avgDesemp, avgQL, porRegiao, evolucao, latestYear, totalEmprCriat, totalEmprBruto, idhYear, desempYear, qlYear };
  }, [data, years, latestYear, correlDados]);

  // Map values
  const stateValues = useMemo(() => {
    if (!data.length) return {};
    return data.filter(d => d.Ano === currentYear).reduce((acc, d) => {
      acc[d.Estado] = Number(d[selectedVariable as keyof EmendasData]) || 0;
      return acc;
    }, {} as Record<string, number>);
  }, [data, selectedVariable, currentYear]);

  // Time series for selected state
  const timeSeries = useMemo(() => {
    if (!selectedState) return [];
    return getTimeSeriesForState(selectedState, selectedVariable as keyof EmendasData);
  }, [selectedState, selectedVariable, getTimeSeriesForState]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-primary">Carregando dados...</div>
      </div>
    );
  }

  const pieData = Object.entries(stats.porRegiao).map(([region, value]) => ({
    name: region,
    value: value / 1e6,
    color: REGION_COLORS[region] || 'hsl(220, 30%, 50%)',
  }));

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard title="Total de Emendas" value={`R$ ${(stats.totalEmendas / 1e9).toFixed(2)}B`} subtitle="Período completo" icon={TrendingUp} />
        <StatCard title={`Emendas ${stats.latestYear}`} value={`R$ ${(stats.latestEmendas / 1e6).toFixed(1)}M`} trendValue={`${stats.growth}%`} trend={Number(stats.growth) > 0 ? 'up' : 'down'} icon={Building2} />
        <StatCard title="Gastos com Cultura" value={`R$ ${(stats.totalGastos / 1e6).toFixed(1)}M`} subtitle={`${stats.latestYear}`} icon={Palette} />
        <StatCard title="IDH Educação Médio" value={stats.avgIDH.toFixed(3)} subtitle={`${stats.idhYear}`} icon={GraduationCap} />
        <StatCard title="Taxa de Desemprego" value={`${stats.avgDesemp.toFixed(1)}%`} subtitle={`Média ${stats.desempYear}`} icon={Users} />
        <StatCard title="QL Cultura Médio" value={stats.avgQL?.toFixed(4) || '—'} subtitle={`${stats.qlYear}`} icon={BarChart3} />
        <StatCard title="Empregos Criativos" value={stats.totalEmprCriat.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} subtitle="Média do período" icon={Briefcase} />
        <StatCard title="Empregos Total" value={stats.totalEmprBruto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} subtitle="Média do período" icon={Briefcase} />
      </div>

      {/* Map section */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Mapa de Variáveis por Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <VariableSelector value={selectedVariable} onValueChange={setSelectedVariable} label="Variável" />
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

              {selectedState && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary font-mono">{STATES_INFO[selectedState]?.abbr}</span>
                    <span className="font-serif font-bold text-foreground">{selectedState}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Região {STATES_INFO[selectedState]?.region}
                  </div>
                  {stateValues[selectedState] !== undefined && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">{variableInfo?.label} ({currentYear})</div>
                      <div className="text-xl font-bold text-primary">{variableInfo?.format(stateValues[selectedState])}</div>
                    </div>
                  )}
                  {/* Show correl_dados info for the selected state */}
                  {(() => {
                    const corr = correlDados.find(c => c.Estado === selectedState);
                    if (!corr) return null;
                    return (
                      <div className="space-y-1 mt-2">
                        <div className="text-xs font-medium text-foreground">Médias do Período:</div>
                        <div className="text-xs text-muted-foreground">Emendas: R$ {(corr.Media_Emenda_Periodo / 1e6).toFixed(2)}M</div>
                        <div className="text-xs text-muted-foreground">Empregos Criativos: {corr.Media_Empregos_Criativos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-muted-foreground">Empregos Bruto: {corr.Media_Empregos_Bruto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                      </div>
                    );
                  })()}
                  <button onClick={() => setSelectedState('')} className="text-xs text-muted-foreground hover:text-foreground underline">
                    Limpar seleção
                  </button>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <LeafletMap
                stateValues={stateValues}
                selectedState={selectedState}
                onStateClick={setSelectedState}
                variableLabel={variableInfo?.label}
                formatValue={variableInfo?.format}
              />
            </div>
          </div>

          {selectedState && timeSeries.length > 0 && (
            <div className="mt-6 bg-card border border-border/50 rounded-xl p-5">
              <h4 className="text-sm font-medium text-foreground mb-4">
                Evolução de {variableInfo?.label} — {selectedState}
              </h4>
              <TimeSeriesChart data={timeSeries} variableKey={selectedVariable} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
           <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Evolução Anual das Emendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.evolucao}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                    label={{ value: 'Ano', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: 'hsl(220, 10%, 46%)' } }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} tickFormatter={v => `${v.toFixed(0)}M`}
                    label={{ value: 'R$ Milhões', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: 'hsl(220, 10%, 46%)' } }} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground">Ano: {label}</p>
                      <p className="text-sm text-primary">R$ {payload[0].value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M</p>
                    </div>
                  ) : null} />
                  <Bar dataKey="emendas" name="Emendas Parlamentares" fill="hsl(220, 60%, 30%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
           <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              Distribuição por Região ({stats.latestYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="45%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                    label={({ name, value }) => `${name}: R$${value.toFixed(0)}M`}
                    labelLine={{ stroke: 'hsl(220, 10%, 65%)' }}
                  >
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
                      <p className="text-sm text-primary">R$ {payload[0].payload.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M</p>
                    </div>
                  ) : null} />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" wrapperStyle={{ fontSize: 12 }}
                    formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Insights Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Concentração Regional</h4>
              <p className="text-sm text-muted-foreground">A distribuição das emendas mostra padrões de concentração que impactam o desenvolvimento equilibrado do país.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Empregos Criativos</h4>
              <p className="text-sm text-muted-foreground">Os vínculos de empregos criativos apresentam grande variação entre estados, com concentração no Sudeste e Sul.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Indicadores de Desenvolvimento</h4>
              <p className="text-sm text-muted-foreground">O IDH e a taxa de desemprego apresentam padrões regionais que podem ser correlacionados às emendas.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
