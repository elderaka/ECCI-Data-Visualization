import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Add nebula skybox background using CSS
 * This creates a floating effect where the map appears in space
 */
export function addNebulaSkybox(map: MapLibreMap): void {
  
  
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found!');
    return;
  }

  // Create nebula background element behind the map
  const skybox = document.createElement('div');
  skybox.id = 'nebula-skybox';
  skybox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url('/blue_nebulae_1.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -2;
    pointer-events: none;
  `;
  
  
  // Add immediately to body (before everything)
  if (document.body.firstChild) {
    document.body.insertBefore(skybox, document.body.firstChild);
  } else {
    document.body.appendChild(skybox);
  }
  
  
  // Make map background transparent so nebula shows through
  map.on('load', () => {
    // Remove the background layer to show nebula behind
    if (map.getLayer('skybox')) {
      map.removeLayer('skybox');
    }
    
  });
}

