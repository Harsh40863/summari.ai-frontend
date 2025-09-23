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
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return response.data;
  },

  async search(query: string, threshold = 0.35, translate_to = 'en'): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/search', {
      query,
      action: 'search',
      threshold,
      translate_to,
    });
    return response.data;
  },

  async explore(query: string, threshold = 0.35): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/explore', {
      query,
      action: 'explore',
      threshold,
    });
    return response.data;
  },

  async think(query: string, threshold = 0.35, translate_to = 'en'): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/think', {
      query,
      action: 'think',
      threshold,
      translate_to,
    });
    return response.data;
  },

  async generatePPT(query: string, threshold = 0.35): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/ppt', {
      query,
      action: 'ppt',
      threshold,
    });
    return response.data;
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

  // System operations
  async resetSystem() {
    const response = await api.delete('/reset');
    return response.data;
  },
};

export default apiService;