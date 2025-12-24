# ECCI - MapLibre + PMTiles Interactive Map

A high-performance web map application using MapLibre GL JS with PMTiles vector tiles for displaying hierarchical geographic data (Nations, Local Authorities, Small Areas) with on-demand tile loading.

## 🏗️ Project Structure

```
ECCI/
├── Frontend/                    # Vite + TypeScript frontend application
│   ├── src/
│   │   ├── main.ts             # Application entry point
│   │   ├── config.ts           # Centralized configuration (URLs, layer styles)
│   │   ├── map-style.ts        # MapLibre style specification with dark mode
│   │   ├── map-events.ts       # Event handlers (zoom, pan, loading)
│   │   ├── pmtiles-setup.ts    # PMTiles protocol registration
│   │   ├── lod-control.ts      # Level of Detail control (manual/automatic)
│   │   ├── compass-control.ts  # Reset compass control
│   │   ├── loading-screen.ts   # Loading screen with progress
│   │   ├── labels.ts           # Label layer configuration (GeoJSON + PMTiles)
│   │   └── region-click.ts     # Click-to-fly region navigation
│   ├── public/
│   │   ├── tiles/              # Local PMTiles (nations only)
│   │   └── data/               # GeoJSON files (LA labels)
│   ├── index.html              # Main HTML with dark mode styles
│   ├── package.json            # Frontend dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── Backend/                     # Express.js tile server
│   ├── server.js               # HTTP server with Range request support
│   ├── tiles/                  # PMTiles served on-demand
│   │   ├── local_authorities_wgs84.pmtiles
│   │   ├── small_areas_wgs84.pmtiles
│   │   └── local_authorities_wgs84_labels.pmtiles
│   └── package.json            # Backend dependencies
│
├── PMTiles/                     # Source data and processing files
│   ├── *.geojson               # Source GeoJSON files
│   ├── *.gpkg                  # GeoPackage databases
│   ├── *.pmtiles               # Generated PMTiles archives
│   └── *.qmd                   # Quarto processing scripts
│
└── tippecanoe-2.79.0/          # PMTiles generation tool
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vite 6.0.1 (development server + build tool)
- **Language**: TypeScript 5.6.2
- **Mapping**: MapLibre GL JS 5.11.0
- **Tiles**: PMTiles 4.3.0 (vector tile protocol)
- **Styling**: Tailwind CSS (CDN)

### Backend
- **Server**: Express.js (Node.js HTTP server)
- **Features**: CORS, Range request support for efficient tile streaming

### Data Processing
- **Tool**: Tippecanoe 2.79.0 (GeoJSON → PMTiles conversion)
- **Formats**: GeoJSON, GeoPackage (.gpkg), PMTiles

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

#### Frontend
```powershell
cd Frontend
npm install
npm run dev
```
Frontend runs on: **http://localhost:5173**

#### Backend
```powershell
cd Backend
npm install
node server.js
```
Backend runs on: **http://localhost:3000**

### Running Both
Open two terminals:
1. Terminal 1: `cd Frontend; npm run dev`
2. Terminal 2: `cd Backend; node server.js`

## 📦 Key Dependencies

### Frontend (`Frontend/package.json`)
```json
{
  "maplibre-gl": "^5.11.0",      // Map rendering engine
  "pmtiles": "^4.3.0",           // PMTiles protocol handler
  "vite": "^6.0.1",              // Dev server & bundler
  "typescript": "~5.6.2"         // Type safety
}
```

### Backend (`Backend/package.json`)
```json
{
  "express": "^4.21.1",          // HTTP server
  "pmtiles": "^4.3.0"            // PMTiles library
}
```

## 🎨 Features

### 1. **Dark Mode Theme**
- Dark slate background (#0f172a)
- Color-coded layers:
  - Nations: Blue (#1e40af / #3b82f6)
  - Local Authorities: Green (#047857 / #10b981)
  - Small Areas: Amber (#b45309 / #f59e0b)
- Bright labels with dark halos

### 2. **Level of Detail (LOD) Control**
Two modes accessible via top-right panel:

**Automatic Mode** (default):
- Nations: Always visible (zoom 0-24)
- Local Authorities: Fade in at zoom 6.5-7.5
- Small Areas: Fade in at zoom 9.5-10.5
- Smooth opacity interpolation during zoom

**Manual Mode**:
- Toggle to enable manual selection
- Three buttons: 🌍 Nations | 🗺️ Regions | 📍 Areas
- Selected layers visible at any zoom level (0-24)
- Smooth 500ms fade transitions between selections

### 3. **Smooth Transitions**
- **Global transition**: 500ms duration for all property changes
- **Zoom-based fades**: Interpolation expressions for opacity
- **Click navigation**: 1.5s smooth fly to clicked region

### 4. **Click-to-Fly Navigation**
- Click any region → map flies to fit that region
- Pointer cursor on hover
- 80px padding for optimal framing
- Handles Polygon and MultiPolygon geometries

### 5. **Loading Screen**
- Progress bar (0-100%)
- Cycling subtitles with random messages
- Fades out when tiles load

### 6. **Compass Control**
- Bottom-right reset button
- Returns to initial view (center + zoom 6)
- Smooth 1.5s transition

### 7. **Pan Restrictions**
- Horizontal movement locked
- Vertical centering on zoom change

### 8. **Labels**
- **Nation labels**: PMTiles with fallback GeoJSON
- **LA labels**: GeoJSON (391 features) for consistent rendering
- Bright colors (#60a5fa blue, #34d399 green) on dark background
- Zoom-responsive in automatic mode, always-on in manual mode

## 🗂️ Data Architecture

### Local vs Backend Loading

**Local (Frontend/public/tiles/)**:
- `nation_wgs84.pmtiles` (~3MB)
- `nation_wgs84_labels.pmtiles`
- Always loaded immediately

**Backend (Backend/tiles/)**:
- `local_authorities_wgs84.pmtiles` (2.3MB)
- `small_areas_wgs84.pmtiles` (91MB)
- `local_authorities_wgs84_labels.pmtiles`
- Loaded on-demand via Range requests

### PMTiles URL Format
```typescript
// Local files
url: PM(PMTILES_FILES.nations)
// → "pmtiles://nation_wgs84.pmtiles"

