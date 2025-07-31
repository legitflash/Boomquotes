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
      {/* Fallback social bar for development/testing */}
      {!isLoaded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">💰 Earn rewards with daily check-ins!</span>
              <button 
                onClick={onAdClick}
                className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Check In Now
              </button>
            </div>
            <button 
              className="text-white/80 hover:text-white text-lg"
              onClick={() => {/* Handle close */}}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Adsterra Social Bar will be inserted here */}
      <div id="adsterra-social-bar" className="adsterra-social-bar" />
      
      <style jsx>{`
        .adsterra-social-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          min-height: 60px;
        }
        
        .adsterra-social-bar-container {
          position: relative;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .adsterra-social-bar {
            min-height: 50px;
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