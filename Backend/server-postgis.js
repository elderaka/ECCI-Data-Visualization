import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';

const app = express();
app.use(cors());

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecci',
  password: 'admin123', // Change this to your password
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

/**
 * Vector tile endpoint
 * GET /tiles/:layer/:z/:x/:y.pbf
 * 
 * Generates vector tiles on-demand from PostGIS
 */
app.get('/tiles/:layer/:z/:x/:y.pbf', async (req, res) => {
  const { layer, z, x, y } = req.params;
  const zoom = parseInt(z);
  const tileX = parseInt(x);
  const tileY = parseInt(y);

  console.log(`Tile request: layer=${layer}, z=${zoom}, x=${tileX}, y=${tileY}`);

  try {
    // Calculate tile bounds in Web Mercator
    const bounds = tileToBBox(tileX, tileY, zoom);
    
    // Determine LOD based on zoom level (matches frontend LOD control)
    let lodLevel;
    let tableName;
    let groupByField = null;
    
    if (zoom < 7) {
      // Nation level - aggregate by nation
      lodLevel = 'nation';
      tableName = 'nations';
      groupByField = 'lookups_nation';
    } else if (zoom < 10) {
      // Local authority level - aggregate by local authority
      lodLevel = 'local_authority';
      tableName = 'local_authorities';
      groupByField = 'lookups_local_authority';
    } else {
      // Small area level - full detail
      lodLevel = 'small_area';
      tableName = 'small_areas';
    }

    console.log(`Using LOD: ${lodLevel}, table: ${tableName}, bounds:`, bounds);

    // Build query based on LOD level
    let query;
    
    if (lodLevel === 'small_area') {
      // Full detail - return all small areas with their data
      const columns = `
        small_area,
        lookups_local_authority,
        lookups_nation,
        air_quality,
        congestion,
        dampness,
        diet_change,
        excess_cold,
        excess_heat,
        hassle_costs,
        noise,
        physical_activity,
        road_repairs,
        road_safety,
        sum
      `;
      
      query = `
        WITH mvtgeom AS (
          SELECT 
            ST_AsMVTGeom(
              ST_Transform(geom, 3857),
              ST_Transform(ST_MakeEnvelope($1, $2, $3, $4, 4326), 3857),
              4096,
              256,
              true
            ) AS geom,
            ${columns}
          FROM ${tableName}
          WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
        SELECT ST_AsMVT(mvtgeom.*, 'small_areas', 4096, 'geom') as mvt
        FROM mvtgeom
        WHERE geom IS NOT NULL;
      `;
    } else {
      // Aggregated - use pre-aggregated tables directly (no JOIN needed!)
      // Note: geom column is already in WGS84 (4326) in the aggregated tables
      query = `
        WITH tile_bounds AS (
          SELECT ST_TileEnvelope(${z}, ${x}, ${y}) as envelope
        ),
        mvtgeom AS (
          SELECT 
            ST_AsMVTGeom(
              ST_Transform(geom, 3857),
              ST_TileEnvelope(${z}, ${x}, ${y}, margin => 0.0),
              4096,
              256,
              true
            ) AS geom,
            ${groupByField},
            air_quality,
            congestion,
            dampness,
            diet_change,
            excess_cold,
            excess_heat,
            hassle_costs,
            noise,
            physical_activity,
            road_repairs,
            road_safety,
            sum
          FROM ${aggregatedTableName}, tile_bounds
          WHERE geom && tile_bounds.envelope
        )
        SELECT ST_AsMVT(mvtgeom.*, 'small_areas', 4096, 'geom') as mvt
        FROM mvtgeom
        WHERE geom IS NOT NULL;
      `;
    }

    // Small area queries need bounds parameters, aggregated queries don't (they use z/x/y directly)
    const result = lodLevel === 'small_area' 
      ? await pool.query(query, [bounds[0], bounds[1], bounds[2], bounds[3]])
      : await pool.query(query);
    
    if (result.rows.length === 0 || !result.rows[0].mvt) {
      // No features in this tile
      res.status(204).send();
      return;
    }

    const mvt = result.rows[0].mvt;
    
    res.setHeader('Content-Type', 'application/x-protobuf');
    // Don't set gzip header - ST_AsMVT returns uncompressed protobuf
    res.send(mvt);
    
  } catch (error) {
    console.error('Error generating tile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Convert tile coordinates to WGS84 bounding box
 */
function tileToBBox(x, y, z) {
  const n = Math.pow(2, z);
  const lon1 = (x / n) * 360 - 180;
  const lat1 = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const lon2 = ((x + 1) / n) * 360 - 180;
  const lat2 = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
  
  return [lon1, lat2, lon2, lat1]; // [minLon, minLat, maxLon, maxLat]
}

/**
 * API endpoint to get data for a specific small area
 * Used for region dialog boxes
 */
app.get('/api/area-data/:small_area', async (req, res) => {
  const { small_area } = req.params;
  
  try {
    const query = `
      SELECT 
        small_area,
        air_quality, congestion, dampness, diet_change,
        excess_cold, excess_heat, hassle_costs, noise,
        physical_activity, road_repairs, road_safety, sum
      FROM small_areas
      WHERE small_area = $1
    `;
    
    const result = await pool.query(query, [small_area]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Area not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting area data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get heatmap data for all regions
 * Returns aggregated statistics by LOD level (nation/local_authority/small_area)
 */
app.get('/api/heatmap-data/:lod', async (req, res) => {
  const { lod } = req.params;
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          lookups_nation as id,
          air_quality,
          congestion,
          dampness,
          diet_change,
          excess_cold,
          excess_heat,
          hassle_costs,
          noise,
          physical_activity,
          road_repairs,
          road_safety,
          sum
        FROM nations_aggregated
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          lookups_local_authority as id,
          air_quality,
          congestion,
          dampness,
          diet_change,
          excess_cold,
          excess_heat,
          hassle_costs,
          noise,
          physical_activity,
          road_repairs,
          road_safety,
          sum
        FROM local_authorities_aggregated
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          small_area as id,
          air_quality,
          congestion,
          dampness,
          diet_change,
          excess_cold,
          excess_heat,
          hassle_costs,
          noise,
          physical_activity,
          road_repairs,
          road_safety,
          sum
        FROM small_areas
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query);
    const elapsed = Date.now() - startTime;
    
    console.log(`📊 Heatmap data fetched: ${lod} (${result.rows.length} rows in ${elapsed}ms)`);
    
    // Convert to lookup object for faster client-side joins
    const dataMap = {};
    result.rows.forEach(row => {
      dataMap[row.id] = row;
    });
    
    res.json(dataMap);
  } catch (error) {
    console.error('Error getting heatmap data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get min/max values for a field
 * Used for setting up heatmap color scales
 */
app.get('/api/field-stats/:field', async (req, res) => {
  const { field } = req.params;
  
  // Validate field name to prevent SQL injection
  const allowedFields = [
    'air_quality', 'congestion', 'dampness', 'diet_change',
    'excess_cold', 'excess_heat', 'hassle_costs', 'noise',
    'physical_activity', 'road_repairs', 'road_safety', 'sum'
  ];
  
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field name' });
  }

  try {
    const query = `
      SELECT 
        MIN(${field}) as min,
        MAX(${field}) as max,
        AVG(${field}) as avg,
        percentile_cont(0.25) WITHIN GROUP (ORDER BY ${field}) as p25,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY ${field}) as p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY ${field}) as p75
      FROM small_areas
      WHERE ${field} IS NOT NULL
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting field stats:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Vector tile server running on http://localhost:${PORT}`);
  console.log(`Tiles: http://localhost:${PORT}/tiles/{layer}/{z}/{x}/{y}.pbf`);
  console.log(`Area:  http://localhost:${PORT}/api/area-data/{small_area}`);
  console.log(`Stats: http://localhost:${PORT}/api/field-stats/{field}`);
});
