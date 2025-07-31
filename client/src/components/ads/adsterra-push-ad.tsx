import { useEffect, useState } from 'react';

interface AdsterraPushAdProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  delay?: number;
}

export function AdsterraPushAd({ position = 'top-right', delay = 3000 }: AdsterraPushAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Show push ad after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    // Load Adsterra push ad script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl22497826.cpmrevenuegate.com/9e8fc53debb65b24ef6a2c7b7b428046/invoke.js';
    
    script.onload = () => {
      setIsLoaded(true);
      // Initialize push ad
      if (window.AdsterraPush) {
        window.AdsterraPush.init({
          key: '9e8fc53debb65b24ef6a2c7b7b428046',
          format: 'push',
          position: position,
          onLoad: () => setIsLoaded(true)
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timer);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [position, delay]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4'
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Adsterra Push Ad will be inserted here - only show when script loads */}
      <div id="adsterra-push-ad" className="adsterra-push-ad" style={{ display: isLoaded ? 'block' : 'none' }} />
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .adsterra-push-ad {
            max-width: calc(100vw - 2rem);
          }
        }
      `}</style>
    </>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    AdsterraPush?: any;
  }
}