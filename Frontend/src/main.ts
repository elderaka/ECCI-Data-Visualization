import maplibregl from 'maplibre-gl';
import { registerPMTilesProtocol } from './pmtiles-setup';
import { createMapStyle } from './map-style';
import { setupMapEvents, getLoadedZoomLevels } from './map-events';
import { LODControl } from './lod-control';
import { ZoomControl } from './zoom-control';
import { CompassControl } from './compass-control';
import { LoadingScreen } from './loading-screen';
import { DataLoadingIndicator } from './data-loading-indicator';
import { HeatmapControl } from './heatmap-control';
import { setupLabels } from './labels';
import { setupRegionClick } from './region-click';
import { StoryMode } from './sections/story-mode';
import { addNebulaSkybox } from './nebula-skybox';
import { preloadCriticalTiles } from './preload-tiles';
import { PerformanceMonitor } from './performance-monitor';
import { registerServiceWorker } from './service-worker-register';
import { Navbar } from './navbar';
import { MAP_CONFIG } from './config';

// Register service worker for offline caching
registerServiceWorker();

// Create and show loading screen
const loadingScreen = new LoadingScreen();
loadingScreen.show();
loadingScreen.setProgress(0);

// Create data loading indicator
const dataIndicator = new DataLoadingIndicator();

// Register PMTiles protocol
registerPMTilesProtocol();
loadingScreen.setProgress(20);

// Create map
const map = new maplibregl.Map({
  container: 'map',
  style: createMapStyle(),
  center: MAP_CONFIG.center,
  zoom: MAP_CONFIG.zoom,
  minZoom: MAP_CONFIG.minZoom,
  maxZoom: MAP_CONFIG.maxZoom,
  minPitch: MAP_CONFIG.minPitch,
  maxPitch: MAP_CONFIG.maxPitch,
  attributionControl: false,
  // Limit panning to UK area with generous padding for zoom level 4
  maxBounds: [
    [-30, 40], // Southwest coordinates (wide padding for low zoom)
    [20, 70]   // Northeast coordinates (wide padding for low zoom)
  ],
  renderWorldCopies: false, // Prevent world wrapping
  // Enable full rotation for story scrolling
  bearingSnap: 0, // Disable bearing snap to north
});

loadingScreen.setProgress(40);

// Add nebula skybox background
addNebulaSkybox(map);

// Add debug overlay (toggle with 'D' key)
// const debugOverlay = new DebugOverlay(map);
// console.log('🐛 Debug overlay available - press "D" to toggle');

// Add LOD control (bottom-left)
const lodControl = new LODControl(map);
map.addControl(lodControl as any, 'bottom-left');

// Add zoom control (bottom-left, above LOD)
const zoomControl = new ZoomControl(map);
map.addControl(zoomControl as any, 'bottom-left');

// Add heatmap control (top-right, collapsible)
const heatmapControl = new HeatmapControl(map, loadingScreen, lodControl);
map.addControl(heatmapControl as any, 'top-right');

// Connect LOD control to heatmap - reload heatmap when LOD changes manually
lodControl.onLevelChange = () => {
  heatmapControl.onLODChange();
};

// Setup event listeners (pass loading screen, LOD control, and data indicator)
setupMapEvents(map, loadingScreen, lodControl, dataIndicator);

// Setup labels
setupLabels(map);

// Add compass control (before setupRegionClick so we can pass it)
const compassControl = new CompassControl(map);
map.addControl(compassControl as any, 'bottom-right');

// Setup region click handlers (pass compass and LOD controls)
setupRegionClick(map, compassControl, lodControl);

loadingScreen.setProgress(60);

// Hide loading screen when map is fully loaded
map.on('load', async () => {
  console.log('🗺️ Map loaded, waiting for tiles...');
  
  // Wait for initial tiles to load (map starts at zoom 5 for story mode)
  // This is the ONLY loading needed for initialization
  await preloadCriticalTiles(map, loadingScreen, getLoadedZoomLevels());
  
  console.log('✅ Preload complete, zoom levels cached:', Array.from(getLoadedZoomLevels()));
  
  loadingScreen.setProgress(100);
  setTimeout(() => {
    loadingScreen.hide();
    
    // Initialize story mode after loading (pass LOD control)
    const storyMode = new StoryMode(map, lodControl);
    console.log('📖 Story mode initialized');
    
    // Create navbar after story mode
    const navbar = new Navbar();
    navbar.setStoryMode(storyMode);
    
    // Initialize performance monitor
    const perfMonitor = new PerformanceMonitor(map);
    
    // Make globally accessible for debugging
    (window as any).storyMode = storyMode;
    (window as any).perfMonitor = perfMonitor;
    (window as any).navbar = navbar;
  }, 500);
});

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    map.remove();
  });
}

