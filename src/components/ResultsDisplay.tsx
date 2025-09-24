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
  Loader2,
  Presentation,
  Eye,
  FileDown
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
  const [openingPPT, setOpeningPPT] = useState<string | null>(null);
  const [expandedWebSections, setExpandedWebSections] = useState<Set<string>>(new Set());
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
      a.download = path.split(/[/\\]/).pop() || 'presentation.pptx';
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

  const openPPT = async (path: string) => {
    try {
      setOpeningPPT(path);
      const blob = await apiService.downloadPPT(path);
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      toast({
        title: "Opening presentation",
        description: "PowerPoint presentation is opening in a new tab",
      });
      
      // Clean up URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      toast({
        title: "Failed to open",
        description: error instanceof Error ? error.message : "Failed to open presentation",
        variant: "destructive",
      });
    } finally {
      setOpeningPPT(null);
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

  // Convert URLs in text to links and preserve line breaks
  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s)]+)(?=[\s)|]|$)/g;
    return text.split(/\r?\n/).map((line, idx) => {
      const parts = line.split(urlRegex);
      return (
        <div key={idx} className="whitespace-pre-wrap">
          {parts.map((part, i) => {
            if (urlRegex.test(part)) {
              urlRegex.lastIndex = 0;
              return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                  {part}
                </a>
              );
            }
            urlRegex.lastIndex = 0;
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  // Extract items of { title, url, section } from web_content
  // Recognizes headings like: "### 📈 Most Popular Results:" and "### 🕒 Latest Results:"
  // and bullets like: "🔗 **Title**" followed by a URL on the next non-empty line
  const extractLinksFromWebContent = (text: string): Array<{ title: string; url: string; section?: string }> => {
    const lines = text.split(/\r?\n/);
    const items: Array<{ title: string; url: string; section?: string }> = [];
    let currentSection: string | undefined = undefined;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      // Section headings
      const headingMatch = line.match(/^###\s*(.+?):\s*$/);
      if (headingMatch) {
        const heading = headingMatch[1];
        if (/Most Popular Results/i.test(heading)) currentSection = 'Most Popular Results';
        else if (/Latest Results/i.test(heading)) currentSection = 'Latest Results';
        else currentSection = heading;
        continue;
      }

      // Match bullets that look like: 🔗 **Title**
      const titleMatch = line.match(/^\s*🔗\s*\*\*(.+?)\*\*/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        // Find the next non-empty line that looks like a URL
        let url = '';
        for (let j = i + 1; j < lines.length; j++) {
          const next = lines[j].trim();
          if (!next) continue;
          if (/^https?:\/\//i.test(next)) {
            url = next;
            break;
          }
          if (/^\s*🔗\s*\*\*/.test(next) || /^###\s*/.test(next)) break;
        }
        if (title && url) items.push({ title, url, section: currentSection });
      }
    }
    return items;
  };

  // Clean up titles: remove surrounding asterisks and emojis
  const cleanTitle = (title: string) => title.replace(/^\*+|\*+$/g, '').replace(/^\p{Emoji_Presentation}\s*/u, '').trim();

  // Get domain from URL for subtitle
  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
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
                        {/* Hide header PPT quick action to avoid duplication; dedicated section below handles download */}
                      </div>
                    </div>

                    {/* PPT Section: Show the presentation itself, not document info */}
                    {results.action === 'ppt' && (
                      <>
                        <div className="space-y-4">
                          {/* PPT Preview Card */}
                          <div className="glass rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Presentation className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {(() => {
                                      const fileName = result.metadata?.file_name || result.metadata?.ppt_path;
                                      if (!fileName) return 'Generated Presentation';
                                      const parts = fileName.split(/[/\\]/);
                                      const fullName = parts[parts.length - 1] || fileName;
                                      // Remove file extension and timestamp for cleaner display
                                      return fullName.replace(/\.pptx?$/i, '').replace(/_\d{8}_\d{6}$/, '');
                                    })()}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    PowerPoint Presentation • Ready to view
                                  </p>
                                </div>
                              </div>
                              
                              {result.similarity && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                  {(result.similarity * 100).toFixed(0)}% match
                                </Badge>
                              )}
                            </div>

                            {/* PPT Content Preview */}
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/10">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-sm font-medium text-foreground">Presentation Preview</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <FileText className="w-4 h-4" />
                                  <span>Generated from your query: "{results.query}"</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>Created: {formatDate(results.timestamp)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Download Button */}
                            <div className="flex justify-center pt-2">
                              {result.metadata?.ppt_path && (
                                <Button
                                  variant="default"
                                  size="default"
                                  onClick={() => downloadPPT(result.metadata!.ppt_path as string)}
                                  disabled={downloadingPPT === result.metadata.ppt_path}
                                  className="px-8"
                                >
                                  {downloadingPPT === result.metadata.ppt_path ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <FileDown className="w-4 h-4 mr-2" />
                                  )}
                                  Download Presentation
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {results.action !== 'ppt' && (
                      <>
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

                    {/* Web Content for Explore */}
                    {results.action === 'explore' && result.metadata?.web_content && (() => {
                      const links = extractLinksFromWebContent(result.metadata.web_content);
                      if (links.length === 0) return null;

                      // Group by section preserving order: Most Popular Results, Latest Results, then others
                      const sectionOrder = ['Most Popular Results', 'Latest Results'];
                      const groups: Record<string, typeof links> = {};
                      const others: typeof links = [] as any;
                      for (const it of links) {
                        const key = it.section || 'Other';
                        if (!groups[key]) groups[key] = [] as any;
                        groups[key].push(it);
                        if (!sectionOrder.includes(key) && key !== 'Other') sectionOrder.push(key);
                      }
                      if (groups['Other']) {
                        sectionOrder.push('Other');
                      }

                      return (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground">Web Content</p>
                            {sectionOrder.filter(sec => groups[sec]?.length).map((sec) => {
                              const isOpen = expandedWebSections.has(sec);
                              const items = groups[sec];
                              const visible = isOpen ? items : items.slice(0, 5);
                              return (
                              <div key={sec} className="space-y-2">
                                {sec !== 'Other' && (
                                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{sec}</div>
                                )}
                                <ul className="space-y-2">
                                  {visible.map((item, idx) => {
                                    const title = cleanTitle(item.title);
                                    const domain = getDomain(item.url);
                                    return (
                                      <li key={idx} className="glass rounded-lg p-3 hover:bg-primary/5 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-2 min-w-0">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                                              {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                              <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-primary hover:underline break-words"
                                              >
                                                {title}
                                              </a>
                                              {domain && (
                                                <div className="text-xs text-muted-foreground mt-0.5">{domain}</div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 px-2 text-xs"
                                              onClick={() => copyToClipboard(item.url)}
                                              title="Copy link"
                                            >
                                              <Copy className="w-3 h-3 mr-1" />
                                              Copy
                                            </Button>
                                            <a
                                              href={item.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center text-primary hover:underline"
                                              aria-label="Open link"
                                              title={item.url}
                                            >
                                              <ExternalLink className="w-4 h-4" />
                                            </a>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                                {items.length > 5 && (
                                  <div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => {
                                        const next = new Set(expandedWebSections);
                                        if (isOpen) next.delete(sec); else next.add(sec);
                                        setExpandedWebSections(next);
                                      }}
                                    >
                                      {isOpen ? 'Show less' : `Show more (${items.length - 5})`}
                                    </Button>
                                  </div>
                                )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}

                    {/* Refined Insights for Think */}
                    {results.action === 'think' && result.metadata?.refined_insight && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">Insights</p>
                          <div className="glass rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap">
                            {result.metadata.refined_insight}
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
                  </>
                )}
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