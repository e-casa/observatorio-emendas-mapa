import { VARIABLES, VariableInfo } from '@/types/emendas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VariableSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  excludeKeys?: string[];
}

export function VariableSelector({ 
  value, 
  onValueChange, 
  label = "Selecione uma variável",
  placeholder = "Escolher variável",
  excludeKeys = []
}: VariableSelectorProps) {
  const filteredVariables = VARIABLES.filter(v => !excludeKeys.includes(v.key));
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {filteredVariables.map((variable) => (
            <SelectItem 
              key={variable.key} 
              value={variable.key}
              className="cursor-pointer hover:bg-secondary"
            >
              <div className="flex flex-col">
                <span className="font-medium">{variable.label}</span>
                {variable.unit && (
                  <span className="text-xs text-muted-foreground">{variable.unit}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
