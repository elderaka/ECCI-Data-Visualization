/**
 * Register service worker for offline tile caching
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Skip service worker in development mode
  if (import.meta.env.DEV) {
    console.log('⏭️ Service Worker disabled in development mode');
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registered successfully');
    console.log('   Tiles will be cached for faster loading on repeat visits');

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New Service Worker available - refresh to update');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Clear all service worker caches
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.success || false);
    };

    navigator.serviceWorker.controller!.postMessage(
      { action: 'clearCache' },
      [messageChannel.port2]
    );
  });
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ tileCount: number } | null> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve({ tileCount: event.data.tileCount || 0 });
    };

    navigator.serviceWorker.controller!.postMessage(
      { action: 'getCacheSize' },
      [messageChannel.port2]
    );
  });
}
