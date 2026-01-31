import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  className 
}: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-foreground font-serif">
          {value}
        </h3>
        
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2">
            {trendValue && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trend === 'up' && "bg-green-100 text-green-700",
                trend === 'down' && "bg-red-100 text-red-700",
                trend === 'neutral' && "bg-muted text-muted-foreground"
              )}>
                {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
