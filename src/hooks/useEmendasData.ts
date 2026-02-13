import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type { EmendasData, CorrelDadosRow, BaseTrabalhada } from '@/types/emendas';

function safeNumber(val: any): number {
  if (val === undefined || val === null || val === '' || String(val).includes('#DIV/0!') || String(val).includes('#')) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export function useEmendasData() {
  const [data, setData] = useState<EmendasData[]>([]);
  const [correlDados, setCorrelDados] = useState<CorrelDadosRow[]>([]);
  const [baseTrabalhada, setBaseTrabalhada] = useState<BaseTrabalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/Base_Consolidada_Mestrado.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Sheet 1: correl_dados (summary correlations per state)
        if (workbook.SheetNames[0]) {
          const ws1 = workbook.Sheets[workbook.SheetNames[0]];
          const raw1 = XLSX.utils.sheet_to_json(ws1) as any[];
          const parsed1: CorrelDadosRow[] = raw1
            .filter(r => r.Estado && String(r.Estado).trim())
            .map(r => ({
              Estado: String(r.Estado).trim(),
              Região: String(r['Região'] || '').trim(),
              Emendas_x_Desemprego: safeNumber(r['Emendas x Desemprego']),
              Emendas_x_QL_Cultura: safeNumber(r['Emendas x QL Cultura']),
              Emendas_x_Gastos_Cultura: safeNumber(r['Emendas x Gastos Cultura']),
              Emendas_x_Empregos_Criativos: safeNumber(r['Emendas x Empregos Criativos Bruto']),
              Emendas_x_Empregos_Total: safeNumber(r['Emendas x Empregos Total Bruto']),
              Gastos_Cultura_x_Empregos_Criativos: safeNumber(r['Gastos_Cultura x Empregos Criativos Bruto']),
              Media_Emenda_Periodo: safeNumber(r['Média EMENDA PERÍODO']),
              Media_Empregos_Criativos: safeNumber(r['Média EMPREGOS CRIATIVOS']),
              Media_Empregos_Bruto: safeNumber(r['Média EMPREGOS BRUTO']),
            }));
          setCorrelDados(parsed1);
        }

        // Sheet 2: base_trabalhada (time series correlations)
        if (workbook.SheetNames[1]) {
          const ws2 = workbook.Sheets[workbook.SheetNames[1]];
          const raw2 = XLSX.utils.sheet_to_json(ws2) as any[];
          const parsed2: BaseTrabalhada[] = raw2
            .filter(r => r.Estado && r.Ano)
            .map(r => ({
              Estado: String(r.Estado).trim(),
              Ano: safeNumber(r.Ano),
              Região: String(r['Região'] || '').trim(),
              Emendas_x_Desemprego: safeNumber(r['Emendas x Desemprego']),
              Emendas_x_QL_Cultura: safeNumber(r['Emendas x QL Cultura']),
              Emendas_x_Gastos_Cultura: safeNumber(r['Emendas x Gastos Cultura']),
              Emendas_x_Empregos_Criativos: safeNumber(r['Emendas x Empregos Criativos Bruto']),
              Emendas_x_Empregos_Total: safeNumber(r['Emendas x Empregos Total Bruto']),
              Gastos_Cultura_x_Empregos_Criativos: safeNumber(r['Gastos_Cultura x Empregos Criativos Bruto']),
              Media_Emenda_Periodo: safeNumber(r['Média EMENDA PERÍODO']),
              Media_Empregos_Criativos: safeNumber(r['Média EMPREGOS CRIATIVOS']),
              Media_Empregos_Bruto: safeNumber(r['Média EMPREGOS BRUTO']),
            }));
          setBaseTrabalhada(parsed2);
        }

        // Sheet 3: raw data (original variables)
        if (workbook.SheetNames[2]) {
          const ws3 = workbook.Sheets[workbook.SheetNames[2]];
          const raw3 = XLSX.utils.sheet_to_json(ws3) as any[];
          const cleanedData: EmendasData[] = raw3
            .filter(row => row.Estado && row.Ano)
            .map(row => {
              const populacao = safeNumber(row['População_Residente']);
              const emendas = safeNumber(row['VL_Emendas_Parlamentares']);
              const pib = safeNumber(row['PIB_Estadual']);
              const emendasPerCapita = populacao > 0 ? emendas / populacao : 0;
              const pibPerCapita = populacao > 0 ? pib / populacao : 0;

              return {
                Estado: String(row.Estado).trim(),
                Região: String(row['Região'] || '').trim(),
                Ano: safeNumber(row.Ano),
                VL_Emendas_Parlamentares: emendas,
                População_Residente: populacao,
                Taxa_de_Desemprego: safeNumber(row['Taxa_de_Desemprego']),
                Quociente_Locacional_Cultura: safeNumber(row['Quociente_Locacional_Cultura']),
                PIB_Estadual: pib,
                Gastos_Cultura: safeNumber(row['Gastos_Cultura']),
                IDH_Educação: safeNumber(row['IDH_Educação']),
                IDH_Longevidade: safeNumber(row['IDH_Longevidade']),
                IDH_Renda: safeNumber(row['IDH_Renda']),
                Emendas_Per_Capita: emendasPerCapita,
                PIB_Per_Capita: pibPerCapita,
                Vinculos_Empregos_Criativos: safeNumber(row['Vínculos_Empregos_Criativos(2017_2023)']),
                Total_Vinculos_Empregos: safeNumber(row['Total_Vínculos_Empregos_(2014_2021)_Antes_Quebra_RAIS']),
              };
            });
          setData(cleanedData);
        }

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados');
        setLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, []);

  const getStates = () => [...new Set(data.map(d => d.Estado))];
  const getYears = () => [...new Set(data.map(d => d.Ano))].sort((a, b) => a - b);
  const getRegions = () => [...new Set(data.map(d => d.Região))];

  const getDataByState = (state: string) => data.filter(d => d.Estado === state);
  const getDataByYear = (year: number) => data.filter(d => d.Ano === year);
  const getDataByRegion = (region: string) => data.filter(d => d.Região === region);

  const getLatestYearWithData = () => {
    const years = getYears();
    return years[years.length - 1];
  };

  const getStateDataForVariable = (variable: keyof EmendasData, year?: number) => {
    const targetYear = year || getLatestYearWithData();
    const yearData = data.filter(d => d.Ano === targetYear);
    return yearData.map(d => ({
      state: d.Estado,
      value: Number(d[variable]) || 0,
      region: d.Região
    }));
  };

  const getTimeSeriesForState = (state: string, variable: keyof EmendasData) => {
    return data
      .filter(d => d.Estado === state)
      .sort((a, b) => a.Ano - b.Ano)
      .map(d => ({
        year: d.Ano,
        value: Number(d[variable]) || 0
      }));
  };

  const getStatistics = () => {
    if (data.length === 0) return null;

    const totalEmendas = data.reduce((acc, d) => acc + d.VL_Emendas_Parlamentares, 0);
    const years = getYears();
    const states = getStates();

    const latestYear = years[years.length - 1];
    const latestData = data.filter(d => d.Ano === latestYear);

    const avgDesemprego = latestData.reduce((acc, d) => acc + d.Taxa_de_Desemprego, 0) / latestData.length;
    const avgIDH = latestData.reduce((acc, d) => acc + (d.IDH_Educação + d.IDH_Longevidade + d.IDH_Renda) / 3, 0) / latestData.length;

    return {
      totalEmendas,
      totalStates: states.length,
      yearsRange: `${years[0]} - ${latestYear}`,
      avgDesemprego,
      avgIDH,
      totalGastosCultura: latestData.reduce((acc, d) => acc + d.Gastos_Cultura, 0),
    };
  };

  return {
    data,
    correlDados,
    baseTrabalhada,
    loading,
    error,
    getStates,
    getYears,
    getRegions,
    getDataByState,
    getDataByYear,
    getDataByRegion,
    getStateDataForVariable,
    getTimeSeriesForState,
    getStatistics,
    getLatestYearWithData,
  };
}