// Backend files
url: `pmtiles://${TILE_SERVER_URL}/${PMTILES_FILES.localAuthorities}`
// → "pmtiles://http://localhost:3000/tiles/local_authorities_wgs84.pmtiles"
```

## 🔧 Development Workflow

### Creating New PMTiles

1. **Prepare GeoJSON** (in `PMTiles/` folder)
   ```powershell
   # Example: Simplify geometry
   ogr2ogr -f GeoJSON output.geojson input.gpkg -simplify 100
   ```

2. **Generate PMTiles with Tippecanoe**
   ```powershell
   cd tippecanoe-2.79.0
   
   # Full zoom range for manual LOD support
   ./tippecanoe -o output.pmtiles `
     --minimum-zoom=0 `
     --maximum-zoom=15 `
     --drop-densest-as-needed `
     --extend-zooms-if-still-dropping `
     input.geojson
   ```

3. **Copy to Backend** (if on-demand)
   ```powershell
   copy PMTiles/output.pmtiles Backend/tiles/
   ```

4. **Update Configuration**
   - Add to `Frontend/src/config.ts` → `PMTILES_FILES`
   - Add layers to `Frontend/src/map-style.ts`
   - Add to LOD control if needed

### Adding New Layers

1. **Define in `config.ts`**:
   ```typescript
   export const LAYERS_CONFIG = {
     newLayer: {
       minzoom: 0,
       maxzoom: 10,
       fillColor: '#1e40af',
       fillOpacity: 0.5,
       lineColor: '#3b82f6',
       lineWidth: 2,
     },
   };
   ```

2. **Add to `map-style.ts`**:
   ```typescript
   {
     id: 'new-layer-fill',
     type: 'fill',
     source: 'new-source',
     'source-layer': 'layer_name',
     minzoom: 0,
     paint: {
       'fill-color': LAYERS_CONFIG.newLayer.fillColor,
       'fill-opacity': [
         'interpolate',
         ['linear'],
         ['zoom'],
         9.5, 0,
         10.5, LAYERS_CONFIG.newLayer.fillOpacity
       ],
     },
   }
   ```

