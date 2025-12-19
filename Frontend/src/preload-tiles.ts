import type { Map as MapLibreMap } from 'maplibre-gl';
import type { LoadingScreen } from './loading-screen';

/**
 * Preload zoom level 5 tiles for the entire map
 * Story mode will use only zoom 5, so this prevents any loading screens during scrolling
 */
export async function preloadCriticalTiles(
  map: MapLibreMap,
  loadingScreen?: LoadingScreen,
  loadedZoomLevels?: Set<number>
): Promise<void> {
  return new Promise((resolve) => {
    console.log('📦 Waiting for initial tiles to load (map starts at zoom 5)...');
    
    if (loadingScreen) {
      loadingScreen.setProgress(70);
    }

    const STORY_ZOOM = 5;
    
    // Map already starts at zoom 5, so just mark it as loaded
    if (loadedZoomLevels) {
      loadedZoomLevels.add(STORY_ZOOM);
    }

    // Wait for all tiles to load (map becomes idle)
    const idleHandler = () => {
      map.off('idle', idleHandler);
      console.log('✅ Initial tiles loaded - story mode ready!');
      
      if (loadingScreen) {
        loadingScreen.setProgress(90);
      }
      
      resolve();
    };
    
    map.once('idle', idleHandler);
    
    // Progress animation while loading
    if (loadingScreen) {
      let progress = 70;
      const progressInterval = setInterval(() => {
        progress += 3;
        if (progress < 88) {
          loadingScreen.setProgress(progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 150);
      
      // Clear interval when done
      map.once('idle', () => clearInterval(progressInterval));
    }
    
    // Timeout fallback (10 seconds max)
    setTimeout(() => {
      map.off('idle', idleHandler);
      console.warn('⚠️ Preload timeout - continuing anyway');
      resolve();
    }, 10000);
  });
}
