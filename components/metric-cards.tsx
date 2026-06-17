import { Card } from '@/components/ui/card';
import { Users, Shield, Box, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MetricCards() {
  const metrics = [
    {
      title: 'Employees',
      value: '1,254',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      trend: 'up',
    },
    {
      title: 'Assets',
      value: '48',
      change: '+2',
      icon: Shield,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      trend: 'up',
    },
    {
      title: 'Active Clients',
      value: '3,891',
      change: '+156',
      icon: Box,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      trend: 'up',
    },
    {
      title: 'Open Quotes',
      value: '23',
      change: '-5',
      icon: AlertCircle,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      trend: 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isNegative = metric.change.startsWith('-');

        return (
          <Card
            key={metric.title}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`} />
                <span className={`text-sm font-medium ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-500">from last month</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
