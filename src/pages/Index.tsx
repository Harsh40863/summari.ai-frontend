import { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Database, 
  Activity, 
  Menu, 
  X, 
  Github, 
  Globe,
  Zap,
  Brain,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import BackgroundVideo from '@/components/BackgroundVideo';
import FileUpload from '@/components/FileUpload';
import SearchInterface from '@/components/SearchInterface';
import DocumentManager from '@/components/DocumentManager';
import ResultsDisplay from '@/components/ResultsDisplay';
import StatusIndicator from '@/components/StatusIndicator';

import type { QueryResponse, UploadResponse, HealthResponse } from '@/types/api';

const Index = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState<QueryResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<HealthResponse | null>(null);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Set page title and meta description
    document.title = "AI Document Search & Analysis Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Intelligent document search, exploration, and analysis with AI-powered insights and multi-language translation support.');
    }
  }, []);

  const handleUploadComplete = (response: UploadResponse) => {
    if (response.success) {
      setActiveTab('documents');
      // Refresh document count
      setTimeout(() => {
        setDocumentsCount(prev => prev + response.uploaded_files.filter(f => f.status === 'success').length);
      }, 1000);
    }
  };

  const handleSearchResults = (results: QueryResponse) => {
    setSearchResults(results);
    setActiveTab('results');
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
  };

  const handleSearchComplete = () => {
    setSearchLoading(false);
  };

  const handleStatusChange = (status: HealthResponse) => {
    setSystemHealth(status);
    setDocumentsCount(status.document_count);
  };

  const navigationItems = [
    { id: 'search', label: 'Search', icon: Search, description: 'AI-powered document search' },
    { id: 'upload', label: 'Upload', icon: Upload, description: 'Add new documents' },
    { id: 'documents', label: 'Documents', icon: Database, description: 'Manage your library' },
    { id: 'results', label: 'Results', icon: FileText, description: 'View search results' },
    { id: 'status', label: 'Status', icon: Activity, description: 'System health' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Advanced AI-powered document analysis and insights'
    },
    {
      icon: Globe,
      title: 'Multi-language',
      description: 'Search and translate results in 8+ languages'
    },
    {
      icon: Zap,
      title: 'Fast Search',
      description: 'Lightning-fast semantic search across all documents'
    },
  ];

  const NavContent = () => (
    <nav className="space-y-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left
              ${isActive 
                ? 'bg-primary/10 text-primary border border-primary/30 glow-primary' 
                : 'hover:bg-primary/5 hover:text-primary text-foreground'
              }
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            {item.id === 'documents' && documentsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {documentsCount}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-animated-gradient">
      <BackgroundVideo />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass-strong border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <NavContent />
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    DocuMind AI
                  </h1>
                  <p className="text-xs text-muted-foreground">Intelligent Document Platform</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-3">
              {systemHealth && (
                <Badge 
                  variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}
                  className={`hidden sm:flex text-xs ${
                    systemHealth.status === 'healthy' 
                      ? 'bg-success/10 text-success border-success/30' 
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                  {systemHealth.status === 'healthy' ? 'Online' : 'Issues'}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Desktop */}
          <div className="hidden lg:block">
            <Card className="interactive-card sticky top-24">
              <CardContent className="p-0">
                <NavContent />
                
                <Separator className="my-4 mx-4" />
                
                {/* Features */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Features</h3>
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{feature.title}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tab Navigation - Mobile */}
              <TabsList className="grid w-full grid-cols-5 lg:hidden glass">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger 
                      key={item.id} 
                      value={item.id}
                      className="flex flex-col items-center space-y-1 py-3"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Welcome Section */}
              {activeTab === 'search' && !searchResults && (
                <div className="text-center space-y-6 animate-fade-in-up">
                  <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                      AI-Powered Document Intelligence
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Upload, search, analyze, and extract insights from your documents using advanced AI. 
                      Support for multiple languages and intelligent content generation.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <Card key={index} className="interactive-card animate-fade-in-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                          <CardContent className="p-6 text-center space-y-3">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Contents */}
              <TabsContent value="search" className="space-y-6">
                <SearchInterface 
                  onSearchResults={handleSearchResults}
                />
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <DocumentManager onDocumentsChange={() => {}} />
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <ResultsDisplay 
                  results={searchResults} 
                  loading={searchLoading}
                />
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <StatusIndicator onStatusChange={handleStatusChange} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;