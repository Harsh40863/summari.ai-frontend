import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  ExternalLink, 
  Languages, 
  Clock, 
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { QueryResponse } from '@/types/api';

interface ResultsDisplayProps {
  results: QueryResponse | null;
  loading?: boolean;
}

const ResultsDisplay = ({ results, loading }: ResultsDisplayProps) => {
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [downloadingPPT, setDownloadingPPT] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadPPT = async (path: string) => {
    try {
      setDownloadingPPT(path);
      const blob = await apiService.downloadPPT(path);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = path.split('/').pop() || 'presentation.pptx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "PowerPoint presentation is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download presentation",
        variant: "destructive",
      });
    } finally {
      setDownloadingPPT(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'search': return 'text-primary';
      case 'explore': return 'text-accent';
      case 'think': return 'text-success';
      case 'ppt': return 'text-warning';
      default: return 'text-foreground';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'search': return { variant: 'default' as const, bg: 'bg-primary/10', border: 'border-primary/30' };
      case 'explore': return { variant: 'secondary' as const, bg: 'bg-accent/10', border: 'border-accent/30' };
      case 'think': return { variant: 'outline' as const, bg: 'bg-success/10', border: 'border-success/30' };
      case 'ppt': return { variant: 'destructive' as const, bg: 'bg-warning/10', border: 'border-warning/30' };
      default: return { variant: 'outline' as const, bg: 'bg-muted/10', border: 'border-muted/30' };
    }
  };

  if (loading) {
    return (
      <Card className="interactive-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Processing your query...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="interactive-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium text-foreground">No results yet</p>
              <p className="text-sm text-muted-foreground">
                Execute a query to see results here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const badgeStyle = getActionBadge(results.action);

  return (
    <Card className="interactive-card">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Query Results</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={badgeStyle.variant}
                className={`${badgeStyle.bg} ${badgeStyle.border}`}
              >
                {results.action.toUpperCase()}
              </Badge>
              {results.results.length > 0 && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  {results.results.length} result{results.results.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Query Info */}
          <div className="glass rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">"{results.query}"</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(results.timestamp)}</span>
                  </div>
                  {results.translation && (
                    <div className="flex items-center space-x-1">
                      <Languages className="w-3 h-3" />
                      <span>
                        Translated to {results.translation.target_language_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(results.query)}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Status Message */}
          {results.message && (
            <div className={`p-3 rounded-lg ${results.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <p className="text-sm">{results.message}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {results.results.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your query or search parameters
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4 pr-4">
              {results.results.map((result, index) => {
                const isExpanded = expandedResults.has(index);
                const hasLongContent = result.content && result.content.length > 300;
                const displayContent = hasLongContent && !isExpanded 
                  ? result.content.substring(0, 300) + '...' 
                  : result.content;

                return (
                  <div key={index} className="glass rounded-lg p-4 space-y-3">
                    {/* Result Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm text-foreground">
                          Result {index + 1}
                          {result.source && (
                            <span className="text-muted-foreground ml-2">
                              from {result.source}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.similarity && (
                          <Badge variant="outline" className="text-xs">
                            {(result.similarity * 100).toFixed(0)}% match
                          </Badge>
                        )}
                        {result.metadata?.file_path && results.action === 'ppt' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPPT(result.metadata.file_path)}
                            disabled={downloadingPPT === result.metadata.file_path}
                            className="btn-glass"
                          >
                            {downloadingPPT === result.metadata.file_path ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            <span className="ml-1 text-xs">PPT</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {result.content && (
                      <div className="space-y-2">
                        <div className="text-sm text-foreground whitespace-pre-wrap">
                          {displayContent}
                        </div>
                        
                        {hasLongContent && (
                          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(index)}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 p-0 text-xs">
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 mr-1" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 mr-1" />
                                    Show more
                                  </>
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Metadata:</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="font-mono">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.content || '')}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;