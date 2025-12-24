# Server Consolidation - Port 3000 Only

## Summary

Previously, your application ran on **two separate ports**:
- **Port 3000** (`server.js`) - Static PMTiles file server
- **Port 3001** (`server-postgis.js`) - PostGIS database vector tiles + API endpoints

Now everything runs on **one unified port: 3000** 🎉

## What Changed

### Backend (`Backend/server.js`)

**Added:**
- PostgreSQL database connection pool
- Vector tile generation from PostGIS (`/tiles/{layer}/{z}/{x}/{y}.pbf`)
- API endpoints:
  - `/api/area-data/:small_area` - Get data for specific small area
  - `/api/field-stats/:field` - Get min/max/avg statistics for heatmap fields
- Helper function `tileToBBox()` for tile coordinate conversion

**Kept:**
- Static PMTiles file serving (`/tiles/{file}`)
- Range request support for efficient tile loading
- CORS configuration

### Frontend (`Frontend/src/config.ts`)

**Changed:**
```typescript
// Before: Two separate URLs
export const TILE_SERVER_URL = 'http://localhost:3000';
export const API_SERVER_URL = 'http://localhost:3001';

// After: One unified URL
export const API_SERVER_URL = 'http://localhost:3000';
export const TILE_SERVER_URL = API_SERVER_URL; // For backward compatibility
```

### Backend Package Configuration (`Backend/package.json`)

**Changed:**
```json
// Before
"main": "server-postgis.js",
"start": "node server-postgis.js"

// After
"main": "server.js",
"start": "node server.js"
```

## Route Resolution

The server intelligently handles both types of tile requests:

1. **Static PMTiles** - `/tiles/{filename}.pmtiles`
   - Example: `/tiles/nation_wgs84.pmtiles`
   - Serves pre-built PMTiles files with range request support

2. **Dynamic PostGIS Vector Tiles** - `/tiles/{layer}/{z}/{x}/{y}.pbf`
   - Example: `/tiles/small_areas/10/512/342.pbf`
   - Generates tiles on-demand from PostgreSQL database

Express.js route order ensures the more specific pattern (`/:layer/:z/:x/:y.pbf`) is matched before the general pattern (`/:file`).

## How to Run

### Stop Old Servers (if running)
```powershell
# Stop any process on port 3000 or 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Start Unified Server
```powershell
cd Backend
npm start
```

Or for development with auto-reload:
```powershell
npm run dev
```

### Expected Output
```
Database connected successfully

🚀 Unified ECCI Server running on http://localhost:3000
📦 PMTiles: http://localhost:3000/tiles/{file}
🗺️  Vector Tiles (PostGIS): http://localhost:3000/tiles/{layer}/{z}/{x}/{y}.pbf
📊 Area Data: http://localhost:3000/api/area-data/{small_area}
📈 Field Stats: http://localhost:3000/api/field-stats/{field}
📁 Tiles directory: D:\Websites\ECCI\Backend\tiles
```

## Benefits

✅ **Simpler deployment** - Only one server process to manage
✅ **Easier CORS** - No cross-port requests to configure
✅ **Reduced complexity** - One port to open in firewall/proxy
✅ **Better resource management** - Single Node.js process
✅ **Cleaner configuration** - One API_SERVER_URL variable

## Files You Can Archive/Delete

- `Backend/server-postgis.js` - Functionality now merged into `server.js`

## Production Deployment

Update your production server to:
1. Run only `server.js` on port 3000
2. Update Nginx/proxy to forward to port 3000 only
3. Close port 3001 (no longer needed)

The frontend production URL is already updated to use port 3000:
```typescript
export const API_SERVER_URL = import.meta.env.PROD 
  ? 'http://54.206.53.146:3000' 
  : 'http://localhost:3000';
```
