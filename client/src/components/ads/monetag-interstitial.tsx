import { useEffect, useState } from 'react';

interface MonetagInterstitialProps {
  onShow?: () => void;
  onClose?: () => void;
  trigger?: 'pageload' | 'manual';
}

export function MonetagInterstitial({ onShow, onClose, trigger = 'pageload' }: MonetagInterstitialProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has seen interstitial today
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('monetag-interstitial-last-shown');
    
    if (lastShown !== today) {
      // Load Monetag interstitial script
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//thubanoa.com/1?z=7517892';
      
      script.onload = () => {
        setIsLoaded(true);
        
        if (trigger === 'pageload') {
          // Show after 2 seconds for better UX
          setTimeout(() => {
            showInterstitial();
          }, 2000);
        }
        
        // Initialize Monetag interstitial
        if (window.MonetagInterstitial) {
          window.MonetagInterstitial.init({
            key: '7517892',
            format: 'interstitial',
            onShow: () => {
              setShouldShow(true);
              localStorage.setItem('monetag-interstitial-last-shown', today);
              onShow?.();
            },
            onClose: () => {
              setShouldShow(false);
              onClose?.();
            }
          });
        }
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [trigger, onShow, onClose]);

  const showInterstitial = () => {
    if (window.MonetagInterstitial && isLoaded) {
      window.MonetagInterstitial.show();
    } else {
      // Fallback interstitial for development/testing
      setShouldShow(true);
      const today = new Date().toDateString();
      localStorage.setItem('monetag-interstitial-last-shown', today);
      onShow?.();
    }
  };

  const closeInterstitial = () => {
    setShouldShow(false);
    onClose?.();
  };

  // Manual trigger function
  const triggerInterstitial = () => {
    showInterstitial();
  };

  if (!shouldShow || !isLoaded) {
    return trigger === 'manual' ? (
      <button onClick={triggerInterstitial} style={{ display: 'none' }} />
    ) : null;
  }

  return (
    <>
      {/* Only show interstitial when ads actually load */}
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" style={{ display: isLoaded ? 'flex' : 'none' }}>
        <div className="bg-white rounded-xl max-w-md w-full mx-auto shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">🎉 Special Offer!</h2>
              <button 
                onClick={closeInterstitial}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unlock Premium Features
              </h3>
              <p className="text-gray-600 mb-4">
                Get access to exclusive quotes, unlimited favorites, and ad-free browsing experience!
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                10,000+ Premium Quotes & Messages
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited Favorites & Downloads
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Ad-Free Experience
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Priority Customer Support
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                Get Premium - $4.99/month
              </button>
              <button 
                onClick={closeInterstitial}
                className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Monetag Interstitial will be handled by script */}
      <div id="monetag-interstitial" />
      
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .animate-scale-in {
            margin: 1rem;
          }
        }
      `}</style>
    </>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    MonetagInterstitial?: any;
  }
}