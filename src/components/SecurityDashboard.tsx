import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityStats {
  totalScans: number;
  threatsBlocked: number;
  cleanFiles: number;
  activeScans: number;
}

interface SecurityDashboardProps {
  stats: SecurityStats;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ stats }) => {
  const riskLevel = stats.threatsBlocked > 5 ? 'high' : stats.threatsBlocked > 0 ? 'medium' : 'low';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalScans}</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/20 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{stats.threatsBlocked}</p>
            <p className="text-sm text-muted-foreground">Threats Blocked</p>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{stats.cleanFiles}</p>
            <p className="text-sm text-muted-foreground">Clean Files</p>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/20 rounded-lg">
            <Activity className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{stats.activeScans}</p>
            <p className="text-sm text-muted-foreground">Active Scans</p>
          </div>
        </div>
      </Card>
    </div>
  );
};