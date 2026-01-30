
export interface ProcessingResult {
  originalUrl: string;
  processedUrl: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
