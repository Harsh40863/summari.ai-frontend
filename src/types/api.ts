export interface QueryRequest {
  query: string;
  action: 'search' | 'explore' | 'think' | 'ppt';
  threshold?: number;
  translate_to?: string;
}

export interface TranslationInfo {
  target_language: string;
  target_language_name: string;
  source_language: string;
  translated: boolean;
}

export interface QueryResponse {
  success: boolean;
  message: string;
  results: Array<{
    content?: string;
    metadata?: any;
    similarity?: number;
    source?: string;
    [key: string]: any;
  }>;
  action: string;
  timestamp: string;
  query: string;
  translation?: TranslationInfo;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  uploaded_files: Array<{
    filename: string;
    status: string;
    message?: string;
    error?: string;
  }>;
  timestamp: string;
}

export interface DocumentInfo {
  name: string;
  content_length: number;
  upload_date: string;
}

export interface DocumentsResponse {
  total_documents: number;
  documents: DocumentInfo[];
  clusters: number;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  has_documents: boolean;
  has_embeddings: boolean;
  has_search_engine: boolean;
  document_count: number;
  timestamp: string;
}

export interface SupportedLanguagesResponse {
  languages: Record<string, string>;
  default: string;
  note: string;
}