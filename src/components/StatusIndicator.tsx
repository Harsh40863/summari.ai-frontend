import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Brain, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { HealthResponse } from '@/types/api';

interface StatusIndicatorProps {
  onStatusChange?: (status: HealthResponse) => void;
}

const StatusIndicator = ({ onStatusChange }: StatusIndicatorProps) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    checkHealth();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealth = async () => {
    if (!isOnline) return;
    
    try {
      setLoading(true);
      const response = await apiService.getHealth();
      setHealth(response);
      setLastUpdated(new Date());
      onStatusChange?.(response);
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Connection issue",
        description: "Unable to reach the API server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        icon: WifiOff,
        label: 'Offline',
        description: 'No internet connection'
      };
    }

    if (!health) {
      return {
        status: 'unknown',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/10',
        borderColor: 'border-muted/30',
        icon: AlertTriangle,
        label: 'Unknown',
        description: 'Status check pending'
      };
    }

    switch (health.status) {
      case 'healthy':
        return {
          status: 'healthy',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          icon: CheckCircle2,
          label: 'Healthy',
          description: 'All systems operational'
        };
      case 'partial':
        return {
          status: 'partial',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          icon: AlertTriangle,
          label: 'Partial',
          description: 'Some issues detected'
        };
      default:
        return {
          status: 'unhealthy',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          icon: XCircle,
          label: 'Unhealthy',
          description: 'Service issues detected'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <Card className="interactive-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>System Status</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkHealth}
            disabled={loading || !isOnline}
            className="h-8 w-8 p-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
            <div className="w-full h-full rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusInfo.description} • Last checked {formatLastUpdated()}
            </p>
          </div>
        </div>

        {/* Detailed Status */}
        {health && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Documents */}
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Documents</span>
                </div>
                <Badge 
                  variant={health.has_documents ? "default" : "destructive"}
                  className={`text-xs ${
                    health.has_documents 
                      ? 'bg-success/10 text-success border-success/30' 
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  {health.document_count}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {health.has_documents ? 'Ready for search' : 'No documents loaded'}
              </p>
            </div>

            {/* Search Engine */}
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Search Engine</span>
                </div>
                <Badge 
                  variant={health.has_search_engine ? "default" : "destructive"}
                  className={`text-xs ${
                    health.has_search_engine 
                      ? 'bg-accent/10 text-accent border-accent/30' 
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  {health.has_search_engine ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {health.has_embeddings ? 'Embeddings ready' : 'No embeddings generated'}
              </p>
            </div>

            {/* Network Status */}
            <div className="glass rounded-lg p-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">Network</span>
                </div>
                <Badge 
                  variant={isOnline ? "default" : "destructive"}
                  className={`text-xs ${
                    isOnline 
                      ? 'bg-success/10 text-success border-success/30' 
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  {isOnline ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isOnline ? 'API connection available' : 'Check your internet connection'}
              </p>
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            API Status • Auto-refresh every 30s
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;