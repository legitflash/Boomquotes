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
      {/* Adsterra Social Bar will be inserted here - only show when script loads */}
      <div id="adsterra-social-bar" className="adsterra-social-bar" style={{ display: isLoaded ? 'block' : 'none' }} />
      
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