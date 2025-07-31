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
      {/* Fallback push ad for development/testing */}
      {!isLoaded && (
        <div className={`fixed ${positionClasses[position]} z-40 max-w-sm`}>
          <div className="bg-white rounded-lg shadow-xl border overflow-hidden animate-slide-in">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-sm">💎 Special Offer!</h3>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-3">
                Get premium access to exclusive quotes and messages! 
              </p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Adsterra Push Ad will be inserted here */}
      <div id="adsterra-push-ad" className="adsterra-push-ad" />
      
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