
import React from 'react';

const MESSAGES = [
  "Analyzing facial structure...",
  "Calculating optimal square crop...",
  "Generating high-resolution background...",
  "Outpainting seamless details...",
  "Finalizing AI magic...",
  "Enhancing portrait quality...",
];

export const LoadingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          {MESSAGES[msgIndex]}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Using Gemini 2.5 Flash for advanced outpainting
        </p>
      </div>
    </div>
  );
};
