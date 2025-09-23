import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { UploadResponse } from '@/types/api';

interface FileUploadProps {
  onUploadComplete?: (response: UploadResponse) => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiService.uploadFiles(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast({
          title: "Upload successful",
          description: response.message,
        });
        setFiles([]);
        onUploadComplete?.(response);
      } else {
        toast({
          title: "Upload failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          interactive-card cursor-pointer transition-all duration-300 min-h-48 flex flex-col items-center justify-center
          ${isDragActive ? 'border-primary bg-primary/5 glow-primary' : 'border-dashed border-border hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-primary">Drop files here...</p>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">Upload Documents</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: PDF, DOCX, PPTX, TXT, JPG, PNG
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="glass rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <File className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="btn-hero w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} file{files.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;