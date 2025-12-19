import type { StyleSpecification } from 'maplibre-gl';
import { PM } from './pmtiles-setup';
import { PMTILES_FILES, LAYERS_CONFIG } from './config';

// Use maxzoom 14 for all modes - story mode just won't zoom beyond 5
export function createMapStyle(): StyleSpecification {
  return {
    version: 8,
    // Dark mode configuration
    // No glyphs URL - use built-in rendering to avoid external font loading
    transition: {
      duration: 500,
      delay: 0,
    },
    sources: {
      nations: {
        type: 'vector',
        url: PM(PMTILES_FILES.nations),
        minzoom: 0,
        maxzoom: 5, // Nations tiles only available up to zoom 5 - will overzoom beyond this
      },
      'nation-labels': {
        type: 'vector',
        url: PM(PMTILES_FILES.nationLabels),
        minzoom: 0,
        maxzoom: 5,
      },
      las: {
        type: 'vector',
        url: PM(PMTILES_FILES.localAuthorities),
        minzoom: 0,
        maxzoom: 7, // Local authorities tiles start at zoom 7, available up to 7
      },
      'la-labels': {
        type: 'vector',
        url: PM(PMTILES_FILES.localAuthoritiesLabels),
        minzoom: 0,
        maxzoom: 7,
      },
      sa: {
        type: 'vector',
        url: PM(PMTILES_FILES.smallAreas),
        minzoom: 5,
        maxzoom: 5, // Lock to zoom 4 tiles - MapLibre will scale them at all zoom levels
      },
    },
    layers: [
      // Transparent background - nebula shows through from CSS
      {
        id: 'skybox',
        type: 'background',
        paint: {
          'background-color': 'rgba(0, 0, 0, 0)', // Fully transparent
        },
      },
      // Nations (zoom 0+, can overzoom)
      {
        id: 'nations-fill',
        type: 'fill',
        source: 'nations',
        'source-layer': 'nation',
        minzoom: 0,
        // No maxzoom - allow overzoom at higher levels
        paint: {
          'fill-color': LAYERS_CONFIG.nations.fillColor,
          'fill-opacity': LAYERS_CONFIG.nations.fillOpacity,
        },
      },
      {
        id: 'nations-outline',
        type: 'line',
        source: 'nations',
        'source-layer': 'nation',
        minzoom: 0,
        // No maxzoom - allow overzoom at higher levels
        paint: {
          'line-color': LAYERS_CONFIG.nations.lineColor,
          'line-width': LAYERS_CONFIG.nations.lineWidth,
        },
      },
      // Local Authorities (zoom 0+ for manual LOD, tiles start at 7)
      {
        id: 'las-fill',
        type: 'fill',
        source: 'las',
        'source-layer': 'local_authorities',
        minzoom: 0,
        // No maxzoom - allow overzoom at higher levels
        paint: {
          'fill-color': LAYERS_CONFIG.localAuthorities.fillColor,
          // Fade in from zoom 6.5 to 7.5 for smooth transition
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6.5, 0,
            7.5, LAYERS_CONFIG.localAuthorities.fillOpacity
          ],
        },
      },
      {
        id: 'las-outline',
        type: 'line',
        source: 'las',
        'source-layer': 'local_authorities',
        minzoom: 0,
        paint: {
          'line-color': LAYERS_CONFIG.localAuthorities.lineColor,
          'line-width': LAYERS_CONFIG.localAuthorities.lineWidth,
          // Fade in from zoom 6.5 to 7.5 for smooth transition
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6.5, 0,
            7.5, 1
          ],
        },
      },
      // Small Areas (zoom 0+ for manual LOD, tiles start at 10)
      {
        id: 'sa-fill',
        type: 'fill',
        source: 'sa',
        'source-layer': 'small_areas',
        minzoom: 0,
        paint: {
          'fill-color': LAYERS_CONFIG.smallAreas.fillColor,
          // Fade in from zoom 9.5 to 10.5 for smooth transition
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9.5, 0,
            10.5, LAYERS_CONFIG.smallAreas.fillOpacity
          ],
        },
      },
      {
        id: 'sa-outline',
        type: 'line',
        source: 'sa',
        'source-layer': 'small_areas',
        minzoom: 0,
        paint: {
          'line-color': LAYERS_CONFIG.smallAreas.lineColor,
          'line-width': LAYERS_CONFIG.smallAreas.lineWidth,
          // Fade in from zoom 9.5 to 10.5 for smooth transition
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9.5, 0,
            10.5, 1
          ],
        },
      },
    ],
  };
}