3. **Add to LOD Control** (if needed):
   - Update `lod-control.ts` → `createButtons()`
   - Add opacity controls in `updateLayerVisibility()`

## 🎯 Key Concepts

### Opacity vs Visibility
- **visibility: 'none'** → No transition, instant hide ❌
- **opacity: 0** → Smooth 500ms fade ✅
- Always use opacity for transitions!

### Zoom Interpolation
```typescript
'fill-opacity': [
  'interpolate',        // Smooth gradient
  ['linear'],           // Linear interpolation
  ['zoom'],             // Based on zoom level
  6.5, 0,              // At zoom 6.5, opacity = 0
  7.5, 0.5             // At zoom 7.5, opacity = 0.5
]
```

### Range Requests
Backend supports HTTP Range headers:
```
GET /tiles/file.pmtiles
Range: bytes=0-16383

Response: 206 Partial Content
Content-Range: bytes 0-16383/2370660
```
Only requested tiles downloaded, not entire file!

## 🐛 Troubleshooting

### Tiles Not Loading
1. Check backend is running: `http://localhost:3000/tiles/file.pmtiles`
2. Check browser console for 404 errors
3. Verify pmtiles:// URL format in `map-style.ts`
4. Check CORS is enabled in backend

### Labels Not Showing
1. Check font exists: `Open Sans Regular` (not Bold/Semibold)
2. Verify GeoJSON in `Frontend/public/data/`
3. Check zoom level (automatic mode has zoom gates)
4. Check opacity (not 0)

### No Fade Transitions
1. Check global transition config in `map-style.ts`
2. Use opacity, not visibility
3. Use interpolation expressions for zoom-based fades
4. Don't override with `setPaintProperty` in automatic mode

### Manual LOD Not Working at Low Zoom
1. PMTiles must have tiles at zoom 0 (`--minimum-zoom=0`)
2. Check `setLayerZoomRange(0, 24)` is called
3. Verify opacity is set to 1, not interpolation expression

## 📝 Configuration Reference

### `Frontend/src/config.ts`
```typescript
MAP_CONFIG           // Initial map settings (center, zoom)
TILE_SERVER_URL      // Backend URL (dev: localhost:3000, prod: /tiles)
PMTILES_FILES        // Filenames for all PMTiles
LAYERS_CONFIG        // Visual styling (colors, opacity, line width)
```

### Environment Detection
```typescript
const isDevelopment = !import.meta.env.PROD;
const TILE_SERVER_URL = isDevelopment 
  ? 'http://localhost:3000/tiles' 
  : '/tiles';
```

## 🚢 Production Build

### Frontend
```powershell
cd Frontend
npm run build
# Output: Frontend/dist/
```

### Deployment
1. Build frontend: `npm run build`
2. Deploy `Frontend/dist/` to static hosting
3. Deploy backend or serve PMTiles from CDN
4. Update `TILE_SERVER_URL` in production

## 📚 Resources

- **MapLibre**: https://maplibre.org/maplibre-gl-js/docs/
- **PMTiles**: https://docs.protomaps.com/pmtiles/
- **Tippecanoe**: https://github.com/felt/tippecanoe
- **Vite**: https://vite.dev/

## 🎨 Color Palette

```css
/* Dark Mode Colors */
Background:        #0f172a  /* Dark slate */
Nations Fill:      #1e40af  /* Dark blue */
Nations Stroke:    #3b82f6  /* Bright blue */
LA Fill:          #047857  /* Dark green */
LA Stroke:        #10b981  /* Bright green */
SA Fill:          #b45309  /* Dark amber */
SA Stroke:        #f59e0b  /* Bright amber */

/* Labels */
Nation Labels:     #60a5fa  /* Sky blue */
LA Labels:         #34d399  /* Emerald */
Label Halo:        #0f172a  /* Dark slate */

/* UI */
Panel Background:  #1e293b  /* Slate 800 */
Panel Border:      #475569  /* Slate 600 */
Text:             #e2e8f0  /* Slate 200 */
```

---

**Last Updated**: November 9, 2025  
**Project Version**: 1.0.0  
**MapLibre Version**: 5.11.0  
**PMTiles Version**: 4.3.0
