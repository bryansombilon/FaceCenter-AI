
import React, { useState, useRef } from 'react';
import { urlToBase64, fileToBase64, downloadImage } from './utils/imageUtils';
import { processImageWithAI } from './services/geminiService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ProcessingResult } from './types';
import { Camera, Upload, Link as LinkIcon, Download, RefreshCw, X, Image as ImageIcon, Circle } from 'lucide-react';

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [showCirclePreview, setShowCirclePreview] = useState(true);
  const [result, setResult] = useState<ProcessingResult>({
    originalUrl: '',
    processedUrl: null,
    status: 'idle'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async (source: 'url' | 'file', data?: File) => {
    try {
      setResult(prev => ({ ...prev, status: 'loading', errorMessage: undefined }));
      
      let base64Data = '';
      let mimeType = '';
      let displayUrl = '';

      if (source === 'url') {
        if (!inputUrl) return;
        const res = await urlToBase64(inputUrl);
        base64Data = res.data;
        mimeType = res.mimeType;
        displayUrl = inputUrl;
      } else if (source === 'file' && data) {
        const res = await fileToBase64(data);
        base64Data = res.data;
        mimeType = res.mimeType;
        displayUrl = URL.createObjectURL(data);
      }

      setResult(prev => ({ ...prev, originalUrl: displayUrl }));

      const processedImage = await processImageWithAI(base64Data, mimeType);
      
      setResult(prev => ({
        ...prev,
        processedUrl: processedImage,
        status: 'success'
      }));
    } catch (error: any) {
      setResult(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error.message || 'Failed to process image. Please check the URL or try another photo.'
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcess('file', file);
    }
  };

  const reset = () => {
    setResult({ originalUrl: '', processedUrl: null, status: 'idle' });
    setInputUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 py-6 px-4 md:px-8 flex flex-col items-center">
        <div className="flex items-center space-x-2 text-indigo-600 mb-2">
          <Camera size={32} />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">FaceCenter AI</h1>
        </div>
        <p className="text-slate-500 text-center max-w-xl">
          Automatic face centering and square outpainting. Optimized for circle profile layouts with AI-generated backgrounds.
        </p>
      </header>

      <main className="w-full max-w-6xl mt-8 px-4 flex flex-col items-center space-y-8">
        {/* Input Section */}
        {(result.status === 'idle' || result.status === 'error') ? (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center">
                  <LinkIcon size={16} className="mr-2" /> Photo URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                  <button
                    onClick={() => handleProcess('url')}
                    disabled={!inputUrl}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Process
                  </button>
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or upload a file</span></div>
              </div>

              {/* File Input */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
              >
                <Upload size={48} className="text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" />
                <span className="text-slate-600 font-medium">Click to select an image from your device</span>
                <span className="text-slate-400 text-sm mt-1">High resolution JPG or PNG recommended</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              {result.errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start">
                  <X size={18} className="mr-2 mt-0.5 shrink-0" />
                  <span>{result.errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Processing State */}
        {result.status === 'loading' && (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-12 border border-slate-100">
            <LoadingOverlay />
          </div>
        )}

        {/* Results State */}
        {result.status === 'success' && result.processedUrl && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Original Preview */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Original</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Input Photo</span>
              </div>
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-50 relative group">
                <img 
                  src={result.originalUrl} 
                  alt="Original" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Processed Result */}
            <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-indigo-100 transform md:scale-105">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Processed Result</span>
                <button 
                  onClick={() => setShowCirclePreview(!showCirclePreview)}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${showCirclePreview ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  <Circle size={12} fill={showCirclePreview ? "currentColor" : "none"} />
                  <span>Circle View</span>
                </button>
              </div>
              
              <div className="aspect-square overflow-hidden bg-slate-50 shadow-inner flex items-center justify-center relative">
                <img 
                  src={result.processedUrl} 
                  alt="Processed" 
                  className={`w-full h-full object-cover transition-all duration-500 ${showCirclePreview ? 'rounded-full scale-[0.98]' : 'rounded-xl'}`}
                />
                {showCirclePreview && (
                    <div className="absolute inset-0 border-[40px] border-white/80 pointer-events-none rounded-xl" style={{ clipPath: 'path("M0 0h100v100H0z M50 50 m-50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0")' }}></div>
                )}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => downloadImage(result.processedUrl!)}
                  className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
                >
                  <Download size={20} className="mr-2" /> Download Square
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-4 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  <RefreshCw size={20} className="mr-2" /> Try Another
                </button>
              </div>
              <p className="mt-4 text-xs text-center text-slate-400 italic">
                AI centered the face and added extra padding for the perfect circle crop.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-auto pt-12 text-slate-400 text-sm text-center px-4 max-w-2xl">
        <div className="flex items-center justify-center space-x-2 mb-2">
           <ImageIcon size={14} />
           <p>Powered by Gemini 2.5 Flash • High Fidelity Profile Generation</p>
        </div>
        <p>&copy; 2024 FaceCenter AI. Professional portrait outpainting technology.</p>
      </footer>
    </div>
  );
};

export default App;
