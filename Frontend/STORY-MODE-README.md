# Story Scrolling Mode 📖

## Overview

The ECCI website now features **two modes**:

1. **Story Mode** (default) - Guided narrative with scroll-based camera animations
2. **Free Mode** - Full interactive map exploration

## Features

### Story Mode
- **4 Sections** - Each 100vh with unique camera positions
- **Scroll-based Navigation** - Map animates as you scroll through sections
- **Disabled Interactions** - Map is view-only during story
- **Smooth Transitions** - 2-second camera animations between sections

### Free Mode
- **Full Map Control** - Pan, zoom, rotate, tilt freely
- **All Features Enabled** - Heatmaps, region clicks, LOD control, etc.
- **Return to Story** - Button to go back to story mode

## Section Configuration

Located in `src/sections/section-config.ts`:

### Section 1 - "Welcome to ECCI Data Story"
- **Position**: Center text
- **Camera**: Zoom 7, Pitch 60° (drone shot)
- **Map**: Center, 100% opacity

### Section 2 - "A Broader View"
- **Position**: Left text
- **Camera**: Zoom 4.5, Flat view
- **Map**: Shifted to right (75% width), 100% opacity

### Section 3 - "The Data Speaks"
- **Position**: Center text
- **Camera**: Zoom 5, Flat view
- **Map**: Center, 50% opacity (darkened overlay)

### Section 4 - "Explore Freely"
- **Position**: Center text with button
- **Camera**: Zoom 5, Flat view
- **Map**: Center, 50% opacity
- **Button**: "Switch to Free Mode"

## Camera Positions

Each section has a complete camera configuration:
```typescript
{
  center: [lng, lat],    // Map center coordinates
  zoom: number,          // Zoom level (0-24)
  pitch: number,         // Tilt angle (0-85°)
  bearing: number,       // Rotation angle (-180 to 180)
  timestamp: string      // ISO timestamp
}
```

## Map Positioning

- **Center** (default): Map at normal position
- **Right**: Map shifted 25% to the right (text on left)

## Map Opacity Control

A dark overlay (`#map-overlay`) is dynamically adjusted:
- `opacity: 0` = Full brightness (100% map opacity)
- `opacity: 0.5` = 50% darkened (50% map opacity)

## Technical Implementation

### Files Created

1. **`src/sections/section-config.ts`** - Section definitions and camera positions
2. **`src/sections/story-mode.ts`** - Story mode controller class
3. **`index.html`** - Updated with scroll container and styling

### Files Modified

1. **`src/main.ts`** - Initializes StoryMode after map loads
2. **`index.html`** - Added story scrolling UI and styles

### Key Classes

#### `StoryMode`
Main controller class that manages:
- Section creation and rendering
- Scroll event handling
- Camera animation triggering
- Mode switching (story ↔ free)
- Map position and opacity control

#### Methods
- `setMode(mode)` - Switch between 'story' and 'free' modes
- `goToSection(index)` - Animate to specific section
- `getMode()` - Get current mode
- `getCurrentSection()` - Get current section index

## Scroll Behavior

The scroll progress is calculated as:
```typescript
const scrollProgress = scrollTop / scrollHeight;
const sectionIndex = Math.floor(scrollProgress * totalSections * 1.2);
```

The `1.2` multiplier makes section transitions happen slightly faster for better UX.

## Mode Transitions

### Story → Free
1. Hide scroll container
2. Enable all map interactions
3. Reset map to center position
4. Remove opacity overlay
5. Show "Free Mode Activated" notification

### Free → Story
1. Show scroll container
2. Disable all map interactions
3. Scroll to top (reset to section 1)
4. Animate to first section's camera position
5. Hide notification

## Preloading Strategy

On page load:
- Zoom levels 4-7 are prioritized
- Nations and regions PMTiles loaded first
- Story mode initializes after map fully loads

## Customization

### Adding New Sections

Edit `src/sections/section-config.ts`:

```typescript
{
  id: 5,
  title: 'Your Title',
  content: 'Your content...',
  textPosition: 'center', // or 'left', 'right'
  cameraPosition: {
    center: [-3, 55],
    zoom: 6,
    pitch: 30,
    bearing: 45,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 1, // 0 to 1
  mapPosition: 'center', // or 'right'
}
```

### Adjusting Animation Speed

In `story-mode.ts`, change the duration:
```typescript
flyToPosition(this.map, section.cameraPosition, {
  duration: 2000, // milliseconds
});
```

### Changing Map Position Offset

In `story-mode.ts`:
```typescript
this.mapContainer.style.transform = 'translateX(25%)'; // Adjust percentage
```

## Debugging

Story mode instance is available globally:
```javascript
window.storyMode.getMode() // 'story' or 'free'
window.storyMode.getCurrentSection() // 0, 1, 2, or 3
window.storyMode.setMode('free') // Switch programmatically
```

## Browser Compatibility

- Modern browsers with CSS transforms
- Smooth scroll support
- MapLibre GL JS requirements apply
- Touch devices supported

## Performance

- GPU-accelerated CSS transforms
- Efficient scroll event handling with animation flags
- No unnecessary re-renders during animations
- Smooth 60fps transitions

## Future Enhancements

- [ ] Add scroll snap for better section alignment
- [ ] Keyboard navigation (arrow keys)
- [ ] Progress indicator showing current section
- [ ] Auto-play mode (timed progression)
- [ ] Section thumbnails/navigation menu
- [ ] Data annotations appearing on scroll
- [ ] Video/image media support in sections
- [ ] Multi-language support
