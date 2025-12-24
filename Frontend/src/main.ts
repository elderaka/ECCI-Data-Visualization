import maplibregl from 'maplibre-gl';
import { LngLatBounds } from 'maplibre-gl';
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
import { setupRegionClick, setPickMapMode } from './region-click';
import { StoryMode } from './sections/story-mode';
import { AreaSearch } from './area-search';
import { addNebulaSkybox } from './nebula-skybox';
import { preloadCriticalTiles } from './preload-tiles';
import { PerformanceMonitor } from './performance-monitor';
import { registerServiceWorker } from './service-worker-register';
import { Navbar } from './navbar';
import { MAP_CONFIG } from './config';
import { DebugHousing3D } from './debug-housing-3d';

// Helper function to calculate feature centroid
function getFeatureCentroid(feature: any): [number, number] {
  const bounds = new LngLatBounds();
  
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates[0].forEach((coord: number[]) => {
      bounds.extend([coord[0], coord[1]]);
    });
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach((polygon: number[][][]) => {
      polygon[0].forEach((coord: number[]) => {
        bounds.extend([coord[0], coord[1]]);
      });
    });
  }
  
  const center = bounds.getCenter();
  return [center.lng, center.lat];
}

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

// Listen for heatmap toggle events from story mode
window.addEventListener('toggleHeatmap', (e: Event) => {
  const customEvent = e as CustomEvent;
  const { show, field } = customEvent.detail;
  heatmapControl.toggleHeatmap(show, field);
});

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
    
    // Initialize area search with autocomplete
    const areaSearch = new AreaSearch();
    areaSearch.setMap(map);
    areaSearch.onSelect((area) => {
      console.log('📍 Area selected:', area);
      storyMode.setSelectedArea(area);
      // CRITICAL: Reinitialize AreaSearch after DOM is re-rendered by setSelectedArea
      setTimeout(() => {
        areaSearch.reinit();
      }, 100);
    });
    areaSearch.onReset(() => {
      console.log('🔄 Resetting to hero');
      storyMode.setSelectedArea(undefined);
      // CRITICAL: Reinitialize AreaSearch after DOM is re-rendered by reset
      setTimeout(() => {
        areaSearch.reinit();
      }, 100);
    });
    areaSearch.onMapPickMode((enabled, layer) => {
      console.log('🗺️ Map picking mode changed:', { enabled, layer });
      
      if (enabled) {
        console.log('📍 Entering map picking mode...');
        
        // DISABLE REGION DIALOG CLICKS
        setPickMapMode(true);
        
        // USE PICK-MAP MODE
        storyMode.setMode('pick-map');
        
        // Fly to UK overview position
        console.log('✈️ Flying to:', { center: [-8.4506, 55.9773], zoom: 4.94 });
        map.flyTo({
          center: [-8.4506, 55.9773],
          zoom: 4.94,
          pitch: 0,
          bearing: 0,
          duration: 1500
        });
        
        map.getCanvas().style.cursor = 'pointer';
        
        // TODO: Switch visible layer based on layer parameter
        // TODO: Add map bounds clamping
        
        // Add click handler for features (use 'on' instead of 'once' for multiple clicks)
        const clickHandler = (e: any) => {
          console.log('🖱️ Map clicked at:', e.lngLat);
          
          // Use zoom-based layer selection (same as region-click.ts)
          const currentZoom = map.getZoom();
          let validLayers: string[] = [];
          
          if (currentZoom >= 10) {
            validLayers = ['sa-fill', 'las-fill', 'nations-fill'];
          } else if (currentZoom >= 7) {
            validLayers = ['las-fill', 'nations-fill'];
          } else {
            validLayers = ['nations-fill'];
          }
          
          console.log('🔍 Querying layers at zoom', currentZoom, ':', validLayers);
          
          const features = map.queryRenderedFeatures(e.point, {
            layers: validLayers
          });
          
          console.log('📍 Features found:', features.length);
          if (features.length > 0) {
            const feature = features[0];
            console.log('✅ Selected feature:', feature.properties, 'from layer:', feature.layer.id);
            
            // Calculate feature centroid and fly to it
            const centroid = getFeatureCentroid(feature);
            console.log('🎯 Flying to feature centroid:', centroid);
            
            // Determine zoom based on layer type
            let targetZoom = 7;
            if (feature.layer.id.includes('nations')) {
              targetZoom = 5.5; // Nation - show wider view
            } else if (feature.layer.id.includes('las')) {
              targetZoom = 9; // Local authority - medium zoom
            } else if (feature.layer.id.includes('sa')) {
              targetZoom = 12; // Small area - close zoom
            }
            
            map.flyTo({
              center: centroid,
              zoom: targetZoom,
              pitch: 30, // Add pitch for better perspective
              duration: 1000
            });
            
            // Remove click handler after selection
            map.off('click', clickHandler);
            areaSearch.handleMapClick(feature, centroid);
          }
        };
        
        map.on('click', clickHandler);
      } else {// RE-ENABLE REGION DIALOG CLICKS
        setPickMapMode(false);
        
        
        console.log('🚪 Exiting map picking mode...');
        
        map.getCanvas().style.cursor = '';
        
        // RE-ENABLE STORY MODE (camera will be set by story mode based on selected area)
        console.log('🔒 Switching back to story mode');
        storyMode.setMode('story');
      }
    });
    console.log('🔍 Area search initialized');
    
    // Create navbar after story mode
    const navbar = new Navbar();
    navbar.setStoryMode(storyMode);
    
    // Initialize performance monitor
    const perfMonitor = new PerformanceMonitor(map);
    
    // Initialize debug 3D housing (toggle with window.debugHouse3D() in console)
    const debugHousing3D = new DebugHousing3D(map);
    
    // Make globally accessible for debugging
    (window as any).storyMode = storyMode;
    (window as any).areaSearch = areaSearch;
    (window as any).perfMonitor = perfMonitor;
    (window as any).navbar = navbar;
    (window as any).debugHousing3D = debugHousing3D;
  }, 500);
});

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    map.remove();
  });
}

