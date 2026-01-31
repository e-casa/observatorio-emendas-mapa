import { useState, useMemo } from 'react';
import { BrazilMap } from './BrazilMap';
import { TimeSeriesChart } from './TimeSeriesChart';
import { VariableSelector } from './VariableSelector';
import { StateSelector } from './StateSelector';
import { useEmendasData } from '@/hooks/useEmendasData';
import { VARIABLES, STATES_INFO, type EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp, Info } from 'lucide-react';

export function MapExplorer() {
  const { data, loading, getStateDataForVariable, getTimeSeriesForState, getYears } = useEmendasData();
  const [selectedVariable, setSelectedVariable] = useState<string>('VL_Emendas_Parlamentares');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = getYears();
  const latestYear = years[years.length - 1];
  const currentYear = selectedYear || latestYear;

  // Dados do mapa
  const stateValues = useMemo(() => {
    if (!data.length) return {};
    const yearData = data.filter(d => d.Ano === currentYear);
    return yearData.reduce((acc, d) => {
      acc[d.Estado] = Number(d[selectedVariable as keyof EmendasData]) || 0;
      return acc;
    }, {} as Record<string, number>);
  }, [data, selectedVariable, currentYear]);

  // Série temporal do estado selecionado
  const timeSeriesData = useMemo(() => {
    if (!selectedState) return [];
    return getTimeSeriesForState(selectedState, selectedVariable as keyof EmendasData);
  }, [selectedState, selectedVariable, getTimeSeriesForState]);

  // Informações da variável selecionada
  const variableInfo = VARIABLES.find(v => v.key === selectedVariable);
  const stateInfo = selectedState ? STATES_INFO[selectedState] : null;

  // Valor do estado selecionado
  const selectedStateValue = selectedState && stateValues[selectedState] 
    ? variableInfo?.format(stateValues[selectedState])
    : null;

  // Ranking dos estados
  const stateRanking = useMemo(() => {
    return Object.entries(stateValues)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stateValues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse-soft text-primary">Carregando dados...</div>
      </div>
    );
  }

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl font-serif">
          <MapPin className="w-5 h-5 text-primary" />
          Explorador de Variáveis por Estado
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna esquerda: Controles e Mapa */}
          <div className="space-y-6">
            {/* Seletor de variável */}
            <VariableSelector
              value={selectedVariable}
              onValueChange={setSelectedVariable}
              label="Variável para visualização"
            />

            {/* Seletor de ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano de referência</label>
              <div className="flex flex-wrap gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      currentYear === year
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-muted/30 rounded-xl p-4">
              <BrazilMap
                selectedState={selectedState}
                onStateClick={setSelectedState}
                stateValues={stateValues}
              />
            </div>

            {/* Top 5 estados */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top 5 Estados ({currentYear})
              </h4>
              <div className="space-y-2">
                {stateRanking.map(([state, value], index) => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedState === state
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{state}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {variableInfo?.format(value)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna direita: Detalhes e Gráfico */}
          <div className="space-y-6">
            {/* Info da variável */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">{variableInfo?.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{variableInfo?.description}</p>
                </div>
              </div>
            </div>

            {/* Estado selecionado */}
            {selectedState ? (
              <div className="space-y-6">
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary font-mono">
                        {stateInfo?.abbr}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-foreground">{selectedState}</h3>
                      <p className="text-sm text-muted-foreground">Região {stateInfo?.region}</p>
                    </div>
                  </div>
                  
                  {selectedStateValue && (
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {variableInfo?.label} ({currentYear})
                      </div>
                      <div className="text-2xl font-bold text-primary font-serif">
                        {selectedStateValue}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gráfico de evolução */}
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-medium text-foreground mb-4">
                    Evolução Temporal - {variableInfo?.label}
                  </h4>
                  <TimeSeriesChart
                    data={timeSeriesData}
                    variableKey={selectedVariable}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                <div className="text-center p-6">
                  <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">Selecione um estado</h4>
                  <p className="text-sm text-muted-foreground">
                    Clique no mapa ou na lista para ver a evolução temporal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
