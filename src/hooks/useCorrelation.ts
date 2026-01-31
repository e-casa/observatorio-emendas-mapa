import { useMemo } from 'react';
import type { EmendasData } from '@/types/emendas';
import { VARIABLES } from '@/types/emendas';

interface UseCorrelationProps {
  data: EmendasData[];
  variableX: keyof EmendasData;
  variableY: keyof EmendasData;
  filterState?: string;
}

export interface CorrelationResult {
  correlation: number;
  equation: string;
  slope: number;
  intercept: number;
  rSquared: number;
  points: Array<{ x: number; y: number; label: string }>;
  strength: 'muito forte' | 'forte' | 'moderada' | 'fraca' | 'muito fraca';
  direction: 'positiva' | 'negativa' | 'nula';
}

export function useCorrelation({ data, variableX, variableY, filterState }: UseCorrelationProps): CorrelationResult | null {
  return useMemo(() => {
    if (!data.length || !variableX || !variableY || variableX === variableY) {
      return null;
    }

    // Filtrar dados válidos
    let filteredData = data;
    if (filterState) {
      filteredData = data.filter(d => d.Estado === filterState);
    }

    const validData = filteredData.filter(d => {
      const x = Number(d[variableX]);
      const y = Number(d[variableY]);
      return !isNaN(x) && !isNaN(y) && x !== 0 && y !== 0;
    });

    if (validData.length < 3) return null;

    const xValues = validData.map(d => Number(d[variableX]));
    const yValues = validData.map(d => Number(d[variableY]));

    // Médias
    const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;

    // Coeficiente de correlação de Pearson
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < xValues.length; i++) {
      const dx = xValues[i] - meanX;
      const dy = yValues[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const correlation = numerator / Math.sqrt(denomX * denomY);

    // Regressão linear
    const slope = numerator / denomX;
    const intercept = meanY - slope * meanX;

    // R²
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < yValues.length; i++) {
      const predicted = slope * xValues[i] + intercept;
      ssRes += Math.pow(yValues[i] - predicted, 2);
      ssTot += Math.pow(yValues[i] - meanY, 2);
    }
    const rSquared = 1 - (ssRes / ssTot);

    // Pontos para o gráfico
    const points = validData.map((d, i) => ({
      x: xValues[i],
      y: yValues[i],
      label: filterState ? `${d.Ano}` : `${d.Estado} (${d.Ano})`,
    }));

    // Classificar força da correlação
    const absCorr = Math.abs(correlation);
    let strength: CorrelationResult['strength'];
    if (absCorr >= 0.9) strength = 'muito forte';
    else if (absCorr >= 0.7) strength = 'forte';
    else if (absCorr >= 0.5) strength = 'moderada';
    else if (absCorr >= 0.3) strength = 'fraca';
    else strength = 'muito fraca';

    let direction: CorrelationResult['direction'];
    if (correlation > 0.1) direction = 'positiva';
    else if (correlation < -0.1) direction = 'negativa';
    else direction = 'nula';

    // Formatar equação
    const formatCoef = (n: number) => {
      if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(2) + 'M';
      if (Math.abs(n) >= 1000) return (n / 1000).toFixed(2) + 'K';
      return n.toFixed(4);
    };

    const equation = `y = ${formatCoef(slope)}x ${intercept >= 0 ? '+' : ''} ${formatCoef(intercept)}`;

    return {
      correlation,
      equation,
      slope,
      intercept,
      rSquared,
      points,
      strength,
      direction,
    };
  }, [data, variableX, variableY, filterState]);
}

export function getVariableLabel(key: keyof EmendasData): string {
  const variable = VARIABLES.find(v => v.key === key);
  return variable?.label || key;
}
