import { useState } from 'react';
import { OverviewDashboard } from '@/components/OverviewDashboard';
import { MapExplorer } from '@/components/MapExplorer';
import { CorrelationPanel } from '@/components/CorrelationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Map, 
  GitCompare, 
  Landmark,
  ExternalLink
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
              <span className="opacity-70">Período:</span>{' '}
              <span className="font-medium">2014 - 2024</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span className="opacity-70">Estados:</span>{' '}
              <span className="font-medium">27 Unidades Federativas</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span className="opacity-70">Variáveis:</span>{' '}
              <span className="font-medium">11 Indicadores</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-14 w-full justify-start bg-transparent border-0 rounded-none gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger 
                value="explorer" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Explorar Mapa</span>
              </TabsTrigger>
              <TabsTrigger 
                value="correlation" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Correlação</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="mt-0 animate-fade-in">
            <OverviewDashboard />
          </TabsContent>
          
          <TabsContent value="explorer" className="mt-0 animate-fade-in">
            <MapExplorer />
          </TabsContent>
          
          <TabsContent value="correlation" className="mt-0 animate-fade-in">
            <CorrelationPanel />
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
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Desenvolvido com dados públicos
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
