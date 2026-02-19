import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, BarChart3, ArrowRightLeft, Grid3X3, Database } from 'lucide-react';
import PainelDados from './PainelDados';
import AnaliseComparativa from './AnaliseComparativa';
import HeatmapsMapas from './HeatmapsMapas';
import ExploradorVariaveis from './ExploradorVariaveis';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dados');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hero-gradient text-primary-foreground">
        <div className="container py-8 md:py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
                Observatório das Emendas
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Análise de Emendas Parlamentares e Indicadores Socioeconômicos
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span className="opacity-70">Período:</span> <span className="font-medium">2014 – 2024</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span className="opacity-70">Estados:</span> <span className="font-medium">27 UFs</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span className="opacity-70">Variáveis:</span> <span className="font-medium">11 Indicadores</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-14 w-full justify-start bg-transparent border-0 rounded-none gap-2">
              <TabsTrigger value="dados"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Painel de Dados</span>
              </TabsTrigger>
              <TabsTrigger value="comparativo"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Análise Comparativa</span>
              </TabsTrigger>
              <TabsTrigger value="heatmaps"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2">
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Heatmaps & Mapas</span>
              </TabsTrigger>
              <TabsTrigger value="explorador"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Explorador</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dados" className="mt-0 animate-fade-in">
            <PainelDados />
          </TabsContent>
          <TabsContent value="comparativo" className="mt-0 animate-fade-in">
            <AnaliseComparativa />
          </TabsContent>
          <TabsContent value="heatmaps" className="mt-0 animate-fade-in">
            <HeatmapsMapas />
          </TabsContent>
          <TabsContent value="explorador" className="mt-0 animate-fade-in">
            <ExploradorVariaveis />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Observatório das Emendas • Dados consolidados para pesquisa acadêmica
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Desenvolvido com dados públicos</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
