# Camera Recorder for Story Scrolling

## Overview
The Camera Recorder control allows you to record camera positions (center, zoom, pitch, bearing/yaw) for creating story scrolling experiences.

## Usage

1. **Navigate the Map**: Use mouse/touch to pan, zoom, rotate, and tilt the map to your desired view
   - Pan: Click and drag
   - Zoom: Scroll wheel or pinch
   - Rotate (Yaw): Right-click and drag, or Ctrl+Click and drag
   - Tilt (Pitch): Right-click and drag up/down, or Ctrl+Click and drag

2. **Record Position**: Click "📷 Record Position" to capture the current camera state

3. **Export JSON**: Click "💾 Export JSON" to download all recorded positions

4. **Clear**: Click "🗑️ Clear" to remove all recorded positions

## Exported JSON Format

```json
[
  {
    "center": [-3.5, 55.2],
    "zoom": 8.5,
    "pitch": 45,
    "bearing": 30,
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  {
    "center": [-4.2, 56.1],
    "zoom": 12,
    "pitch": 60,
    "bearing": -15,
    "timestamp": "2025-11-12T10:31:00.000Z"
  }
]
```

## Field Descriptions

- **center**: `[longitude, latitude]` - Map center coordinates in WGS84
- **zoom**: Number - Zoom level (0-24, higher = more zoomed in)
- **pitch**: Number - Tilt angle in degrees (0-85, where 0 = looking straight down, 85 = almost horizontal)
- **bearing**: Number - Rotation angle in degrees (-180 to 180, where 0 = north, 90 = east, 180/-180 = south, -90 = west)
- **timestamp**: String - ISO 8601 timestamp of when position was recorded

## Story Scrolling Implementation Example

```typescript
import type { Map as MapLibreMap } from 'maplibre-gl';

interface CameraPosition {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  timestamp: string;
}

// Load your recorded positions
const storyPositions: CameraPosition[] = [
  // ... paste your exported JSON here
];

function setupStoryScrolling(map: MapLibreMap) {
  let currentStep = 0;

  window.addEventListener('scroll', () => {
    // Calculate scroll progress (0 to 1)
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Map to story step
    const step = Math.floor(scrollProgress * storyPositions.length);
    
    if (step !== currentStep && step < storyPositions.length) {
      currentStep = step;
      const position = storyPositions[step];
      
      // Animate to new position
      map.flyTo({
        center: position.center,
        zoom: position.zoom,
        pitch: position.pitch,
        bearing: position.bearing,
        duration: 2000, // 2 second animation
        essential: true
      });
    }
  });
}

// Or use with scroll-based libraries like ScrollMagic, GSAP ScrollTrigger, etc.
```

## Map Configuration Changes

The following limits have been removed/expanded for cinematic views:

- **minZoom**: 0 (was 4) - Can zoom out to see whole world
- **maxZoom**: 24 (was 15) - Can zoom in very close
- **maxPitch**: 85° - Can tilt almost horizontal for dramatic angles
- **bearingSnap**: Disabled - Smooth rotation without snapping to north

## Tips for Story Scrolling

1. **Plan Your Story**: Sketch out key locations and views before recording
2. **Smooth Transitions**: Record positions that create logical visual flow
3. **Vary Perspectives**: Mix zoom levels and pitch angles for visual interest
4. **Test Timing**: Adjust scroll speed and animation duration for best effect
5. **Use Pitch Creatively**: Higher pitch angles create cinematic, immersive views
6. **Consider Bearing**: Rotate to show different sides of features

## Example Use Cases

- **Geographic Tours**: Show journey from country → region → city → building
- **Data Storytelling**: Zoom to specific areas while narrating statistics
- **Historical Narratives**: Pan across regions while describing events
- **Environmental Changes**: Show before/after at specific locations
- **Urban Development**: Navigate through city highlighting key projects
