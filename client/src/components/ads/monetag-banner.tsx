import { useEffect, useState } from 'react';

interface MonetagBannerProps {
  position?: 'top' | 'bottom';
  size?: 'mobile' | 'desktop' | 'responsive';
}

export function MonetagBanner({ position = 'bottom', size = 'responsive' }: MonetagBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Monetag banner script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//thubanoa.com/1?z=7517891';
    
    script.onload = () => {
      setIsLoaded(true);
      // Initialize Monetag banner
      if (window.Monetag) {
        window.Monetag.init({
          key: '7517891',
          format: 'banner',
          size: size,
          position: position,
          onLoad: () => setIsLoaded(true)
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [position, size]);

  const bannerSizes = {
    mobile: 'h-12',
    desktop: 'h-16',
    responsive: 'h-12 md:h-16'
  };

  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t mb-12'; // mb-12 to account for social bar

  return (
    <div className={`fixed left-0 right-0 z-30 bg-gray-50 ${positionClasses}`}>
      {/* Fallback banner for development/testing - minimal and non-intrusive */}
      {!isLoaded && (
        <div className={`w-full ${bannerSizes[size]} flex items-center justify-center bg-gray-100 border-t border-gray-200`}>
          <div className="text-center text-gray-600">
            <p className="text-xs">Ad Space</p>
          </div>
        </div>
      )}
      
      {/* Monetag Banner will be inserted here */}
      <div id="monetag-banner" className={`monetag-banner ${bannerSizes[size]} w-full`} />
      
      <style>{`
        .monetag-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .monetag-banner {
            min-height: 64px;
          }
        }
        
        /* Desktop optimizations */
        @media (min-width: 769px) {
          .monetag-banner {
            min-height: 96px;
          }
        }
      `}</style>
    </div>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    Monetag?: any;
  }
}