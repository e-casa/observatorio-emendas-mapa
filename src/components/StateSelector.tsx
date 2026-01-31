import { STATES_INFO } from '@/types/emendas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StateSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function StateSelector({ 
  value, 
  onValueChange, 
  label = "Selecione um estado",
  placeholder = "Escolher estado"
}: StateSelectorProps) {
  const statesByRegion = Object.entries(STATES_INFO).reduce((acc, [name, info]) => {
    if (!acc[info.region]) acc[info.region] = [];
    acc[info.region].push({ name, ...info });
    return acc;
  }, {} as Record<string, Array<{ name: string; abbr: string; region: string }>>);

  const regionOrder = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border max-h-[300px]">
          {regionOrder.map(region => (
            <div key={region}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                {region}
              </div>
              {statesByRegion[region]?.map((state) => (
                <SelectItem 
                  key={state.name} 
                  value={state.name}
                  className="cursor-pointer hover:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{state.abbr}</span>
                    <span>{state.name}</span>
                  </span>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
