import type { Map as MapLibreMap } from 'maplibre-gl';

export function setupLabels(map: MapLibreMap) {
  map.on('load', () => {
    // Load LA labels from GeoJSON for consistent rendering
    fetch('/data/local_authorities_wgs84_labels.geojson')
      .then(response => response.json())
      .then(data => {
        map.addSource('la-labels-geojson', {
          type: 'geojson',
          data: data,
        });

        map.addLayer({
          id: 'las-labels',
          type: 'symbol',
          source: 'la-labels-geojson',
          minzoom: 0, // Allow labels at all zoom levels for manual mode
          layout: {
            'text-field': ['get', 'LabelText'],
            // No text-font - uses built-in rendering
            'text-size': 12,
            'text-anchor': 'center',
            'text-max-width': 10,
          },
          paint: {
            'text-color': '#34d399', // Bright green for dark mode
            'text-halo-color': '#0f172a', // Dark slate halo
            'text-halo-width': 1.5,
            // Fade in from zoom 6.5 to 7.5 for automatic mode
            'text-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6.5, 0,
              7.5, 1
            ],
          },
        });
      })
      .catch(err => console.error('Failed to load LA labels:', err));

    // Add a fallback GeoJSON source for missing labels at low zoom
    map.addSource('nation-labels-fallback', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-2.28, 52.42], // Eng/Wales position from your data
            },
            properties: {
              LabelText: 'Eng/Wales',
            },
          },
        ],
      },
    });

    // Fallback labels for low zoom (0-5)
    map.addLayer({
      id: 'nations-labels-fallback',
      type: 'symbol',
      source: 'nation-labels-fallback',
      minzoom: 0,
      maxzoom: 6, // Only show at low zoom where PMTiles is missing data
      layout: {
        'text-field': ['get', 'LabelText'],
        // No text-font - uses built-in rendering
        'text-size': 16,
        'text-anchor': 'center',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'text-optional': false,
      },
      paint: {
        'text-color': '#60a5fa', // Bright blue for dark mode
        'text-halo-color': '#0f172a', // Dark slate halo
        'text-halo-width': 2,
        'text-opacity': 1,
      },
    });

    // Add labels for nations - show at all zoom levels
    map.addLayer({
      id: 'nations-labels',
      type: 'symbol',
      source: 'nation-labels',
      'source-layer': 'nation_labels',
      minzoom: 0,
      // No maxzoom - show at all levels
      layout: {
        'text-field': ['get', 'LabelText'],
        // No text-font - uses built-in rendering
        'text-size': 16,
        'text-anchor': 'center',
        'text-allow-overlap': true, // Allow labels to overlap other features
        'text-ignore-placement': true, // Don't hide due to collision
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'text-optional': false,
      },
      paint: {
        'text-color': '#60a5fa', // Bright blue for dark mode
        'text-halo-color': '#0f172a', // Dark slate halo
        'text-halo-width': 2,
        'text-opacity': 1,
      },
    });

    // Debug: Log feature properties when clicking to verify the source-layer name
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        console.log('Clicked feature properties:', features[0].properties);
        console.log('Source:', features[0].source);
        console.log('Source layer:', features[0].sourceLayer);
      }
    });
    
  });
}
