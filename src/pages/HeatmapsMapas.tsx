import { useState, useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { CorrelationHeatmap } from '@/components/CorrelationHeatmap';
import { LeafletMap } from '@/components/LeafletMap';
import { VariableSelector } from '@/components/VariableSelector';
import { RegionSelector } from '@/components/RegionSelector';
import { VARIABLES, REGION_COLORS, STATES_INFO, type EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { Grid3X3, Map, TrendingUp, Radar as RadarIcon } from 'lucide-react';

export default function HeatmapsMapas() {
  const { data, loading, getYears } = useEmendasData();
  const [mapVariable, setMapVariable] = useState<string>('Emendas_Per_Capita');
  const [mapYear, setMapYear] = useState<number | null>(null);
  const [heatmapRegion, setHeatmapRegion] = useState<string>('all');

  const years = getYears();
  const latestYear = years[years.length - 1];
  const currentYear = mapYear || latestYear;
  const varInfo = VARIABLES.find(v => v.key === mapVariable);

  // Filter data for heatmap
  const heatmapData = useMemo(() => {
    if (heatmapRegion && heatmapRegion !== 'all') {
      return data.filter(d => d.Região === heatmapRegion);
    }
    return data;
  }, [data, heatmapRegion]);

  // Map values
  const stateValues = useMemo(() => {
    if (!data.length) return {};
    return data.filter(d => d.Ano === currentYear).reduce((acc, d) => {
      acc[d.Estado] = Number(d[mapVariable as keyof EmendasData]) || 0;
      return acc;
    }, {} as Record<string, number>);
  }, [data, mapVariable, currentYear]);

  // Radar chart data - regional averages for latest year
  const radarData = useMemo(() => {
    if (!data.length) return [];
    const latestData = data.filter(d => d.Ano === latestYear);
    const regions = [...new Set(latestData.map(d => d.Região))];
    
    // Normalize each variable to 0-100 for radar
    const varsForRadar = ['VL_Emendas_Parlamentares', 'PIB_Estadual', 'IDH_Educação', 'Taxa_de_Desemprego', 'Gastos_Cultura'];
    const maxVals: Record<string, number> = {};
    varsForRadar.forEach(v => {
      maxVals[v] = Math.max(...latestData.map(d => Number(d[v as keyof EmendasData]) || 0));
    });

    const labels: Record<string, string> = {
      'VL_Emendas_Parlamentares': 'Emendas',
      'PIB_Estadual': 'PIB',
      'IDH_Educação': 'IDH Edu.',
      'Taxa_de_Desemprego': 'Desemprego',
      'Gastos_Cultura': 'Gastos Cultura',
    };

    return varsForRadar.map(v => {
      const entry: any = { variable: labels[v] || v };
      regions.forEach(r => {
        const regionData = latestData.filter(d => d.Região === r);
        const avg = regionData.reduce((a, d) => a + (Number(d[v as keyof EmendasData]) || 0), 0) / regionData.length;
        entry[r] = maxVals[v] > 0 ? (avg / maxVals[v]) * 100 : 0;
      });
      return entry;
    });
  }, [data, latestYear]);

  const regions = [...new Set(data.map(d => d.Região))];

  // Ranking by variable
  const ranking = useMemo(() => {
    return Object.entries(stateValues)
      .filter(([_, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([state, value], i) => ({
        pos: i + 1,
        estado: STATES_INFO[state]?.abbr || state,
        fullName: state,
        regiao: STATES_INFO[state]?.region || '',
        valor: value,
      }));
  }, [stateValues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-primary">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Correlation Heatmap */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl font-serif">
              <Grid3X3 className="w-5 h-5 text-primary" />
              Matriz de Correlação
            </CardTitle>
            <div className="w-48">
              <RegionSelector value={heatmapRegion} onValueChange={setHeatmapRegion} label="" placeholder="Todas" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CorrelationHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Maps Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-serif">
            <Map className="w-5 h-5 text-primary" />
            Mapa Temático
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <VariableSelector value={mapVariable} onValueChange={setMapVariable} label="Variável" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ano</label>
                <div className="flex flex-wrap gap-1.5">
                  {years.map(y => (
                    <button key={y} onClick={() => setMapYear(y)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                        currentYear === y ? 'bg-primary text-primary-foreground font-medium' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >{y}</button>
                  ))}
                </div>
              </div>

              {/* Ranking */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Ranking ({currentYear})
                </h4>
                {ranking.slice(0, 10).map(r => (
                  <div key={r.estado} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{r.pos}</span>
                      <span className="font-mono text-xs text-muted-foreground">{r.estado}</span>
                    </span>
                    <span className="text-xs text-foreground font-medium">{varInfo?.format(r.valor)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <LeafletMap
                stateValues={stateValues}
                variableLabel={varInfo?.label}
                formatValue={varInfo?.format}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart - Regional Profile */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-serif">
            <RadarIcon className="w-5 h-5 text-primary" />
            Perfil Regional Comparativo ({latestYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(350, 20%, 85%)" />
                <PolarAngleAxis dataKey="variable" tick={{ fontSize: 11, fill: 'hsl(350, 15%, 45%)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                {regions.map(r => (
                  <Radar key={r} name={r} dataKey={r} stroke={REGION_COLORS[r]} fill={REGION_COLORS[r]} fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                    {payload.map((p: any) => (
                      <p key={p.name} className="text-xs" style={{ color: p.color }}>
                        {p.name}: {p.value?.toFixed(1)}%
                      </p>
                    ))}
                  </div>
                ) : null} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Valores normalizados (0-100%) em relação ao máximo de cada variável
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
