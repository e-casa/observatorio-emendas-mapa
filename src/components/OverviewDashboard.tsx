import { useMemo } from 'react';
import { useEmendasData } from '@/hooks/useEmendasData';
import { StatCard } from './StatCard';
import { REGION_COLORS } from '@/types/emendas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Palette, 
  GraduationCap,
  BarChart3,
  PieChartIcon,
  Sparkles
} from 'lucide-react';

export function OverviewDashboard() {
  const { data, loading, getYears, getStates, getRegions } = useEmendasData();

  const stats = useMemo(() => {
    if (!data.length) return null;

    const years = getYears();
    const latestYear = years[years.length - 1];
    const latestData = data.filter(d => d.Ano === latestYear);
    const previousYearData = data.filter(d => d.Ano === latestYear - 1);

    // Total de emendas
    const totalEmendas = data.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const latestEmendas = latestData.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const previousEmendas = previousYearData.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const emendasGrowth = previousEmendas > 0 
      ? ((latestEmendas - previousEmendas) / previousEmendas * 100).toFixed(1)
      : '—';

    // Gastos com cultura
    const totalGastosCultura = latestData.reduce((acc, d) => acc + d.Gastos_Cultura, 0);
    const previousGastos = previousYearData.reduce((acc, d) => acc + d.Gastos_Cultura, 0);
    const gastosGrowth = previousGastos > 0
      ? ((totalGastosCultura - previousGastos) / previousGastos * 100).toFixed(1)
      : '—';

    // IDH médio
    const validIDH = latestData.filter(d => d.IDH_Educação > 0);
    const avgIDHEducacao = validIDH.reduce((acc, d) => acc + d.IDH_Educação, 0) / validIDH.length;

    // Taxa de desemprego média
    const validDesemprego = latestData.filter(d => d.Taxa_de_Desemprego > 0);
    const avgDesemprego = validDesemprego.reduce((acc, d) => acc + d.Taxa_de_Desemprego, 0) / validDesemprego.length;

    // Emendas por região
    const emendasPorRegiao = latestData.reduce((acc, d) => {
      if (!acc[d.Região]) acc[d.Região] = 0;
      acc[d.Região] += d.VL_Emendas_Parlamentares;
      return acc;
    }, {} as Record<string, number>);

    // Evolução anual
    const evolucaoAnual = years.map(year => {
      const yearData = data.filter(d => d.Ano === year);
      return {
        year,
        emendas: yearData.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0) / 1000000,
        gastosCultura: yearData.reduce((acc, d) => acc + d.Gastos_Cultura, 0) / 1000000,
      };
    });

    // Top 5 estados por emendas
    const topEstados = [...latestData]
      .sort((a, b) => b.VL_Emendas_Parlamentares - a.VL_Emendas_Parlamentares)
      .slice(0, 5)
      .map(d => ({
        estado: d.Estado,
        valor: d.VL_Emendas_Parlamentares / 1000000,
      }));

    return {
      totalEmendas,
      latestEmendas,
      emendasGrowth,
      totalGastosCultura,
      gastosGrowth,
      avgIDHEducacao,
      avgDesemprego,
      emendasPorRegiao,
      evolucaoAnual,
      topEstados,
      latestYear,
      totalStates: getStates().length,
      totalYears: years.length,
    };
  }, [data, getYears, getStates]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse-soft text-primary">Carregando análise...</div>
      </div>
    );
  }

  const pieData = Object.entries(stats.emendasPorRegiao).map(([region, value]) => ({
    name: region,
    value: value / 1000000,
    color: REGION_COLORS[region] || 'hsl(220, 30%, 50%)',
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Visão Geral do Observatório
          </h2>
          <p className="text-sm text-muted-foreground">
            Análise consolidada de <strong>{stats.totalStates} estados</strong> brasileiros, 
            abrangendo <strong>{stats.totalYears} anos</strong> de dados sobre emendas parlamentares, 
            indicadores socioeconômicos e investimentos em cultura.
          </p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Emendas"
          value={`R$ ${(stats.totalEmendas / 1000000000).toFixed(2)}B`}
          subtitle="Período completo"
          icon={TrendingUp}
        />
        <StatCard
          title={`Emendas ${stats.latestYear}`}
          value={`R$ ${(stats.latestEmendas / 1000000).toFixed(1)}M`}
          trendValue={`${stats.emendasGrowth}%`}
          trend={Number(stats.emendasGrowth) > 0 ? 'up' : 'down'}
          icon={Building2}
        />
        <StatCard
          title={`Gastos Cultura ${stats.latestYear}`}
          value={`R$ ${(stats.totalGastosCultura / 1000000000).toFixed(2)}B`}
          trendValue={`${stats.gastosGrowth}%`}
          trend={Number(stats.gastosGrowth) > 0 ? 'up' : 'down'}
          icon={Palette}
        />
        <StatCard
          title="IDH Educação Médio"
          value={stats.avgIDHEducacao.toFixed(3)}
          subtitle={`${stats.latestYear}`}
          icon={GraduationCap}
        />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Evolução anual */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Evolução Anual das Emendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.evolucaoAnual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                    tickFormatter={(v) => `${v.toFixed(0)}M`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <p className="text-sm text-primary">
                              R$ {payload[0].value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="emendas" 
                    fill="hsl(220, 60%, 30%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por região */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Distribuição por Região ({stats.latestYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-primary">
                              R$ {data.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top estados */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top 5 Estados por Emendas ({stats.latestYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topEstados} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                  tickFormatter={(v) => `R$ ${v.toFixed(1)}M`}
                />
                <YAxis 
                  type="category" 
                  dataKey="estado" 
                  tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                  width={120}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                          <p className="text-sm font-medium text-foreground">{payload[0].payload.estado}</p>
                          <p className="text-sm text-primary">
                            R$ {payload[0].value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}M
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="valor" 
                  fill="hsl(220, 60%, 30%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-sm text-muted-foreground">
                A distribuição das emendas parlamentares mostra padrões de concentração em determinadas regiões, 
                o que pode impactar o desenvolvimento equilibrado do país.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Investimento em Cultura</h4>
              <p className="text-sm text-muted-foreground">
                Os gastos com cultura variam significativamente entre os estados, 
                refletindo diferentes prioridades e capacidades orçamentárias regionais.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Correlações</h4>
              <p className="text-sm text-muted-foreground">
                Explore o painel de correlação para descobrir relações entre emendas parlamentares, 
                indicadores de desenvolvimento e investimentos culturais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
