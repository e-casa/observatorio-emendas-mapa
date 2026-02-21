import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, ArrowRightLeft, Grid3X3, Database } from 'lucide-react';
import PainelDados from './PainelDados';
import AnaliseComparativa from './AnaliseComparativa';
import HeatmapsMapas from './HeatmapsMapas';
import ExploradorVariaveis from './ExploradorVariaveis';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dados');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container py-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Observatório das Emendas
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Análise de Emendas Parlamentares e Indicadores Socioeconômicos
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-foreground/60">
            <span>Período: <strong className="text-primary-foreground/90">2014–2024</strong></span>
            <span>Estados: <strong className="text-primary-foreground/90">27 UFs</strong></span>
            <span>Variáveis: <strong className="text-primary-foreground/90">11 Indicadores</strong></span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-12 w-full justify-start bg-transparent border-0 rounded-none gap-1">
              <TabsTrigger value="dados"
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5 gap-2 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Painel de Dados</span>
              </TabsTrigger>
              <TabsTrigger value="comparativo"
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5 gap-2 text-sm">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Análise Comparativa</span>
              </TabsTrigger>
              <TabsTrigger value="heatmaps"
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5 gap-2 text-sm">
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Heatmaps & Mapas</span>
              </TabsTrigger>
              <TabsTrigger value="explorador"
                className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2.5 gap-2 text-sm">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Explorador</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dados" className="mt-0">
            <PainelDados />
          </TabsContent>
          <TabsContent value="comparativo" className="mt-0">
            <AnaliseComparativa />
          </TabsContent>
          <TabsContent value="heatmaps" className="mt-0">
            <HeatmapsMapas />
          </TabsContent>
          <TabsContent value="explorador" className="mt-0">
            <ExploradorVariaveis />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Observatório das Emendas · Dados consolidados para pesquisa acadêmica</span>
            <span>Desenvolvido com dados públicos</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
