export interface EmendasData {
  Estado: string;
  Ano: number;
  Região: string;
  VL_Emendas_Parlamentares: number;
  População_Residente: number;
  Taxa_de_Desemprego: number;
  Quociente_Locacional_Cultura: number;
  PIB_Estadual: number;
  Gastos_Cultura: number;
  IDH_Educação: number;
  IDH_Longevidade: number;
  IDH_Renda: number;
  Emendas_Per_Capita: number;
  PIB_Per_Capita: number;
}

export interface VariableInfo {
  key: keyof EmendasData;
  label: string;
  format: (value: number) => string;
  description: string;
  unit?: string;
}

export const VARIABLES: VariableInfo[] = [
  {
    key: 'VL_Emendas_Parlamentares',
    label: 'Valor das Emendas Parlamentares',
    format: (v) => `R$ ${(v / 1000000).toFixed(2)}M`,
    description: 'Valor total das emendas parlamentares destinadas ao estado',
    unit: 'R$ Milhões'
  },
  {
    key: 'População_Residente',
    label: 'População Residente',
    format: (v) => v ? v.toLocaleString('pt-BR') : '—',
    description: 'População total residente no estado',
    unit: 'Habitantes'
  },
  {
    key: 'Taxa_de_Desemprego',
    label: 'Taxa de Desemprego',
    format: (v) => `${v.toFixed(2)}%`,
    description: 'Percentual da população economicamente ativa desempregada',
    unit: '%'
  },
  {
    key: 'Quociente_Locacional_Cultura',
    label: 'Quociente Locacional de Cultura',
    format: (v) => v.toFixed(4),
    description: 'Indicador de concentração do setor cultural no estado',
    unit: 'Índice'
  },
  {
    key: 'PIB_Estadual',
    label: 'PIB Estadual',
    format: (v) => `R$ ${(v / 1000000000).toFixed(2)}B`,
    description: 'Produto Interno Bruto do estado',
    unit: 'R$ Bilhões'
  },
  {
    key: 'Gastos_Cultura',
    label: 'Gastos com Cultura',
    format: (v) => `R$ ${(v / 1000000).toFixed(2)}M`,
    description: 'Total de gastos públicos com cultura no estado',
    unit: 'R$ Milhões'
  },
  {
    key: 'IDH_Educação',
    label: 'IDH Educação',
    format: (v) => v.toFixed(3),
    description: 'Índice de Desenvolvimento Humano - Componente Educação',
    unit: 'Índice'
  },
  {
    key: 'IDH_Longevidade',
    label: 'IDH Longevidade',
    format: (v) => v.toFixed(3),
    description: 'Índice de Desenvolvimento Humano - Componente Longevidade',
    unit: 'Índice'
  },
  {
    key: 'IDH_Renda',
    label: 'IDH Renda',
    format: (v) => v.toFixed(3),
    description: 'Índice de Desenvolvimento Humano - Componente Renda',
    unit: 'Índice'
  },
  {
    key: 'Emendas_Per_Capita',
    label: 'Emendas Per Capita',
    format: (v) => `R$ ${v.toFixed(2)}`,
    description: 'Valor das emendas parlamentares dividido pela população',
    unit: 'R$ por habitante'
  },
  {
    key: 'PIB_Per_Capita',
    label: 'PIB Per Capita',
    format: (v) => `R$ ${v.toFixed(2)}`,
    description: 'Produto Interno Bruto dividido pela população',
    unit: 'R$ por habitante'
  }
];

export const STATES_INFO: Record<string, { name: string; region: string; abbr: string }> = {
  'Rondônia': { name: 'Rondônia', region: 'Norte', abbr: 'RO' },
  'Acre': { name: 'Acre', region: 'Norte', abbr: 'AC' },
  'Amazonas': { name: 'Amazonas', region: 'Norte', abbr: 'AM' },
  'Roraima': { name: 'Roraima', region: 'Norte', abbr: 'RR' },
  'Pará': { name: 'Pará', region: 'Norte', abbr: 'PA' },
  'Amapá': { name: 'Amapá', region: 'Norte', abbr: 'AP' },
  'Tocantins': { name: 'Tocantins', region: 'Norte', abbr: 'TO' },
  'Maranhão': { name: 'Maranhão', region: 'Nordeste', abbr: 'MA' },
  'Piauí': { name: 'Piauí', region: 'Nordeste', abbr: 'PI' },
  'Ceará': { name: 'Ceará', region: 'Nordeste', abbr: 'CE' },
  'Rio Grande do Norte': { name: 'Rio Grande do Norte', region: 'Nordeste', abbr: 'RN' },
  'Paraíba': { name: 'Paraíba', region: 'Nordeste', abbr: 'PB' },
  'Pernambuco': { name: 'Pernambuco', region: 'Nordeste', abbr: 'PE' },
  'Alagoas': { name: 'Alagoas', region: 'Nordeste', abbr: 'AL' },
  'Sergipe': { name: 'Sergipe', region: 'Nordeste', abbr: 'SE' },
  'Bahia': { name: 'Bahia', region: 'Nordeste', abbr: 'BA' },
  'Minas Gerais': { name: 'Minas Gerais', region: 'Sudeste', abbr: 'MG' },
  'Espírito Santo': { name: 'Espírito Santo', region: 'Sudeste', abbr: 'ES' },
  'Rio de Janeiro': { name: 'Rio de Janeiro', region: 'Sudeste', abbr: 'RJ' },
  'São Paulo': { name: 'São Paulo', region: 'Sudeste', abbr: 'SP' },
  'Paraná': { name: 'Paraná', region: 'Sul', abbr: 'PR' },
  'Santa Catarina': { name: 'Santa Catarina', region: 'Sul', abbr: 'SC' },
  'Rio Grande do Sul': { name: 'Rio Grande do Sul', region: 'Sul', abbr: 'RS' },
  'Mato Grosso do Sul': { name: 'Mato Grosso do Sul', region: 'Centro-Oeste', abbr: 'MS' },
  'Mato Grosso': { name: 'Mato Grosso', region: 'Centro-Oeste', abbr: 'MT' },
  'Goiás': { name: 'Goiás', region: 'Centro-Oeste', abbr: 'GO' },
  'Distrito Federal': { name: 'Distrito Federal', region: 'Centro-Oeste', abbr: 'DF' },
};

export const REGION_COLORS: Record<string, string> = {
  'Norte': 'hsl(120 45% 45%)',
  'Nordeste': 'hsl(35 80% 50%)',
  'Centro-Oeste': 'hsl(200 70% 50%)',
  'Sudeste': 'hsl(350 65% 45%)',
  'Sul': 'hsl(280 50% 55%)',
};
