import type { Map } from 'maplibre-gl';
import type { LoadingScreen } from './loading-screen';
import type { LODControl } from './lod-control';
import type { DataLoadingIndicator } from './data-loading-indicator';
import { isNavigationActive, isPickMapModeActive } from './region-click';
import { isStoryModeActive } from './sections/story-mode';

const FIXED_LONGITUDE = -3; // Fixed center longitude
const CENTER_LATITUDE = 55; // Center latitude
let previousZoom = 4;
const loadedZoomLevels = new Set<number>(); // Track which zoom levels have been loaded

// Export the set so it can be populated during preload
export function getLoadedZoomLevels(): Set<number> {
  return loadedZoomLevels;
}

export function setupMapEvents(
  map: Map, 
  loadingScreen?: LoadingScreen, 
  lodControl?: LODControl,
  dataIndicator?: DataLoadingIndicator
) {
  
  map.on('load', () => {
    (map as any).showTileBoundaries = true;
    console.log('Map loaded successfully');
    console.log('Sources:', map.getStyle().sources);
    console.log('Layers:', map.getStyle().layers);
    previousZoom = map.getZoom();
    // Don't add to loadedZoomLevels here - preloadCriticalTiles handles it
  });

  // Restrict horizontal panning at zoom levels 4-6 (unless navigating or in story mode or pick-map mode)
  map.on('move', () => {
    const zoom = map.getZoom();
    
    // Skip clamping if navigation is in progress OR story mode is active OR pick-map mode is active
    if (isNavigationActive() || isStoryModeActive() || isPickMapModeActive()) return;
    
    // For zoom levels 4-6, lock longitude to center
    if (zoom >= 4 && zoom <= 4) {
      const center = map.getCenter();
      if (Math.abs(center.lng - FIXED_LONGITUDE) > 0.01) {
        console.log('🔒 Longitude clamping active - free mode should disable this');
        map.setCenter([FIXED_LONGITUDE, center.lat]);
      }
    }
  });

  // Log zoom changes and recenter when transitioning between zoom 4-6
  map.on('zoom', () => {
    const zoom = map.getZoom();
    const wasInRestrictedRange = previousZoom >= 4 && previousZoom <= 6;
    const isInRestrictedRange = zoom >= 4 && zoom <= 6;
    
    // Detect zoom level changes that might trigger different PMTiles layers
    const previousZoomFloor = Math.floor(previousZoom);
    const currentZoomFloor = Math.floor(zoom);
    
    // Skip loading screen if manual mode is active OR story mode is active
    const isManualMode = lodControl?.isManualMode() ?? false;
    
    // CRITICAL: Don't show loading screen during story mode (tiles are preloaded)
    if (isStoryModeActive()) {
      previousZoom = zoom;
      return;
    }
    
    // Show loading only if crossing to a NEW zoom level that hasn't been loaded before
    if (currentZoomFloor !== previousZoomFloor && loadingScreen && !isManualMode) {
      // Nations: 0-7, LAs: 7-10, SAs: 9+
      const crossedThreshold = 
        (previousZoomFloor < 7 && currentZoomFloor >= 7) ||
        (previousZoomFloor >= 7 && currentZoomFloor < 7) ||
        (previousZoomFloor < 9 && currentZoomFloor >= 9) ||
        (previousZoomFloor >= 9 && currentZoomFloor < 9);
      
      // Only show loading if this is a new zoom level AND we crossed a threshold
      const isNewZoomLevel = !loadedZoomLevels.has(currentZoomFloor);
      
      if (crossedThreshold && isNewZoomLevel) {
        console.log('New zoom threshold crossed, showing loading screen');
        loadingScreen.setProgress(0);
        loadingScreen.show();
        
        // Mark this zoom level as loaded
        loadedZoomLevels.add(currentZoomFloor);
        
        // Simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 25;
          loadingScreen.setProgress(progress);
          if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              loadingScreen.hide();
            }, 200);
          }
        }, 100);
      } else if (crossedThreshold) {
        console.log('Revisiting previously loaded zoom level, skipping loading screen');
      }
    }
    
    // Skip recentering if navigation is in progress OR story mode is active OR pick-map mode is active
    if (isNavigationActive() || isStoryModeActive() || isPickMapModeActive()) {
      previousZoom = zoom;
      return;
    }
    
    // If transitioning into the restricted zoom range, recenter
    if (isInRestrictedRange && !wasInRestrictedRange) {
      console.log('Entering restricted zoom range, recentering map');
      map.setCenter([FIXED_LONGITUDE, CENTER_LATITUDE]);
    }
    
    // If changing zoom levels within the restricted range, recenter
    if (isInRestrictedRange && wasInRestrictedRange && Math.floor(zoom) !== Math.floor(previousZoom)) {
      console.log('Zoom level changed within restricted range, recentering map');
      map.setCenter([FIXED_LONGITUDE, CENTER_LATITUDE]);
    }
    
    previousZoom = zoom;
  });

  // Track tile loading with data indicator
  // Use 'idle' event instead of counting tiles to handle cancellations
  let isLoading = false;
  
  map.on('dataloading', (e) => {
    if (e.dataType === 'source' && !isLoading) {
      isLoading = true;
      dataIndicator?.show();
      console.log('Data loading started');
    }
  });

  // Map is idle when all tiles are loaded or requests are complete/canceled
  map.on('idle', () => {
    if (isLoading) {
      isLoading = false;
      dataIndicator?.hide();
      console.log('Map idle - data loading complete');
    }
  });

  // Log source data loading
  map.on('sourcedata', (e) => {
    if (e.isSourceLoaded) {
      console.log(`Source loaded: ${e.sourceId}`, e);
    }
  });

  // Log tile loading errors
  map.on('error', (e) => {
    console.error('Map error:', e);
  });

  // map.on('sourcedataloading', (e) => {
  //   console.log(`Loading source: ${e.sourceId}`);
  // });
}
