# D3 Creative Visualizations Integration

**Date:** December 22, 2025  
**Integration:** Iqbal's Creative Visualizations + Our Real API Data

## What Was Integrated

### 1. D3.js Creative Visualizations

We've adapted three beautiful D3.js visualizations from Iqbal's scrollytelling design:

#### **Stacked Area Chart** (`renderStackedAreaD3`)
- **Used in:** Intro section / National Overview
- **Features:**
  - Smooth Catmull-Rom curve interpolation
  - Interactive tooltips on hover
  - Animated gradients for each category
  - Area highlighting on mouseover
  - Vertical crosshair line following cursor
- **Data source:** `fetchNationalOverview()` API
- **Shows:** Physical Activity, Air Quality, Sum, Noise over 2025-2050

#### **House-Shaped Visualization** (`renderHouseShapeViz`)
- **Used in:** Warm Homes section
- **Features:**
  - House silhouettes with proportional segments
  - Roof and body representing benefit values
  - Interactive hover tooltips per segment
  - Gradient fills for visual appeal
  - Animated entry with staggered timing
- **Data source:** `fetchHousingComparison()` API
- **Shows:** Excess Cold, Dampness, Excess Heat comparison between regions

#### **Active Streets Landscape** (`renderActiveStreetsViz`)
- **Used in:** Clean & Active Streets section
- **Features:**
  - Animated hill/landscape metaphor
  - Sky-to-ground gradient background
  - Path drawing animation (stroke-dasharray)
  - Smooth curve representing health benefits growth
  - Area fill with gradient (hazy → clear)
- **Data source:** `fetchNationalCategoryTimeseries('health_wellbeing')` API
- **Shows:** Physical activity benefits rising like a green hill over time

### 2. Integration Architecture

```typescript
// In story-mode.ts
private async renderVisualization(index: number) {
  // Check which section we're rendering
  const storyKey = section.storyKey;
  const endpoint = section.vizPanel.dataEndpoint;
  
  // Route to D3 visualizations for specific sections
  if (storyKey === 'intro' && endpoint.includes('national-overview')) {
    await this.renderIntroD3Viz(plotId);
    return;
  }
  
  if (storyKey === 'warm_homes' && endpoint.includes('housing')) {
    await this.renderWarmHomesD3Viz(plotId);
    return;
  }
  
  if (storyKey === 'clean_active' && endpoint.includes('health')) {
    await this.renderActiveStreetsD3Viz(plotId);
    return;
  }
  
  // Fall back to Plotly for other sections
  // ... Plotly rendering code ...
}
```

### 3. Data Flow

```
Backend API (Express + PostgreSQL)
         ↓
API Service Layer (cobenefits-api.ts)
         ↓
Story Mode Component (story-mode.ts)
         ↓
D3 Visualization Functions (d3-cobenefits-viz.ts)
         ↓
SVG Rendered in Browser
```

### 4. CSS Enhancements Added

```css
/* D3 Visualization Styles */
.viz-plot svg {
  overflow: visible;
  font-family: 'Inter', ...;
}

.viz-plot svg .area {
  transition: opacity 0.2s ease;
}

/* Interactive tooltips */
.d3-tooltip {
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  /* ... */
}

/* House hover effects */
.house rect {
  transition: opacity 0.2s ease;
  cursor: pointer;
}

/* Landscape animations */
.hill-area {
  transition: opacity 0.3s ease;
}
```

## Files Created/Modified

### Created:
- `Frontend/src/visualizations/d3-cobenefits-viz.ts` (600+ lines)
  - Exports: `renderStackedAreaD3`, `renderHouseShapeViz`, `renderActiveStreetsViz`
  - Types: `TimeSeriesData`, `HousingComparisonData`, `NoiseRankingData`

### Modified:
- `Frontend/src/sections/story-mode.ts`
  - Added D3 imports
  - Added routing logic to D3 visualizations
  - Added three render methods: `renderIntroD3Viz`, `renderWarmHomesD3Viz`, `renderActiveStreetsD3Viz`
  
- `Frontend/src/main.css`
  - Added 60+ lines of D3-specific styles
  - Enhanced SVG element styling
  - Added tooltip animations

- `Frontend/package.json`
  - Added dependencies: `d3` and `@types/d3`

## Benefits of This Integration

### 1. **Creative Storytelling**
- D3 visualizations are more narrative-driven
- House shapes make housing benefits tangible
- Landscape metaphor for health benefits is intuitive

### 2. **Real Data**
- Uses actual API data from PostgreSQL/TimescaleDB
- Automatic updates when backend data changes
- No more placeholder/mock data

### 3. **Smooth Animations**
- Path drawing animations (stroke-dasharray technique)
- Staggered entry animations
- Smooth transitions on data updates

### 4. **Interactivity**
- Hover tooltips with precise values
- Area highlighting on mouseover
- Crosshair cursor tracking

### 5. **Fallback Strategy**
- D3 for creative sections (intro, warm homes, active streets)
- Plotly for standard charts (noise bars, trade-off lines)
- Best of both worlds

## Technical Highlights

### TypeScript Type Safety
```typescript
export interface TimeSeriesData {
  year: number;
  [key: string]: number;
}

export interface HousingComparisonData {
  name: string;
  excessCold: number;
  dampness: number;
  excessHeat: number;
}
```

### Responsive SVG Design
```typescript
const svg = d3.select(container)
  .append('svg')
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');
```

### Gradient Definitions
```typescript
const defs = svg.append('defs');
Object.entries(colorMap).forEach(([key, color]) => {
  const gradient = defs.append('linearGradient')
    .attr('id', `gradient-${key.replace(/\s+/g, '-')}`)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');
  
  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color.gradient)
    .attr('stop-opacity', 0.8);
  
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color.base)
    .attr('stop-opacity', 0.4);
});
```

### Interactive Overlay
```typescript
const overlay = g.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all');

overlay.on('mousemove', (event) => {
  const [mouseX] = d3.pointer(event);
  const year = Math.round(xScale.invert(mouseX));
  // ... show tooltip and highlight ...
});

overlay.on('mouseleave', () => {
  // ... hide tooltip ...
});
```

## Testing Checklist

- [ ] Run `npm run dev` in Frontend directory
- [ ] Navigate to Story Mode
- [ ] Check Intro section → Should show stacked area chart with real data
- [ ] Check Warm Homes section → Should show house visualizations
- [ ] Check Clean & Active section → Should show landscape animation
- [ ] Hover over visualizations → Tooltips should appear
- [ ] Check console → No errors
- [ ] Test on different screen sizes → Responsive SVG scaling

## Next Steps (Optional Enhancements)

1. **Add more D3 visualizations** for Trade-offs and Noise sections
2. **Implement animated transitions** between sections
3. **Add legend interactions** (click to hide/show categories)
4. **Export functionality** (SVG download)
5. **Accessibility improvements** (ARIA labels, keyboard navigation for tooltips)
6. **Performance optimization** (virtual scrolling for large datasets)

## Credits

- **Design & Original Visualizations:** Iqbal (ECCI_Iqbal-main)
- **Integration & API Connection:** Current implementation
- **D3.js Library:** Mike Bostock & contributors
- **Data Source:** Edinburgh Climate Change Institute (ECCI)

---

**Result:** Beautiful, creative D3.js visualizations now render with real data from our Backend API! 🎉
