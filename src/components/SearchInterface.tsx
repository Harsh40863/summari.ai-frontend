import { useState, useEffect } from 'react';
import { Search, Brain, Compass, FileSpreadsheet, Loader2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { QueryRequest, QueryResponse, SupportedLanguagesResponse } from '@/types/api';

interface SearchInterfaceProps {
  onSearchResults?: (results: QueryResponse) => void;
}

const actions = [
  {
    value: 'search',
    label: 'Search',
    description: 'Find relevant documents and content',
    icon: Search,
    color: 'text-primary',
    supportsTranslation: true,
  },
  {
    value: 'explore',
    label: 'Explore',
    description: 'Browse and discover content',
    icon: Compass,
    color: 'text-accent',
    supportsTranslation: false,
  },
  {
    value: 'think',
    label: 'Think',
    description: 'AI analysis and insights',
    icon: Brain,
    color: 'text-success',
    supportsTranslation: true,
  },
  {
    value: 'ppt',
    label: 'Generate PPT',
    description: 'Create presentation from content',
    icon: FileSpreadsheet,
    color: 'text-warning',
    supportsTranslation: false,
  },
];

const SearchInterface = ({ onSearchResults }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<'search' | 'explore' | 'think' | 'ppt'>('search');
  const [translateTo, setTranslateTo] = useState('en');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<SupportedLanguagesResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await apiService.getSupportedLanguages();
      console.log('Languages loaded:', response);
      setLanguages(response);
    } catch (error) {
      console.error('Failed to load languages:', error);
      // Fallback to default languages if API fails
      setLanguages({
        languages: {
          'en': 'English',
          'hi': 'Hindi',
          'fr': 'French',
          'es': 'Spanish',
          'de': 'German',
          'ja': 'Japanese',
          'ko': 'Korean',
          'zh': 'Chinese'
        },
        default: 'en',
        note: 'Translation available for search and think actions only'
      });
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const request: QueryRequest = {
        query: query.trim(),
        action: selectedAction,
        threshold: 0.35,
        translate_to: translateTo,
      };

      console.log('Sending request:', request);
      const response = await apiService.query(request);
      console.log('Received response:', response);
      
      if (response.success) {
        let description = response.message;
        if (response.translation && translateTo !== 'en') {
          description += ` (Translated to ${response.translation.target_language_name})`;
        }
        toast({
          title: "Query completed",
          description: description,
        });
        onSearchResults?.(response);
      } else {
        toast({
          title: "Query failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentAction = actions.find(a => a.value === selectedAction);
  const supportsTranslation = currentAction?.supportsTranslation;

  return (
    <div className="space-y-6">
      {/* Action Selection */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Choose Action</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isSelected = selectedAction === action.value;
            
            return (
              <button
                key={action.value}
                onClick={() => setSelectedAction(action.value as any)}
                className={`
                  glass rounded-xl p-4 text-left transition-all duration-300 group
                  ${isSelected 
                    ? 'border-primary bg-primary/10 glow-primary' 
                    : 'hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : action.color}`} />
                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Input */}
      <div className="space-y-2">
        <Label htmlFor="query" className="text-sm font-medium text-foreground">
          Query
        </Label>
        <Textarea
          id="query"
          placeholder={`Enter your ${selectedAction} query...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass min-h-24 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          Press Ctrl+Enter to search quickly
        </p>
      </div>

      {/* Language Selection */}
      {supportsTranslation && languages && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Target Language
          </Label>
          <Select value={translateTo} onValueChange={setTranslateTo}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong">
              {Object.entries(languages.languages).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {translateTo !== 'en' && (
            <p className="text-xs text-accent">
              Results will be translated to {languages.languages[translateTo]}
              {!supportsTranslation && (
                <span className="text-warning ml-2">
                  (Translation not available for {selectedAction} action)
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className="btn-hero w-full py-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {currentAction && <currentAction.icon className="w-5 h-5 mr-2" />}
            {currentAction?.label}
          </>
        )}
      </Button>
    </div>
  );
};

export default SearchInterface;