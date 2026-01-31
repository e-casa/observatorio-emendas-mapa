import { useState } from 'react';
import { ScatterPlot } from './ScatterPlot';
import { VariableSelector } from './VariableSelector';
import { StateSelector } from './StateSelector';
import { useEmendasData } from '@/hooks/useEmendasData';
import { useCorrelation, getVariableLabel } from '@/hooks/useCorrelation';
import type { EmendasData } from '@/types/emendas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCompare, AlertCircle, Lightbulb } from 'lucide-react';

export function CorrelationPanel() {
  const { data, loading } = useEmendasData();
  const [variableX, setVariableX] = useState<string>('VL_Emendas_Parlamentares');
  const [variableY, setVariableY] = useState<string>('IDH_Educação');
  const [selectedState, setSelectedState] = useState<string>('');

  const correlationResult = useCorrelation({
    data,
    variableX: variableX as keyof EmendasData,
    variableY: variableY as keyof EmendasData,
    filterState: selectedState || undefined,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse-soft text-primary">Carregando dados...</div>
      </div>
    );
  }

  const xLabel = getVariableLabel(variableX as keyof EmendasData);
  const yLabel = getVariableLabel(variableY as keyof EmendasData);

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-xl font-serif">
          <GitCompare className="w-5 h-5 text-primary" />
          Análise de Correlação
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Controles */}
          <div className="grid md:grid-cols-3 gap-4">
            <StateSelector
              value={selectedState}
              onValueChange={setSelectedState}
              label="Filtrar por estado (opcional)"
              placeholder="Todos os estados"
            />
            
            <VariableSelector
              value={variableX}
              onValueChange={setVariableX}
              label="Variável X (independente)"
              placeholder="Selecione X"
            />
            
            <VariableSelector
              value={variableY}
              onValueChange={setVariableY}
              label="Variável Y (dependente)"
              placeholder="Selecione Y"
              excludeKeys={[variableX]}
            />
          </div>

          {/* Aviso se mesma variável */}
          {variableX === variableY && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Selecione variáveis diferentes para calcular a correlação.
                </p>
              </div>
            </div>
          )}

          {/* Descrição da análise */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Sobre esta análise</p>
                <p>
                  {selectedState 
                    ? `Analisando a correlação entre ${xLabel} e ${yLabel} para o estado de ${selectedState} ao longo dos anos.`
                    : `Analisando a correlação entre ${xLabel} e ${yLabel} para todos os estados e anos disponíveis.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Resultado da correlação */}
          {correlationResult ? (
            <ScatterPlot
              result={correlationResult}
              variableX={variableX as keyof EmendasData}
              variableY={variableY as keyof EmendasData}
            />
          ) : variableX !== variableY && (
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Dados insuficientes</h4>
                <p className="text-sm text-muted-foreground">
                  Não há dados suficientes para calcular a correlação com os filtros selecionados.
                </p>
              </div>
            </div>
          )}

          {/* Interpretação */}
          {correlationResult && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Interpretação
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {correlationResult.direction === 'positiva' && correlationResult.strength !== 'muito fraca' && (
                  <>
                    Existe uma correlação <strong className="text-foreground">{correlationResult.strength} positiva</strong> entre as variáveis. 
                    Isso significa que, de modo geral, quando {xLabel.toLowerCase()} aumenta, {yLabel.toLowerCase()} também tende a aumentar.
                  </>
                )}
                {correlationResult.direction === 'negativa' && correlationResult.strength !== 'muito fraca' && (
                  <>
                    Existe uma correlação <strong className="text-foreground">{correlationResult.strength} negativa</strong> entre as variáveis.
                    Isso significa que, de modo geral, quando {xLabel.toLowerCase()} aumenta, {yLabel.toLowerCase()} tende a diminuir.
                  </>
                )}
                {(correlationResult.direction === 'nula' || correlationResult.strength === 'muito fraca') && (
                  <>
                    A correlação entre as variáveis é <strong className="text-foreground">muito fraca ou inexistente</strong>.
                    Não há evidência de uma relação linear significativa entre {xLabel.toLowerCase()} e {yLabel.toLowerCase()}.
                  </>
                )}
                {' '}O coeficiente de determinação (R²) indica que aproximadamente <strong className="text-foreground">{(correlationResult.rSquared * 100).toFixed(1)}%</strong> da 
                variação em {yLabel.toLowerCase()} pode ser explicada pela variação em {xLabel.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
