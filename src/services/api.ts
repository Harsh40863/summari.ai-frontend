import axios from 'axios';
import type {
  QueryRequest,
  QueryResponse,
  UploadResponse,
  DocumentsResponse,
  HealthResponse,
  SupportedLanguagesResponse,
} from '../types/api';
// Configure the base URL - adjust this to your FastAPI server
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalize backend response shape to UI-expected QueryResponse
function normalizeQueryResponse(raw: any): QueryResponse {
  const items = Array.isArray(raw?.results) ? raw.results.map((r: any) => ({
    content: r?.content ?? r?.summary ?? r?.best_sentence ?? '',
    metadata: {
      document_name: r?.document_name ?? r?.source ?? r?.metadata?.document_name,
      best_sentence: r?.best_sentence,
      score: r?.score,
      summary: r?.summary,
      web_content: r?.web_content,
      refined_insight: r?.refined_insight,
      // PPT specific fields
      ppt_path: r?.ppt_path,
      file_name: r?.file_name,
      action_type: r?.action_type,
      ...(r?.metadata && typeof r.metadata === 'object' ? r.metadata : {}),
    },
    similarity: typeof r?.similarity === 'number' ? r.similarity : (typeof r?.score === 'number' ? r.score : undefined),
    source: r?.source ?? r?.document_name,
  })) : [];

  return {
    success: Boolean(raw?.success),
    message: raw?.message ?? '',
    results: items,
    action: raw?.action ?? raw?.action_type ?? 'search',
    timestamp: raw?.timestamp ?? new Date().toISOString(),
    query: raw?.query ?? '',
    translation: raw?.translation,
  } as QueryResponse;
}

// API service functions
export const apiService = {
  // Health and status
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },

  async getStatus() {
    const response = await api.get('/status');
    return response.data;
  },

  // Languages
  async getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
    const response = await api.get<SupportedLanguagesResponse>('/languages');
    return response.data;
  },

  // File upload
  async uploadFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Query operations
  async query(request: QueryRequest): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/query', request);
    return normalizeQueryResponse(response.data);
  },

  async search(query: string, threshold = 0.35, translate_to = 'en'): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/search', {
      query,
      action: 'search',
      threshold,
      translate_to,
    }, { timeout: 0 });
    return normalizeQueryResponse(response.data);
  },

  async explore(query: string, threshold = 0.35): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/explore', {
      query,
      action: 'explore',
      threshold,
    }, { timeout: 0 });
    return normalizeQueryResponse(response.data);
  },

  async think(query: string, threshold = 0.35, translate_to = 'en'): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/think', {
      query,
      action: 'think',
      threshold,
      translate_to,
    }, { timeout: 0 });
    return normalizeQueryResponse(response.data);
  },

  async generatePPT(query: string, threshold = 0.35): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/ppt', {
      query,
      action: 'ppt',
      threshold,
    }, { timeout: 0 });
    return normalizeQueryResponse(response.data);
  },

  // Document management
  async getDocuments(): Promise<DocumentsResponse> {
    const response = await api.get<DocumentsResponse>('/documents');
    return response.data;
  },

  async reloadDocuments() {
    const response = await api.post('/documents/reload');
    return response.data;
  },

  // Download PPT
  async downloadPPT(path: string): Promise<Blob> {
    const response = await api.get(`/ppt/download?path=${encodeURIComponent(path)}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Open PPT (for preview/viewing)
  async openPPT(path: string): Promise<string> {
    const blob = await this.downloadPPT(path);
    const url = window.URL.createObjectURL(blob);
    return url;
  },

  // System operations
  async resetSystem() {
    const response = await api.delete('/reset');
    return response.data;
  },
};

export default apiService;