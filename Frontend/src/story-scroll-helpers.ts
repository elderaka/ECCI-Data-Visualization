import type { Map as MapLibreMap } from 'maplibre-gl';
import type { CameraPosition } from './camera-recorder';

export interface StoryScrollOptions {
  duration?: number; // Animation duration in ms (default: 2000)
  essential?: boolean; // Whether animation is essential (default: true)
  easing?: (t: number) => number; // Easing function
}

/**
 * Animate map to a specific camera position
 */
export function flyToPosition(
  map: MapLibreMap, 
  position: CameraPosition, 
  options: StoryScrollOptions = {}
): void {
  const {
    duration = 2000,
    essential = true,
    easing,
  } = options;

  map.flyTo({
    center: position.center,
    zoom: position.zoom,
    pitch: position.pitch,
    bearing: position.bearing,
    duration,
    essential,
    ...(easing && { easing }),
  });
}

/**
 * Jump to position instantly (no animation)
 */
export function jumpToPosition(map: MapLibreMap, position: CameraPosition): void {
  map.jumpTo({
    center: position.center,
    zoom: position.zoom,
    pitch: position.pitch,
    bearing: position.bearing,
  });
}

/**
 * Ease to position (smooth but faster than fly)
 */
export function easeToPosition(
  map: MapLibreMap, 
  position: CameraPosition,
  duration: number = 1000
): void {
  map.easeTo({
    center: position.center,
    zoom: position.zoom,
    pitch: position.pitch,
    bearing: position.bearing,
    duration,
  });
}

/**
 * Setup scroll-based story navigation
 * Returns cleanup function
 */
export function setupScrollStory(
  map: MapLibreMap,
  positions: CameraPosition[],
  options: StoryScrollOptions = {}
): () => void {
  let currentStep = -1;
  let isAnimating = false;

  const handleScroll = () => {
    if (isAnimating) return;

    // Calculate scroll progress (0 to 1)
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Map to story step
    const step = Math.min(
      Math.floor(scrollProgress * positions.length),
      positions.length - 1
    );

    if (step !== currentStep && step >= 0) {
      currentStep = step;
      const position = positions[step];
      
      isAnimating = true;
      flyToPosition(map, position, options);
      
      // Reset animation flag after duration
      setTimeout(() => {
        isAnimating = false;
      }, options.duration || 2000);
    }
  };

  // Attach listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Setup keyboard navigation through story positions
 * Returns cleanup function
 */
export function setupKeyboardStory(
  map: MapLibreMap,
  positions: CameraPosition[],
  options: StoryScrollOptions = {}
): () => void {
  let currentStep = 0;

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      // Next position
      currentStep = Math.min(currentStep + 1, positions.length - 1);
      flyToPosition(map, positions[currentStep], options);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      // Previous position
      currentStep = Math.max(currentStep - 1, 0);
      flyToPosition(map, positions[currentStep], options);
    } else if (e.key === 'Home') {
      // First position
      currentStep = 0;
      flyToPosition(map, positions[currentStep], options);
    } else if (e.key === 'End') {
      // Last position
      currentStep = positions.length - 1;
      flyToPosition(map, positions[currentStep], options);
    }
  };

  // Attach listener
  window.addEventListener('keydown', handleKeyPress);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}

/**
 * Create a timed slideshow that cycles through positions
 * Returns cleanup function
 */
export function createSlideshow(
  map: MapLibreMap,
  positions: CameraPosition[],
  intervalMs: number = 5000,
  options: StoryScrollOptions = {}
): () => void {
  let currentStep = 0;
  
  // Start with first position
  if (positions.length > 0) {
    jumpToPosition(map, positions[0]);
  }

  const interval = setInterval(() => {
    currentStep = (currentStep + 1) % positions.length;
    flyToPosition(map, positions[currentStep], options);
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
}

/**
 * Load positions from JSON file
 */
export async function loadPositionsFromJSON(url: string): Promise<CameraPosition[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load positions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Validate camera position has all required fields
 */
export function isValidCameraPosition(obj: any): obj is CameraPosition {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.center) &&
    obj.center.length === 2 &&
    typeof obj.center[0] === 'number' &&
    typeof obj.center[1] === 'number' &&
    typeof obj.zoom === 'number' &&
    typeof obj.pitch === 'number' &&
    typeof obj.bearing === 'number'
  );
}
