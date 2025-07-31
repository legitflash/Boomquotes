import { useEffect, useState } from 'react';

interface AdsterraSocialBarProps {
  onAdClick?: () => void;
  visible?: boolean;
}

export function AdsterraSocialBar({ onAdClick, visible = true }: AdsterraSocialBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Adsterra Social Bar script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl22497825.cpmrevenuegate.com/cf84785d7e9c36b6d0098e1a2d417226/invoke.js';
    
    script.onload = () => {
      setIsLoaded(true);
      // Initialize social bar ad
      if (window.AdsterraSocialBar) {
        window.AdsterraSocialBar.init({
          key: 'cf84785d7e9c36b6d0098e1a2d417226',
          format: 'social-bar',
          height: 60,
          width: 'auto',
          onLoad: () => setIsLoaded(true),
          onClick: onAdClick
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onAdClick]);

  if (!visible) return null;

  return (
    <div className="adsterra-social-bar-container">
      {/* Fallback social bar for development/testing - minimal */}
      {!isLoaded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-600">Daily Check-in Available</span>
              <button 
                onClick={onAdClick}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Check In
              </button>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 text-sm"
              onClick={() => {/* Handle close */}}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Adsterra Social Bar will be inserted here */}
      <div id="adsterra-social-bar" className="adsterra-social-bar" />
      
      <style>{`
        .adsterra-social-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          min-height: 48px;
        }
        
        .adsterra-social-bar-container {
          position: relative;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .adsterra-social-bar {
            min-height: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    AdsterraSocialBar?: any;
  }
}