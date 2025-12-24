# Architecture & Data Reference
## UK Co-Benefits Atlas - System Documentation

**Last Updated:** December 22, 2025  
**Project:** The Co-Benefits of Reaching Net-Zero in the UK  
**Institution:** Edinburgh Climate Change Institute, University of Edinburgh  
**Data DOI:** [10.7488/ds/7978](https://doi.org/10.7488/ds/7978)

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Sources & Structure](#data-sources--structure)
3. [Geospatial Data (PMTiles)](#geospatial-data-pmtiles)
4. [Database Architecture](#database-architecture)
5. [Backend API Reference](#backend-api-reference)
6. [Frontend Map Implementation](#frontend-map-implementation)
7. [Data Processing Pipeline](#data-processing-pipeline)
8. [File Structure Reference](#file-structure-reference)

---

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MapLibre GL │  │   Plotly.js  │  │  TypeScript  │      │
│  │   JS (Maps)  │  │    (Charts)  │  │    (Logic)   │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                     │              │
│         │ PMTiles (Vector Tiles)             │ API Calls    │
│         │                                     │              │
└─────────┼─────────────────────────────────────┼──────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                             │
│  ┌──────────────────┐         ┌─────────────────────┐       │
│  │  Express.js      │◄────────┤  PostgreSQL 16      │       │
│  │  (Node.js API)   │         │  + PostGIS 3.4      │       │
│  │  Port 3000       │         │  + TimescaleDB 2.17 │       │
│  └──────────────────┘         └─────────────────────┘       │
│         │                               │                    │
│         │ Serves PMTiles               │ Spatial Queries    │
│         │ REST API Endpoints           │ Time-series Data   │
└─────────┼───────────────────────────────┼────────────────────┘
          │                               │
          ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                            │
│  ┌──────────────────┐         ┌─────────────────────┐       │
│  │  PMTiles Files   │         │  CSV Datasets       │       │
│  │  (Vector Tiles)  │         │  (Co-benefit Data)  │       │
│  └──────────────────┘         └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend Build** | Vite | 5.4.11 | Development server & bundler |
| **Frontend Language** | TypeScript | 5.6.3 | Type-safe JavaScript |
| **Map Rendering** | MapLibre GL JS | 5.11.0 | Vector tile rendering |
| **Charting** | Plotly.js | 2.35.2 | Interactive visualizations |
| **Backend Runtime** | Node.js | 20.x | JavaScript runtime |
| **Backend Framework** | Express.js | 4.21.2 | RESTful API server |
| **Database** | PostgreSQL | 16 | Relational database |
| **Spatial Extension** | PostGIS | 3.4 | Geographic objects & queries |
| **Time-series Extension** | TimescaleDB | 2.17 | Time-series optimization |
| **Vector Tiles Format** | PMTiles | v3 | Cloud-optimized map tiles |

---

## Data Sources & Structure

### Overview
- **Total Data Points:** 66.4 million
- **Small Areas:** 46,426 (Datazones, LSOAs)
- **Local Authorities:** 374
- **Nations:** 4 (England, Scotland, Wales, Northern Ireland)
- **Co-benefit Types:** 11
- **Damage Pathways:** 5
- **Time Span:** 2025-2050 (26 years)
- **Base Year:** 2025
- **Units:** Million GBP (discounted net present values)

### Co-Benefit Types (11 Fields)

| Field | Description | Unit | Notes |
|-------|-------------|------|-------|
| `air_quality` | Reduced air pollution from cleaner heating/transport | £M | Health + building damage reduction |
| `congestion` | Traffic congestion changes | £M | Can be positive or negative |
| `dampness` | Reduced damp housing | £M | Health & wellbeing improvements |
| `diet_change` | Plant-based dietary shifts | £M | Health improvements |
| `excess_cold` | Warmer homes from insulation | £M | Avoided health damages |
| `excess_heat` | Reduced overheating risk | £M | Improved ventilation/cooling |
| `hassle_costs` | Longer travel times | £M | Typically negative (costs) |
| `noise` | Reduced noise pollution | £M | Modal shift benefits |
| `physical_activity` | Active travel (walking/cycling) | £M | Health & longevity |
| `road_repairs` | Road maintenance changes | £M | Can be positive or negative |
| `road_safety` | Collision incidence changes | £M | Vehicle travel impacts |
| **`sum`** | **Total aggregated co-benefits** | **£M** | **Sum of all 11 types** |

### Damage Pathways (Level 3 Only)

| Pathway | Description | Applies To |
|---------|-------------|------------|
| `reduced_mortality` | Direct health - reduced premature deaths | Health co-benefits |
| `society` | Wider non-health societal impacts | Non-health co-benefits |
| `time_saved` | Travel time benefits/costs | Transport co-benefits |
| `NHS` | Healthcare cost savings | Health co-benefits |
| `QALY` | Quality-adjusted life expectancy gains | Health co-benefits |

### Dataset Files

#### `/dataset/` Directory
| File | Description | Rows | Columns | Size |
|------|-------------|------|---------|------|
| `Level_1.csv` | Total co-benefits by small area (2025-2050) | 46,426 | 13 | ~3 MB |
| `Level_1_grouped_by_LA.csv` | Aggregated by Local Authority | 374 | 13 | ~50 KB |
| `Level_1_with_LA.csv` | Level 1 + LA lookup | 46,426 | 14 | ~3 MB |
| `Level_2.csv` | Annual co-benefits (2025-2050) | 1,207,076 | 14 | ~75 MB |
| `Level_2_grouped_by_LA.csv` | Annual by LA | 9,724 | 14 | ~1.5 MB |
| `lookups.csv` | Area name + LA + region mappings | 46,426 | 5 | ~2 MB |

#### CSV Column Structure

**Level 1 (Total 2025-2050):**
```csv
small_area,air_quality,congestion,dampness,diet_change,excess_cold,excess_heat,hassle_costs,noise,physical_activity,road_repairs,road_safety,sum
S00000001,12.45,3.21,8.90,1.45,25.30,4.50,-2.10,3.45,15.60,0.80,2.10,75.66
```

**Level 2 (Annual):**
```csv
small_area,year,air_quality,congestion,dampness,diet_change,excess_cold,excess_heat,hassle_costs,noise,physical_activity,road_repairs,road_safety,sum
S00000001,2025,0.45,0.12,0.34,0.05,0.97,0.17,-0.08,0.13,0.60,0.03,0.08,2.86
```

**Lookups:**
```csv
small_area,small_area_name,local_authority,local_authority_name,region
S00000001,Culter - 01,S12000033,Aberdeen City,Scotland
```

---

## Geospatial Data (PMTiles)

### What is PMTiles?
PMTiles is a **single-file archive** format for map tiles that:
- Enables **HTTP range requests** (fetch only needed tiles, not entire file)
- Contains **Mapbox Vector Tiles (MVT)** format (.pbf) inside
- Requires no tile server (can be served from static file hosting)
- Supports **zoom-based Level of Detail (LOD)** rendering

### PMTiles Files in `/PMTiles/` Directory

#### Small Areas (Highest Resolution - LOD 2)
| File | Description | Size | Zoom Levels | Features |
|------|-------------|------|-------------|----------|
| `small_areas_wgs84.gpkg` | Source GeoPackage | ~150 MB | N/A | 46,426 polygons |
| ~~`small_areas_wgs84.pmtiles`~~ | PMTiles archive | ~~N/A~~ | ~~8-14~~ | ~~Not created yet~~ |
| `small_areas_wgs84.geojson` | GeoJSON export | ~400 MB | N/A | For reference |

**Coordinate System:** WGS84 (EPSG:4326)  
**Geometry Type:** MultiPolygon  
**Attributes:** `small_area` (ID), `geometry`

#### Local Authorities (Medium Resolution - LOD 1)
| File | Description | Size | Zoom Levels | Features |
|------|-------------|------|-------------|----------|
| `local_authorities_wgs84.gpkg` | Source GeoPackage | ~15 MB | N/A | 374 polygons |
| `local_authorities_wgs84.pmtiles` | PMTiles archive | ~1.2 MB | 5-10 | 374 features |
| `local_authorities_wgs84_labels.pmtiles` | Label centroids | ~50 KB | 5-10 | 374 points |
| `local_authorities_wgs84.geojson` | GeoJSON export | ~45 MB | N/A | For reference |

**Coordinate System:** WGS84 (EPSG:4326)  
**Geometry Type:** MultiPolygon  
**Attributes:** `lad23cd` (ID), `lad23nm` (name), `geometry`

#### Nations (Lowest Resolution - LOD 0)
| File | Description | Size | Zoom Levels | Features |
|------|-------------|------|-------------|----------|
| `nation_wgs84.gpkg` | Source GeoPackage | ~2 MB | N/A | 4 polygons |
| `nation_wgs84_simplified.pmtiles` | Simplified PMTiles | ~150 KB | 0-6 | 4 features |
| `nation_wgs84_labels.pmtiles` | Label centroids | ~5 KB | 0-6 | 4 points |
| `nation_wgs84.geojson` | GeoJSON export | ~8 MB | N/A | For reference |

**Coordinate System:** WGS84 (EPSG:4326)  
**Geometry Type:** MultiPolygon  
**Attributes:** `ctry21cd` (ID), `ctry21nm` (name), `geometry`

### PMTiles Creation Process

#### Tool: Tippecanoe (go-pmtiles)
Located in `/tippecanoe-2.79.0/` directory

**Basic Creation Command:**
```bash
./tippecanoe -o output.pmtiles \
  -Z 5 \        # Minimum zoom level
  -z 10 \       # Maximum zoom level
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  input.geojson
```

**Rebuild Scripts:**
- `rebuild_with_z0.sh` - Rebuilds nation tiles starting from zoom 0

### Zoom Level Strategy (LOD System)

| Zoom Range | LOD Level | Geography | Use Case | Tile Count |
|------------|-----------|-----------|----------|------------|
| 0-6 | LOD 0 | Nations (4) | Overview, UK-wide | ~100 tiles |
| 5-10 | LOD 1 | Local Authorities (374) | Regional analysis | ~5,000 tiles |
| 8-14 | LOD 2 | Small Areas (46,426) | Detailed area view | ~50,000 tiles |

**Frontend Automatic Switching:**
```typescript
// In map-controller.ts
if (zoom < 7) loadNationLayer();
else if (zoom < 11) loadLocalAuthorityLayer();
else loadSmallAreaLayer();
```

---

## Database Architecture

### PostgreSQL Database: `ecci`

#### Extensions
```sql
CREATE EXTENSION postgis;        -- Spatial queries
CREATE EXTENSION postgis_raster; -- Raster support
CREATE EXTENSION timescaledb;   -- Time-series optimization
```

### Core Tables

#### 1. `small_areas` (46,426 rows)
**Purpose:** Highest resolution spatial data with co-benefit values

| Column | Type | Description | Index |
|--------|------|-------------|-------|
| `ogc_fid` | INTEGER | Primary key (auto) | PRIMARY KEY |
| `small_area` | TEXT | Unique area ID (S00000001, etc.) | BTREE |
| `geom` | GEOMETRY(MultiPolygon, 4326) | WGS84 polygon geometry | GIST (spatial) |
| `air_quality` | DOUBLE PRECISION | Air quality co-benefits (£M) | - |
| `congestion` | DOUBLE PRECISION | Congestion impacts (£M) | - |
| `dampness` | DOUBLE PRECISION | Dampness reduction (£M) | - |
| `diet_change` | DOUBLE PRECISION | Diet change benefits (£M) | - |
| `excess_cold` | DOUBLE PRECISION | Cold reduction (£M) | - |
| `excess_heat` | DOUBLE PRECISION | Heat reduction (£M) | - |
| `hassle_costs` | DOUBLE PRECISION | Travel time costs (£M) | - |
| `noise` | DOUBLE PRECISION | Noise reduction (£M) | - |
| `physical_activity` | DOUBLE PRECISION | Active travel (£M) | - |
| `road_repairs` | DOUBLE PRECISION | Road maintenance (£M) | - |
| `road_safety` | DOUBLE PRECISION | Safety improvements (£M) | - |
| `sum` | DOUBLE PRECISION | Total co-benefits (£M) | - |

**Indexes:**
```sql
CREATE INDEX small_areas_geom_idx ON small_areas USING GIST(geom);
CREATE INDEX small_areas_sa_idx ON small_areas(small_area);
```

**Sample Query:**
```sql
SELECT small_area, sum, excess_cold, physical_activity
FROM small_areas
WHERE sum > 100
ORDER BY sum DESC
LIMIT 10;
```

#### 2. `local_authorities` (374 rows)
**Purpose:** Medium resolution boundaries

| Column | Type | Description |
|--------|------|-------------|
| `ogc_fid` | INTEGER | Primary key |
| `lad23cd` | TEXT | LA code (E07000223, etc.) |
| `lad23nm` | TEXT | LA name (Adur, etc.) |
| `geom` | GEOMETRY(MultiPolygon, 4326) | WGS84 geometry |

**Index:**
```sql
CREATE INDEX local_authorities_geom_idx ON local_authorities USING GIST(geom);
```

#### 3. `nations` (4 rows)
**Purpose:** Lowest resolution boundaries

| Column | Type | Description |
|--------|------|-------------|
| `ogc_fid` | INTEGER | Primary key |
| `ctry21cd` | TEXT | Country code (E92000001, etc.) |
| `ctry21nm` | TEXT | Country name (England, etc.) |
| `geom` | GEOMETRY(MultiPolygon, 4326) | WGS84 geometry |

### TimescaleDB Tables (Time-series Data)

#### 4. `small_area_timeseries` (Hypertable)
**Purpose:** Annual co-benefit values 2025-2050

```sql
CREATE TABLE small_area_timeseries (
  time TIMESTAMPTZ NOT NULL,           -- Year as timestamp
  small_area TEXT NOT NULL,            -- Area ID
  air_quality DOUBLE PRECISION,
  congestion DOUBLE PRECISION,
  dampness DOUBLE PRECISION,
  diet_change DOUBLE PRECISION,
  excess_cold DOUBLE PRECISION,
  excess_heat DOUBLE PRECISION,
  hassle_costs DOUBLE PRECISION,
  noise DOUBLE PRECISION,
  physical_activity DOUBLE PRECISION,
  road_repairs DOUBLE PRECISION,
  road_safety DOUBLE PRECISION,
  sum DOUBLE PRECISION
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('small_area_timeseries', 'time');
```

**Rows:** ~1.2 million (46,426 areas × 26 years)

**Sample Query:**
```sql
SELECT 
  time_bucket('1 year', time) AS year,
  AVG(sum) as avg_cobenefits
FROM small_area_timeseries
WHERE time BETWEEN '2025-01-01' AND '2050-12-31'
GROUP BY year
ORDER BY year;
```

#### 5. Continuous Aggregates (Materialized Views)
Pre-computed aggregations for faster queries:

```sql
-- National level aggregates by year
CREATE MATERIALIZED VIEW national_annual_aggregates
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 year', time) AS bucket,
  SUM(air_quality) as total_air_quality,
  SUM(physical_activity) as total_physical_activity,
  SUM(sum) as total_cobenefits,
  COUNT(*) as area_count
FROM small_area_timeseries
GROUP BY bucket;
```

### Category Views (Grouped Co-benefits)

#### 6. `health_wellbeing` (View)
```sql
CREATE VIEW health_wellbeing AS
SELECT 
  small_area,
  (air_quality + diet_change + physical_activity) as total
FROM small_areas;
```

#### 7. `housing_comfort` (View)
```sql
CREATE VIEW housing_comfort AS
SELECT 
  small_area,
  (dampness + excess_cold + excess_heat) as total
FROM small_areas;
```

#### 8. `road_mobility` (View)
```sql
CREATE VIEW road_mobility AS
SELECT 
  small_area,
  (congestion + hassle_costs + noise + road_repairs + road_safety) as total
FROM small_areas;
```

### Database Setup Scripts

| Script | Purpose | Order |
|--------|---------|-------|
| `setup-database.sql` | Initial table creation | 1 |
| `setup-timescaledb.sql` | TimescaleDB hypertable setup | 2 |
| `populate-timeseries-data.sql` | Import Level 2 annual data | 3 |
| `create-category-views.sql` | Create grouped views | 4 |
| `create-continuous-aggregates.sql` | Materialized views | 5 |
| `create-materialized-views.sql` | Additional pre-computed views | 6 |
| `optimize-database.sql` | Indexes, VACUUM, ANALYZE | 7 |

---

## Backend API Reference

### Server Configuration
- **File:** `/Backend/server.js`
- **Port:** 3000
- **Base URL:** `http://localhost:3000`
- **CORS:** Enabled for all origins (`*`)

### API Endpoints

#### 1. PMTiles File Serving
**Endpoint:** `GET /tiles/:file`

**Purpose:** Serves PMTiles archives with HTTP range request support

**Example:**
```
GET http://localhost:3000/tiles/small_areas_wgs84.pmtiles
Range: bytes=0-16383
```

**Response Headers:**
```
Content-Range: bytes 0-16383/1234567
Accept-Ranges: bytes
Content-Type: application/x-protobuf
Cache-Control: public, max-age=31536000, immutable
```

**Files Served:**
- `small_areas_wgs84.pmtiles`
- `local_authorities_wgs84.pmtiles`
- `nation_wgs84_simplified.pmtiles`
- Label tiles (`*_labels.pmtiles`)

---

#### 2. Vector Tile Generation (PostGIS)
**Endpoint:** `GET /tiles/:layer/:z/:x/:y.pbf`

**Purpose:** Dynamically generates vector tiles from PostGIS database

**Parameters:**
- `layer` - Layer name (`small_areas`, `local_authorities`, `nations`)
- `z` - Zoom level (0-14)
- `x` - Tile X coordinate
- `y` - Tile Y coordinate

**Example:**
```
GET http://localhost:3000/tiles/small_areas/10/512/341.pbf
```

**Response:**
- Content-Type: `application/x-protobuf`
- Format: Mapbox Vector Tile (MVT)
- Contains: Clipped geometries + all attributes

**SQL Query (Internal):**
```sql
SELECT 
  ST_AsMVT(tile, 'small_areas', 4096, 'geom') as mvt
FROM (
  SELECT 
    small_area,
    sum,
    ST_AsMVTGeom(
      geom,
      ST_TileEnvelope(:z, :x, :y),
      4096,
      256,
      true
    ) as geom
  FROM small_areas
  WHERE geom && ST_TileEnvelope(:z, :x, :y)
) as tile;
```

---

#### 3. Area Data Lookup
**Endpoint:** `GET /api/area-data/:small_area`

**Purpose:** Get all co-benefit values for a specific small area

**Parameters:**
- `small_area` - Area ID (e.g., `S00000001`)

**Example:**
```
GET http://localhost:3000/api/area-data/S00000001
```

**Response:**
```json
{
  "small_area": "S00000001",
  "air_quality": 12.45,
  "congestion": 3.21,
  "dampness": 8.90,
  "diet_change": 1.45,
  "excess_cold": 25.30,
  "excess_heat": 4.50,
  "hassle_costs": -2.10,
  "noise": 3.45,
  "physical_activity": 15.60,
  "road_repairs": 0.80,
  "road_safety": 2.10,
  "sum": 75.66
}
```

---

#### 4. Heatmap Data (Single Field)
**Endpoint:** `GET /api/heatmap-data/:field/:lod`

**Purpose:** Get co-benefit values for all areas at specified LOD

**Parameters:**
- `field` - Co-benefit field name
  - `sum`, `air_quality`, `physical_activity`, etc.
- `lod` - Level of detail
  - `0` = Nations (4)
  - `1` = Local Authorities (374)
  - `2` = Small Areas (46,426)

**Example:**
```
GET http://localhost:3000/api/heatmap-data/sum/2
```

**Response:**
```json
{
  "data": [
    { "id": "S00000001", "value": 75.66 },
    { "id": "S00000002", "value": 42.31 },
    ...
  ],
  "count": 46426
}
```

**Performance:**
- LOD 0: ~1ms
- LOD 1: ~10ms
- LOD 2: ~200ms

---

#### 5. Field Statistics
**Endpoint:** `GET /api/field-stats/:field`

**Purpose:** Get min, max, avg, and percentiles for a field

**Parameters:**
- `field` - Co-benefit field name

**Example:**
```
GET http://localhost:3000/api/field-stats/sum
```

**Response:**
```json
{
  "field": "sum",
  "min": -15.20,
  "max": 450.30,
  "avg": 85.42,
  "p10": 25.10,
  "p25": 42.50,
  "p50": 76.80,
  "p75": 115.60,
  "p90": 180.20
}
```

---

#### 6. Category Data (Grouped Co-benefits)
**Endpoint:** `GET /api/category-data/:lod`

**Purpose:** Get grouped co-benefit categories (Health, Housing, Mobility)

**Parameters:**
- `lod` - Level of detail (0, 1, or 2)

**Query Parameters:**
- `limit` (optional) - Limit number of results

**Example:**
```
GET http://localhost:3000/api/category-data/1?limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "E07000223",
      "name": "Adur",
      "health_wellbeing": 125.40,
      "housing_comfort": 89.20,
      "road_mobility": 45.60
    },
    ...
  ],
  "lod": 1,
  "count": 10
}
```

**Category Formulas:**
- `health_wellbeing` = air_quality + diet_change + physical_activity
- `housing_comfort` = dampness + excess_cold + excess_heat
- `road_mobility` = congestion + hassle_costs + noise + road_repairs + road_safety

---

#### 7. Time-series Data
**Endpoint:** `GET /api/timeseries/:lod/category/:category`

**Purpose:** Get annual time-series data for a category

**Parameters:**
- `lod` - Level of detail (0, 1, or 2)
- `category` - Category name
  - `health_wellbeing`
  - `housing_comfort`
  - `road_mobility`
  - Or individual fields: `sum`, `air_quality`, etc.

**Query Parameters:**
- `startYear` - Start year (default: 2025)
- `endYear` - End year (default: 2050)
- `areaId` (optional) - Filter by specific area

**Example:**
```
GET http://localhost:3000/api/timeseries/0/category/health_wellbeing?startYear=2025&endYear=2030
```

**Response:**
```json
{
  "category": "health_wellbeing",
  "lod": 0,
  "data": [
    { "year": 2025, "value": 1250.30 },
    { "year": 2026, "value": 1380.50 },
    { "year": 2027, "value": 1520.80 },
    ...
  ]
}
```

---

#### 8. Top/Bottom Areas Ranking
**Endpoint:** `GET /api/ranking/:field/:lod`

**Purpose:** Get top or bottom performing areas

**Parameters:**
- `field` - Co-benefit field
- `lod` - Level of detail (0, 1, or 2)

**Query Parameters:**
- `limit` - Number of results (default: 10)
- `order` - `DESC` (top) or `ASC` (bottom)

**Example:**
```
GET http://localhost:3000/api/ranking/physical_activity/1?limit=5&order=DESC
```

**Response:**
```json
{
  "field": "physical_activity",
  "lod": 1,
  "order": "DESC",
  "data": [
    { "id": "E07000123", "name": "Westminster", "value": 280.50 },
    { "id": "E07000456", "name": "Camden", "value": 245.30 },
    ...
  ]
}
```

---

## Frontend Map Implementation

### MapLibre GL JS Configuration

**File:** `/Frontend/src/map-controller.ts`

#### Base Map Style
```typescript
{
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0F172A' }
    },
    {
      id: 'carto-dark-tiles',
      type: 'raster',
      source: 'carto-dark',
      paint: { 'raster-opacity': 0.3 }
    }
  ]
}
```

#### PMTiles Integration
```typescript
import { Protocol } from 'pmtiles';

// Register PMTiles protocol
const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

// Add source
map.addSource('small-areas', {
  type: 'vector',
  url: 'pmtiles://http://localhost:3000/tiles/small_areas_wgs84.pmtiles'
});

// Add layer
map.addLayer({
  id: 'small-areas-fill',
  type: 'fill',
  source: 'small-areas',
  'source-layer': 'small_areas',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'sum'],
      0, '#1e3a8a',
      100, '#3b82f6',
      200, '#60a5fa'
    ],
    'fill-opacity': 0.7
  }
});
```

#### LOD Switching Logic
```typescript
class LODControl {
  updateLayers(zoom: number) {
    if (zoom < 7) {
      this.showLayer('nations');
      this.hideLayer('local-authorities');
      this.hideLayer('small-areas');
    } else if (zoom < 11) {
      this.hideLayer('nations');
      this.showLayer('local-authorities');
      this.hideLayer('small-areas');
    } else {
      this.hideLayer('nations');
      this.hideLayer('local-authorities');
      this.showLayer('small-areas');
    }
  }
}
```

### Color Schemes

#### Diverging (Positive/Negative Values)
```typescript
// For fields that can be positive or negative
const divergingColor = [
  'interpolate',
  ['linear'],
  ['get', fieldName],
  -50, '#dc2626',  // Red (negative)
  0, '#94a3b8',    // Gray (neutral)
  50, '#22c55e'    // Green (positive)
];
```

#### Sequential (Only Positive Values)
```typescript
// For fields that are only positive
const sequentialColor = [
  'interpolate',
  ['linear'],
  ['get', fieldName],
  0, '#1e3a8a',    // Dark blue
  50, '#3b82f6',   // Medium blue
  100, '#60a5fa',  // Light blue
  200, '#bfdbfe'   // Very light blue
];
```

### Layer Types

#### Fill Layers (Polygons)
```typescript
{
  id: 'areas-fill',
  type: 'fill',
  source: 'areas',
  paint: {
    'fill-color': colorExpression,
    'fill-opacity': 0.7
  }
}
```

#### Outline Layers
```typescript
{
  id: 'areas-outline',
  type: 'line',
  source: 'areas',
  paint: {
    'line-color': '#ffffff',
    'line-width': 1,
    'line-opacity': 0.3
  }
}
```

#### Label Layers (Points)
```typescript
{
  id: 'areas-labels',
  type: 'symbol',
  source: 'area-labels',
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 12,
    'text-font': ['Open Sans Regular']
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 2
  }
}
```

---

## Data Processing Pipeline

### Pipeline Overview
```
┌────────────────┐
│   Source CSV   │  Level_1.csv, Level_2.csv (R model outputs)
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Python Join   │  join.py - Merge with lookups
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Import to PG  │  \copy command or import-data.ps1
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  SQL Transform │  Standardize, aggregate, create views
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ TimescaleDB HT │  Hypertable + continuous aggregates
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  API Endpoints │  Express.js serves data
└────────────────┘
```

### Processing Scripts

#### 1. Python Join Script
**File:** `/dataset/join.py`

**Purpose:** Merge Level 1 data with lookup table

```python
import pandas as pd

# Read files
level1 = pd.read_csv('Level_1.csv')
lookups = pd.read_csv('lookups.csv')

# Merge
merged = level1.merge(lookups, on='small_area', how='left')

# Save
merged.to_csv('Level_1_with_LA.csv', index=False)
```

#### 2. PowerShell Import Script
**File:** `/Backend/import-data.ps1`

**Purpose:** Automated import of all CSV files to PostgreSQL

```powershell
# Import Level 1 total data
psql -U postgres -d ecci -c "\copy small_areas_temp FROM 'd:/Websites/ECCI/dataset/Level_1.csv' WITH (FORMAT csv, HEADER true)"

# Import Level 2 annual data
psql -U postgres -d ecci -c "\copy small_area_timeseries_temp FROM 'd:/Websites/ECCI/dataset/Level_2.csv' WITH (FORMAT csv, HEADER true)"
```

#### 3. SQL Standardization
**File:** `/Backend/create-standardized-table.sql`

**Purpose:** Convert 'NA' strings to NULL, handle data types

```sql
UPDATE small_areas
SET 
  air_quality = CASE WHEN air_quality_text = 'NA' THEN NULL ELSE air_quality_text::DOUBLE PRECISION END,
  congestion = CASE WHEN congestion_text = 'NA' THEN NULL ELSE congestion_text::DOUBLE PRECISION END,
  ...
FROM small_areas_temp;
```

#### 4. TimescaleDB Hypertable Setup
**File:** `/Backend/setup-timescaledb.sql`

```sql
-- Create time-series table
CREATE TABLE small_area_timeseries (
  time TIMESTAMPTZ NOT NULL,
  small_area TEXT NOT NULL,
  ...fields...
);

-- Convert to hypertable (must be done before inserting data)
SELECT create_hypertable('small_area_timeseries', 'time');

-- Create continuous aggregates
CREATE MATERIALIZED VIEW national_annual
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 year', time) as bucket, SUM(sum) as total
FROM small_area_timeseries
GROUP BY bucket;

-- Refresh policy (auto-update)
SELECT add_continuous_aggregate_policy('national_annual',
  start_offset => INTERVAL '3 months',
  end_offset => INTERVAL '1 month',
  schedule_interval => INTERVAL '1 day');
```

#### 5. Spatial Data Import (ogr2ogr)
**Purpose:** Import GeoPackage files to PostGIS

```bash
# Small areas
ogr2ogr -f "PostgreSQL" \
  PG:"host=localhost dbname=ecci user=postgres password=admin123" \
  -nln small_areas \
  -overwrite \
  d:/Websites/ECCI/PMTiles/small_areas_wgs84.gpkg

# Local authorities
ogr2ogr -f "PostgreSQL" \
  PG:"host=localhost dbname=ecci user=postgres password=admin123" \
  -nln local_authorities \
  -overwrite \
  d:/Websites/ECCI/PMTiles/local_authorities_wgs84.gpkg

# Nations
ogr2ogr -f "PostgreSQL" \
  PG:"host=localhost dbname=ecci user=postgres password=admin123" \
  -nln nations \
  -overwrite \
  d:/Websites/ECCI/PMTiles/nation_wgs84.gpkg
```

---

## File Structure Reference

### Complete Directory Tree

```
ECCI/
├── Frontend/                          # Vite + TypeScript application
│   ├── src/
│   │   ├── main.ts                   # Application entry point
│   │   ├── map-controller.ts         # MapLibre GL JS logic
│   │   ├── lod-control.ts            # LOD switching system
│   │   ├── navbar.ts                 # Navigation bar component
│   │   ├── main.css                  # Global styles
│   │   ├── services/
│   │   │   └── cobenefits-api.ts     # Backend API client
│   │   └── sections/
│   │       ├── story-mode.ts         # Scrollytelling controller
│   │       └── Laporan/
│   │           └── section-cobenefits.ts  # Co-benefits sections
│   ├── public/
│   │   └── data/
│   │       └── README.txt            # Data package documentation
│   ├── index.html                    # Main HTML entry
│   ├── package.json                  # Dependencies
│   ├── vite.config.ts                # Vite configuration
│   └── tsconfig.json                 # TypeScript config
│
├── Backend/                           # Node.js Express API server
│   ├── server.js                     # Main Express application
│   ├── server-postgis.js             # PostGIS-specific endpoints
│   ├── package.json                  # Node dependencies
│   ├── tiles/                        # PMTiles file directory
│   │   ├── small_areas_wgs84.pmtiles
│   │   ├── local_authorities_wgs84.pmtiles
│   │   └── nation_wgs84_simplified.pmtiles
│   ├── Data/                         # Processed data files
│   └── SQL Scripts:
│       ├── setup-database.sql        # Initial DB setup
│       ├── setup-timescaledb.sql     # TimescaleDB config
│       ├── populate-timeseries-data.sql
│       ├── create-category-views.sql
│       ├── create-continuous-aggregates.sql
│       ├── create-materialized-views.sql
│       ├── create-standardized-table.sql
│       ├── optimize-database.sql
│       ├── force-spatial-index.sql
│       ├── fix-aggregated-tables.sql
│       ├── add-wgs84-to-aggregated.sql
│       ├── check-tables.sql
│       └── debug-query.sql
│
├── PMTiles/                           # Geospatial source data
│   ├── Small Areas (LOD 2):
│   │   ├── small_areas_wgs84.gpkg    # 46,426 polygons
│   │   ├── small_areas_wgs84.geojson
│   │   └── small_areas_wgs84.qmd     # Metadata
│   ├── Local Authorities (LOD 1):
│   │   ├── local_authorities_wgs84.gpkg     # 374 polygons
│   │   ├── local_authorities_wgs84.pmtiles  # 1.2 MB
│   │   ├── local_authorities_wgs84_labels.pmtiles
│   │   └── local_authorities_wgs84.geojson
│   ├── Nations (LOD 0):
│   │   ├── nation_wgs84.gpkg         # 4 polygons
│   │   ├── nation_wgs84_simplified.pmtiles  # 150 KB
│   │   ├── nation_wgs84_labels.pmtiles
│   │   └── nation_wgs84.geojson
│   ├── lookups.csv                   # Area name mappings
│   ├── lookups.xlsx                  # Excel version
│   ├── pmtiles.exe                   # Tippecanoe binary
│   └── rebuild_with_z0.sh            # Rebuild script
│
├── dataset/                           # CSV co-benefit data
│   ├── Level_1.csv                   # Total 2025-2050 (46K rows)
│   ├── Level_1_grouped_by_LA.csv     # Aggregated by LA (374 rows)
│   ├── Level_1_with_LA.csv           # With lookup (46K rows)
│   ├── Level_2.csv                   # Annual 2025-2050 (1.2M rows)
│   ├── Level_2_grouped_by_LA.csv     # Annual by LA (9.7K rows)
│   ├── lookups.csv                   # Area mappings
│   └── join.py                       # Python join script
│
├── tippecanoe-2.79.0/                # PMTiles creation tool
│   └── (Tippecanoe source files)
│
└── Documentation:
    ├── ARCHITECTURE-DATA-REFERENCE.md    # This file
    ├── TECHNICAL-DOCUMENTATION.md        # Technology choices
    ├── README.md                         # Project overview
    ├── QUICKSTART.md                     # Getting started
    ├── deployment-guide.md               # Deployment instructions
    ├── DEPLOYMENT-CHECKLIST.md
    ├── MANUAL-POSTGRES-INSTALL.md
    ├── DOCKER-POSTGRES.md
    ├── TIMESCALEDB-SETUP-GUIDE.md
    ├── SERVER-CONSOLIDATION.md
    ├── STANDARDIZATION-README.md
    └── HEATMAP-DEBUG-SESSION.md
```

### Key File Sizes

| File | Size | Description |
|------|------|-------------|
| `Level_2.csv` | ~75 MB | 1.2M annual records |
| `small_areas_wgs84.geojson` | ~400 MB | 46K polygons |
| `small_areas_wgs84.gpkg` | ~150 MB | Compressed geometry |
| `local_authorities_wgs84.pmtiles` | 1.2 MB | 374 LA tiles |
| `nation_wgs84_simplified.pmtiles` | 150 KB | 4 nation tiles |
| `Frontend/dist/` (built) | ~5 MB | Production bundle |

---

## Quick Reference Commands

### Start Development Environment
```bash
# Terminal 1: Backend
cd Backend
node server.js

# Terminal 2: Frontend
cd Frontend
npm run dev
```

### Database Operations
```sql
-- Connect to database
psql -U postgres -d ecci

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records
SELECT COUNT(*) FROM small_areas;
SELECT COUNT(*) FROM small_area_timeseries;

-- Check spatial index
SELECT * FROM pg_indexes WHERE tablename = 'small_areas';

-- Refresh continuous aggregates
CALL refresh_continuous_aggregate('national_annual', NULL, NULL);
```

### Import Data
```bash
# Import spatial data
ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=ecci user=postgres" -nln small_areas d:/Websites/ECCI/PMTiles/small_areas_wgs84.gpkg

# Import CSV
psql -U postgres -d ecci -c "\copy small_areas_temp FROM 'Level_1.csv' CSV HEADER"
```

### Build PMTiles
```bash
cd PMTiles
./pmtiles.exe convert small_areas_wgs84.geojson small_areas_wgs84.pmtiles
```

---

## Related Documentation

- **[TECHNICAL-DOCUMENTATION.md](TECHNICAL-DOCUMENTATION.md)** - Technology stack rationale
- **[TIMESCALEDB-SETUP-GUIDE.md](Backend/TIMESCALEDB-SETUP-GUIDE.md)** - Time-series database setup
- **[STANDARDIZATION-README.md](Backend/STANDARDIZATION-README.md)** - Data standardization process
- **[deployment-guide.md](deployment-guide.md)** - Production deployment
- **[README.md](README.md)** - Project overview

---

**Document Maintained By:** Edinburgh Climate Change Institute  
**Last Updated:** December 22, 2025  
**Version:** 1.0
