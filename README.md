# summary.ai - Intelligent Document Search & Analysis Platform

A beautiful, dark-themed frontend for AI-powered document search, exploration, and analysis with multi-language translation support.

## Features

🧠 **AI-Powered Search** - Advanced semantic search across all document types
🌍 **Multi-Language Support** - Search and translate results in 8+ languages (English, Hindi, French, Spanish, German, Japanese, Korean, Chinese)
📄 **Document Types** - Support for PDF, DOCX, PPTX, TXT, JPG, PNG files
🔍 **Multiple Search Modes**:
- **Search**: Find relevant documents with translation support
- **Explore**: Browse and discover content (no translation)
- **Think**: AI analysis and insights with translation
- **PPT**: Generate PowerPoint presentations from content

🎨 **Beautiful Dark Theme** - Modern glass-morphism design with animated backgrounds
📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
⚡ **Real-time Status** - Live system health monitoring
📊 **Document Management** - Upload, view, and manage your document library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- FastAPI backend server running (see API configuration below)

### Installation

1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies
```bash
npm install
```

3. Configure API endpoint
Edit `src/services/api.ts` and update the `BASE_URL`:
```typescript
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com'  // Your production API URL
  : 'http://localhost:8080';       // Your local FastAPI server
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

## FastAPI Backend Setup

This frontend is designed to work with the provided FastAPI backend. Make sure your FastAPI server is running with the following endpoints:

### Required API Endpoints

- `GET /health` - System health check
- `GET /languages` - Get supported translation languages
- `POST /upload` - Upload documents
- `POST /query` - Process search queries
- `POST /search` - Search documents (with translation)
- `POST /explore` - Explore documents (no translation)  
- `POST /think` - AI analysis (with translation)
- `POST /ppt` - Generate PowerPoint presentations
- `GET /ppt/download` - Download generated PPT files
- `GET /documents` - Get document information
- `POST /documents/reload` - Reload document index
- `DELETE /reset` - Reset the search engine

### Backend Configuration

1. Install FastAPI backend dependencies
2. Set up your document processing pipeline
3. Configure translation services (Redis Translator)
4. Start the FastAPI server on port 8080

## Usage Guide

### 1. Upload Documents
- Drag and drop files or click to browse
- Supports: PDF, DOCX, PPTX, TXT, JPG, PNG
- Files are automatically processed and indexed

### 2. Search & Analyze
- **Search**: Find relevant content with optional translation
- **Explore**: Browse documents in original language
- **Think**: Get AI insights and analysis
- **PPT**: Generate presentations from search results

### 3. Language Translation
Available for Search and Think modes:
- English (en) - Default
- Hindi (hi)
- French (fr) 
- Spanish (es)
- German (de)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)

### 4. Document Management
- View all uploaded documents
- Check processing status and clusters
- Reload document index when needed

### 5. System Monitoring
- Real-time health status
- Document count and processing status
- Network connectivity monitoring

## Design System

The application features a sophisticated dark theme with:

- **Colors**: Deep blues, purples, and teals with accent colors
- **Gradients**: Animated background gradients and button effects
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Animations**: Smooth transitions, hover effects, and particle backgrounds
- **Typography**: Clean, readable fonts with proper contrast
- **Responsive**: Mobile-first design with adaptive layouts

## Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:8080  # FastAPI backend URL
```

### Customization

The design system is fully customizable via:
- `src/index.css` - Color tokens, gradients, animations
- `tailwind.config.ts` - Tailwind theme configuration
- Component variants in individual UI components

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Update API configuration for production environment

4. Ensure CORS is properly configured on your FastAPI backend

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Vite** - Fast development and building
- **Axios** - HTTP client for API calls
- **React Dropzone** - File upload functionality
- **Lucide React** - Beautiful icons

## API Integration

The frontend seamlessly integrates with the FastAPI backend through:
- Type-safe API calls with TypeScript interfaces
- Error handling with user-friendly messages
- Loading states and progress indicators
- Real-time status monitoring
- File upload with progress tracking

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the API documentation at `/docs` on your FastAPI server
- Review the component documentation in the codebase
- Ensure your FastAPI backend is properly configured and running

---

Built with ❤️ using modern web technologies and beautiful design principles.