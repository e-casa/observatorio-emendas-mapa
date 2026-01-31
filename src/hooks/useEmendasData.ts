import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type { EmendasData } from '@/types/emendas';

export function useEmendasData() {
  const [data, setData] = useState<EmendasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/Base_Consolidada_Mestrado.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as EmendasData[];
        
        // Limpar e normalizar dados
        const cleanedData = jsonData
          .filter(row => row.Estado && row.Ano) // Remover linhas inválidas
          .map(row => {
            const populacao = Number(row.População_Residente) || 0;
            const emendas = Number(row.VL_Emendas_Parlamentares) || 0;
            const pib = Number(row.PIB_Estadual) || 0;
            
            // Calcular per capita corretamente (o Excel tem valores estranhos)
            const emendasPerCapita = populacao > 0 ? emendas / populacao : 0;
            const pibPerCapita = populacao > 0 ? pib / populacao : 0;
            
            return {
              ...row,
              Estado: String(row.Estado).trim(),
              Região: String(row.Região || '').trim(),
              VL_Emendas_Parlamentares: emendas,
              População_Residente: populacao,
              Taxa_de_Desemprego: Number(row.Taxa_de_Desemprego) || 0,
              Quociente_Locacional_Cultura: Number(row.Quociente_Locacional_Cultura) || 0,
              PIB_Estadual: pib,
              Gastos_Cultura: Number(row.Gastos_Cultura) || 0,
              IDH_Educação: Number(row.IDH_Educação) || 0,
              IDH_Longevidade: Number(row.IDH_Longevidade) || 0,
              IDH_Renda: Number(row.IDH_Renda) || 0,
              Emendas_Per_Capita: emendasPerCapita,
              PIB_Per_Capita: pibPerCapita,
              Ano: Number(row.Ano),
            };
          });
        
        setData(cleanedData);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados');
        setLoading(false);
        console.error(err);
      }
    }
    
    loadData();
  }, []);

  // Funções auxiliares
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

  // Estatísticas gerais
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
