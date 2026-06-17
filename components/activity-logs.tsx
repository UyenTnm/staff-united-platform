'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LogIn,
  LogOut,
  Lock,
  Unlock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  type: 'login' | 'logout' | 'access' | 'change' | 'alert' | 'success';
  timestamp: string;
  details: string;
}

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    action: 'User Login',
    user: 'Sarah Anderson',
    type: 'login',
    timestamp: '2 minutes ago',
    details: 'Accessed dashboard from 192.168.1.45',
  },
  {
    id: '2',
    action: 'Permission Changed',
    user: 'Marcus Chen',
    type: 'change',
    timestamp: '45 minutes ago',
    details: 'Admin role granted to new system access',
  },
  {
    id: '3',
    action: 'System Alert',
    user: 'API Gateway',
    type: 'alert',
    timestamp: '2 hours ago',
    details: 'High CPU usage detected on API Gateway',
  },
  {
    id: '4',
    action: 'User Logout',
    user: 'Emily Rodriguez',
    type: 'logout',
    timestamp: '3 hours ago',
    details: 'Session ended after 8.5 hours',
  },
  {
    id: '5',
    action: 'Access Granted',
    user: 'James Wilson',
    type: 'success',
    timestamp: '5 hours ago',
    details: 'Approved access to Enterprise Database',
  },
  {
    id: '6',
    action: 'Access Denied',
    user: 'Unknown User',
    type: 'alert',
    timestamp: '6 hours ago',
    details: 'Multiple failed login attempts detected',
  },
  {
    id: '7',
    action: 'Policy Update',
    user: 'System',
    type: 'change',
    timestamp: '8 hours ago',
    details: 'Security policies updated and enforced',
  },
  {
    id: '8',
    action: 'Audit Completed',
    user: 'Lisa Park',
    type: 'success',
    timestamp: '1 day ago',
    details: 'Monthly security audit completed successfully',
  },
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'login':
      return LogIn;
    case 'logout':
      return LogOut;
    case 'access':
      return Unlock;
    case 'change':
      return FileText;
    case 'alert':
      return AlertCircle;
    case 'success':
      return CheckCircle;
    default:
      return User;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'login':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    case 'logout':
      return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    case 'access':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
    case 'change':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
    case 'alert':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    case 'success':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
    default:
      return '';
  }
}

export function ActivityLogs() {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 col-span-1 lg:col-span-2">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Recent security and system activity
          </p>
        </div>
        <Button variant="outline" className="text-sm">
          View All
        </Button>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {mockActivities.map((activity) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <div
              key={activity.id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0 mt-0.5`}>
                  <ActivityIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                        {activity.details}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
                      {activity.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">By:</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {activity.user}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
