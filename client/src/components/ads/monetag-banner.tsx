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
    mobile: 'h-16',
    desktop: 'h-24',
    responsive: 'h-16 md:h-24'
  };

  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t mb-16'; // mb-16 to account for social bar

  return (
    <div className={`fixed left-0 right-0 z-30 bg-gray-50 ${positionClasses}`}>
      {/* Fallback banner for development/testing */}
      {!isLoaded && (
        <div className={`w-full ${bannerSizes[size]} flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500`}>
          <div className="text-center text-white">
            <p className="text-sm font-medium">📱 Download Our App for Better Experience!</p>
            <p className="text-xs opacity-80">Get exclusive features and faster loading</p>
          </div>
        </div>
      )}
      
      {/* Monetag Banner will be inserted here */}
      <div id="monetag-banner" className={`monetag-banner ${bannerSizes[size]} w-full`} />
      
      <style jsx>{`
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