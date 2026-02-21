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
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
        {Icon && (
          <Icon className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground tabular-nums">
          {value}
        </h3>
        
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2">
            {trendValue && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trend === 'up' && "bg-green-50 text-green-700 border border-green-200",
                trend === 'down' && "bg-red-50 text-red-700 border border-red-200",
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
