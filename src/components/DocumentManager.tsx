import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Database, Calendar, BarChart3, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { DocumentsResponse, DocumentInfo } from '@/types/api';

interface DocumentManagerProps {
  onDocumentsChange?: () => void;
}

const DocumentManager = ({ onDocumentsChange }: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<DocumentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      setDocuments(response);
    } catch (error) {
      toast({
        title: "Failed to load documents",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reloadDocuments = async () => {
    try {
      setReloading(true);
      await apiService.reloadDocuments();
      await loadDocuments();
      toast({
        title: "Documents reloaded",
        description: "Document index has been refreshed",
      });
      onDocumentsChange?.();
    } catch (error) {
      toast({
        title: "Failed to reload documents",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setReloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <Card className="interactive-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Document Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="interactive-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Document Library</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={reloadDocuments}
            disabled={reloading}
            className="btn-glass"
          >
            {reloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!documents || documents.total_documents === 0 ? (
          <div className="text-center py-8 space-y-3">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground">
                Upload some documents to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{documents.total_documents}</div>
                <div className="text-xs text-muted-foreground">Total Documents</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-accent">{documents.clusters}</div>
                <div className="text-xs text-muted-foreground">Content Clusters</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-success">
                  {documents.documents.reduce((sum, doc) => sum + doc.content_length, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Characters</div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Documents</span>
              </div>
              
              <ScrollArea className="h-64 w-full">
                <div className="space-y-2 pr-4">
                  {documents.documents.map((doc: DocumentInfo, index: number) => (
                    <div
                      key={index}
                      className="glass rounded-lg p-3 hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(doc.content_length)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(doc.upload_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs bg-success/10 text-success border-success/30"
                        >
                          Indexed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;