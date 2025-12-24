import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

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

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Serve PMTiles files with Range request support (for on-demand loading)
app.get('/tiles/:file', (req, res) => {
  const filePath = path.join(__dirname, 'tiles', req.params.file);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Handle range request (this enables on-demand tile loading!)
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    
    // Read the specific byte range from the file
    const buffer = Buffer.alloc(chunkSize);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, start);
    fs.closeSync(fd);
    
    console.log(`Read ${bytesRead} bytes, expected ${chunkSize}`);
    
    // Set headers and send the buffer
    res.status(206);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': bytesRead,
      'Content-Type': 'application/x-protobuf',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
    });
    
    res.send(buffer.slice(0, bytesRead));
  } else {
    // Serve entire file
    console.log(`Full file request: ${req.params.file} (${fileSize} bytes)`);
    
    res.status(200);
    res.set({
      'Content-Length': fileSize,
      'Content-Type': 'application/x-protobuf',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
    });
    
    fs.createReadStream(filePath).pipe(res);
  }
});

/**
 * Vector tile endpoint - generates tiles from PostGIS database
 * GET /tiles/:layer/:z/:x/:y.pbf
 */
app.get('/tiles/:layer/:z/:x/:y.pbf', async (req, res) => {
  const { layer, z, x, y } = req.params;
  const zoom = parseInt(z);
  const tileX = parseInt(x);
  const tileY = parseInt(y);

  console.log(`⏱️  Tile request: layer=${layer}, z=${zoom}, x=${tileX}, y=${tileY}`);
  const startTime = Date.now();

  try {
    // Calculate tile bounds in Web Mercator
    const bounds = tileToBBox(tileX, tileY, zoom);
    
    // Determine LOD based on zoom level (chunk-based method)
    // Use pre-aggregated tables for nations and local authorities
    let lodLevel;
    let tableName;
    
    if (zoom < 7) {
      lodLevel = 'nation';
      tableName = 'nations_aggregated'; // Pre-aggregated!
    } else if (zoom < 10) {
      lodLevel = 'local_authority';
      tableName = 'local_authorities_aggregated'; // Pre-aggregated!
    } else {
      lodLevel = 'small_area';
      tableName = 'small_areas_standardized';
    }

    // Build query based on LOD level
    let query;
    
    if (lodLevel === 'small_area') {
      // Small areas - no aggregation needed, direct query
      const columns = `
        small_area,
        lookups_local_authority,
        lookups_nation,
        urban_rural,
        area_type_display,
        air_quality, congestion, dampness, diet_change,
        excess_cold, excess_heat, hassle_costs, noise,
        physical_activity, road_repairs, road_safety, sum
      `;
      
      query = `
        WITH filtered AS (
          SELECT geom, ${columns}
          FROM ${tableName}
          WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ),
        mvtgeom AS (
          SELECT 
            ST_AsMVTGeom(
              ST_Transform(geom, 3857),
              ST_TileEnvelope(${zoom}, ${tileX}, ${tileY}),
              4096, 256, true
            ) AS geom,
            ${columns}
          FROM filtered
        )
        SELECT ST_AsMVT(mvtgeom.*, 'small_areas', 4096, 'geom') as mvt
        FROM mvtgeom
        WHERE geom IS NOT NULL;
      `;
    } else {
      // Nations or Local Authorities - use pre-aggregated tables (FAST!)
      const columns = lodLevel === 'nation' 
        ? 'lookups_nation' 
        : 'lookups_local_authority, lookups_nation';
      
      // Optimized query - filter FIRST with spatial index, then transform
      query = `
        WITH filtered AS (
          SELECT geom, ${columns},
                 air_quality, congestion, dampness, diet_change,
                 excess_cold, excess_heat, hassle_costs, noise,
                 physical_activity, road_repairs, road_safety, sum
          FROM ${tableName}
          WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        ),
        mvtgeom AS (
          SELECT 
            ST_AsMVTGeom(
              ST_Transform(geom, 3857),
              ST_TileEnvelope(${zoom}, ${tileX}, ${tileY}),
              4096, 256, true
            ) AS geom,
            ${columns},
            air_quality, congestion, dampness, diet_change,
            excess_cold, excess_heat, hassle_costs, noise,
            physical_activity, road_repairs, road_safety, sum
          FROM filtered
        )
        SELECT ST_AsMVT(mvtgeom.*, 'small_areas', 4096, 'geom') as mvt
        FROM mvtgeom
        WHERE geom IS NOT NULL;
      `;
    }

    const result = await pool.query(query, [bounds[0], bounds[1], bounds[2], bounds[3]]);
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Tile generated in ${queryTime}ms (${lodLevel}, table: ${tableName})`);
    
    if (result.rows.length === 0 || !result.rows[0].mvt) {
      res.status(204).send();
      return;
    }

    const mvt = result.rows[0].mvt;
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.send(mvt);
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ Error generating tile after ${errorTime}ms:`, error.message);
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
  return [lon1, lat2, lon2, lat1];
}

/**
 * API endpoint to search for areas by name or code
 * Searches across small areas, local authorities, and nations
 * GET /api/search-areas?q=query
 */
app.get('/api/search-areas', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  try {
    const searchPattern = `%${q}%`;
    const exactPattern = `${q}%`;
    
    // Search small areas
    const smallAreasQuery = `
      SELECT
        small_area as id,
        small_area as name,
        lookups_local_authority,
        lookups_nation,
        urban_rural,
        area_type_display,
        'small_area' as type,
        CASE 
          WHEN LOWER(small_area) LIKE LOWER($2) THEN 1
          ELSE 3
        END as rank
      FROM small_areas
      WHERE LOWER(small_area) LIKE LOWER($1)
      LIMIT 10
    `;
    
    // Search local authorities
    const localAuthQuery = `
      SELECT DISTINCT
        lookups_local_authority as id,
        lookups_local_authority as name,
        lookups_local_authority,
        lookups_nation,
        NULL as urban_rural,
        NULL as area_type_display,
        'local_authority' as type,
        CASE 
          WHEN LOWER(lookups_local_authority) LIKE LOWER($2) THEN 1
          ELSE 2
        END as rank
      FROM small_areas
      WHERE LOWER(lookups_local_authority) LIKE LOWER($1)
      LIMIT 10
    `;
    
    // Search nations
    const nationsQuery = `
      SELECT DISTINCT
        lookups_nation as id,
        lookups_nation as name,
        NULL as lookups_local_authority,
        lookups_nation,
        NULL as urban_rural,
        NULL as area_type_display,
        'nation' as type,
        CASE 
          WHEN LOWER(lookups_nation) LIKE LOWER($2) THEN 1
          ELSE 2
        END as rank
      FROM small_areas
      WHERE LOWER(lookups_nation) LIKE LOWER($1)
      LIMIT 4
    `;
    
    // Execute all queries in parallel
    const [smallAreasResult, localAuthResult, nationsResult] = await Promise.all([
      pool.query(smallAreasQuery, [searchPattern, exactPattern]),
      pool.query(localAuthQuery, [searchPattern, exactPattern]),
      pool.query(nationsQuery, [searchPattern, exactPattern])
    ]);
    
    // Combine and sort results
    const allResults = [
      ...nationsResult.rows,
      ...localAuthResult.rows,
      ...smallAreasResult.rows
    ].sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.name.localeCompare(b.name);
    }).slice(0, 20);
    
    res.json(allResults);
  } catch (error) {
    console.error('Error searching areas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get a random area (small area, LA, or nation)
 * GET /api/random-area
 */
app.get('/api/random-area', async (req, res) => {
  try {
    // Randomly select type (60% LA, 40% nation - no small areas)
    const rand = Math.random();
    let query;
    
    if (rand < 0.6) {
      // Random local authority
      query = `
        SELECT
          la as id,
          la as name,
          la as lookups_local_authority,
          nation as lookups_nation,
          NULL as urban_rural,
          NULL as area_type_display,
          'local_authority' as type
        FROM (
          SELECT DISTINCT lookups_local_authority as la, lookups_nation as nation
          FROM small_areas
          WHERE lookups_local_authority IS NOT NULL
        ) distinct_las
        ORDER BY RANDOM()
        LIMIT 1
      `;
    } else {
      // Random nation
      query = `
        SELECT
          nation as id,
          nation as name,
          NULL as lookups_local_authority,
          nation as lookups_nation,
          NULL as urban_rural,
          NULL as area_type_display,
          'nation' as type
        FROM (
          SELECT DISTINCT lookups_nation as nation
          FROM small_areas
          WHERE lookups_nation IS NOT NULL
        ) distinct_nations
        ORDER BY RANDOM()
        LIMIT 1
      `;
    }
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No areas found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching random area:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get data for a specific small area
 */
app.get('/api/area-data/:small_area', async (req, res) => {
  const { small_area } = req.params;
  
  try {
    const query = `
      SELECT 
        small_area,
        lookups_local_authority,
        lookups_nation,
        urban_rural,
        area_type_display,
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
 * API endpoint to get heatmap data - OPTIMIZED single field
 * GET /api/heatmap-data/:field/:lod
 * Returns: { "area_id": value, "area_id2": value2, ... }
 */
app.get('/api/heatmap-data/:field/:lod', async (req, res) => {
  const { field, lod } = req.params;
  
  const allowedFields = [
    'air_quality', 'congestion', 'dampness', 'diet_change',
    'excess_cold', 'excess_heat', 'hassle_costs', 'noise',
    'physical_activity', 'road_repairs', 'road_safety', 'sum'
  ];
  
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field name' });
  }
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          lookups_nation as id,
          ${field} as value
        FROM nations_aggregated
        WHERE lookups_nation IS NOT NULL
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          lookups_local_authority as id,
          ${field} as value
        FROM local_authorities_aggregated
        WHERE lookups_local_authority IS NOT NULL
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          small_area as id,
          urban_rural,
          area_type_display,
          ${field} as value
        FROM small_areas_standardized
        WHERE small_area IS NOT NULL
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query);
    const elapsed = Date.now() - startTime;
    
    // Convert to simple lookup: { "id": value, ... }
    const dataMap = {};
    result.rows.forEach(row => {
      dataMap[row.id] = row.value;
    });
    
    console.log(`📊 Heatmap: ${field}/${lod} (${result.rows.length} rows in ${elapsed}ms)`);
    
    res.json(dataMap);
  } catch (error) {
    console.error('Error getting heatmap data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get min/max values for a field
 */
app.get('/api/field-stats/:field', async (req, res) => {
  const { field } = req.params;
  
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
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ${field}) as p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ${field}) as p50,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${field}) as p75
      FROM small_areas_standardized
      WHERE ${field} IS NOT NULL
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting field stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get category-grouped data (Health & Wellbeing, Housing Comfort, Road Mobility)
 * GET /api/category-data/:lod
 * LOD options: nation, region, area
 */
app.get('/api/category-data/:lod', async (req, res) => {
  const { lod } = req.params;
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          lookups_nation as id,
          lookups_nation as name,
          health_wellbeing,
          air_quality,
          physical_activity,
          noise,
          housing_comfort,
          dampness,
          excess_cold,
          excess_heat,
          road_mobility,
          congestion,
          road_safety
        FROM nations_aggregated_joined
        ORDER BY lookups_nation
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          lookups_local_authority as id,
          lookups_local_authority as name,
          lookups_nation,
          health_wellbeing,
          air_quality,
          physical_activity,
          noise,
          housing_comfort,
          dampness,
          excess_cold,
          excess_heat,
          road_mobility,
          congestion,
          road_safety
        FROM local_authorities_aggregated_joined
        ORDER BY lookups_local_authority
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          small_area as id,
          small_area as name,
          lookups_local_authority,
          lookups_nation,
          urban_rural,
          area_type_display,
          health_wellbeing,
          air_quality,
          physical_activity,
          noise,
          housing_comfort,
          dampness,
          excess_cold,
          excess_heat,
          road_mobility,
          congestion,
          road_safety
        FROM small_areas_aggregated_joined
        ORDER BY small_area
        LIMIT 10000
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query);
    const elapsed = Date.now() - startTime;
    
    console.log(`📦 Category data: ${lod} (${result.rows.length} rows in ${elapsed}ms)`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting category data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API endpoint to get specific category data with range filter
 * GET /api/category/:category/:lod?min=0.5&max=0.8
 * Category options: health_wellbeing, housing_comfort, road_mobility
 */
app.get('/api/category/:category/:lod', async (req, res) => {
  const { category, lod } = req.params;
  const { min, max } = req.query;
  
  const allowedCategories = ['health_wellbeing', 'housing_comfort', 'road_mobility'];
  
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category. Use: health_wellbeing, housing_comfort, or road_mobility' });
  }
  
  try {
    let tableName;
    let idField;
    
    if (lod === 'nation') {
      tableName = 'nations_aggregated_joined';
      idField = 'lookups_nation';
    } else if (lod === 'region') {
      tableName = 'local_authorities_aggregated_joined';
      idField = 'lookups_local_authority';
    } else if (lod === 'area') {
      tableName = 'small_areas_aggregated_joined';
      idField = 'small_area';
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    let whereClause = '';
    const params = [];
    
    if (min !== undefined && max !== undefined) {
      whereClause = `WHERE ${category} BETWEEN $1 AND $2`;
      params.push(parseFloat(min), parseFloat(max));
    } else if (min !== undefined) {
      whereClause = `WHERE ${category} >= $1`;
      params.push(parseFloat(min));
    } else if (max !== undefined) {
      whereClause = `WHERE ${category} <= $1`;
      params.push(parseFloat(max));
    }
    
    const query = `
      SELECT 
        ${idField} as id,
        ${idField} as name,
        ${category} as value,
        ${category === 'health_wellbeing' ? 'air_quality, physical_activity, noise' : ''}
        ${category === 'housing_comfort' ? 'dampness, excess_cold, excess_heat' : ''}
        ${category === 'road_mobility' ? 'congestion, road_safety' : ''}
      FROM ${tableName}
      ${whereClause}
      ORDER BY ${category} DESC
      ${lod === 'area' ? 'LIMIT 1000' : ''}
    `;
    
    const startTime = Date.now();
    const result = await pool.query(query, params);
    const elapsed = Date.now() - startTime;
    
    console.log(`🎯 Category filter: ${category}/${lod} (${result.rows.length} rows in ${elapsed}ms)`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting category data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * TimescaleDB Time-Series APIs
 */

/**
 * Get time-series data for a specific year and LOD
 * GET /api/timeseries/:lod/:year
 */
app.get('/api/timeseries/:lod/:year', async (req, res) => {
  const { lod, year } = req.params;
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          lookups_nation as id,
          lookups_nation as name,
          time_year as year,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM nations_timeseries
        WHERE time_year = $1
        ORDER BY lookups_nation
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          lookups_local_authority as id,
          lookups_local_authority as name,
          lookups_nation,
          time_year as year,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM local_authorities_timeseries
        WHERE time_year = $1
        ORDER BY lookups_local_authority
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          small_area as id,
          small_area as name,
          lookups_local_authority,
          lookups_nation,
          urban_rural,
          area_type_display,
          time_year as year,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM small_areas_timeseries
        WHERE time_year = $1
        ORDER BY small_area
        LIMIT 10000
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query, [parseInt(year)]);
    const elapsed = Date.now() - startTime;
    
    console.log(`📅 Timeseries: ${lod}/${year} (${result.rows.length} rows in ${elapsed}ms)`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting timeseries data:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get time-series data for a specific area/region across all years
 * GET /api/timeseries/:lod/area/:id
 */
app.get('/api/timeseries/:lod/area/:id', async (req, res) => {
  const { lod, id } = req.params;
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          time_year as year,
          lookups_nation as name,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM nations_timeseries
        WHERE lookups_nation = $1
        ORDER BY time_year
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          time_year as year,
          lookups_local_authority as name,
          lookups_nation,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM local_authorities_timeseries
        WHERE lookups_local_authority = $1
        ORDER BY time_year
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          time_year as year,
          small_area as name,
          lookups_local_authority,
          lookups_nation,
          health_wellbeing,
          housing_comfort,
          road_mobility,
          air_quality, physical_activity, noise,
          dampness, excess_cold, excess_heat,
          congestion, road_safety
        FROM small_areas_timeseries
        WHERE small_area = $1
        ORDER BY time_year
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query, [id]);
    const elapsed = Date.now() - startTime;
    
    console.log(`📊 Timeseries trend: ${lod}/${id} (${result.rows.length} years in ${elapsed}ms)`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting timeseries trend:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get time-series data for a specific category across year range
 * GET /api/timeseries/:lod/category/:category?startYear=2025&endYear=2050
 */
app.get('/api/timeseries/:lod/category/:category', async (req, res) => {
  const { lod, category } = req.params;
  const { startYear, endYear } = req.query;
  
  const allowedCategories = ['health_wellbeing', 'housing_comfort', 'road_mobility'];
  
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category. Use: health_wellbeing, housing_comfort, or road_mobility' });
  }
  
  const start = startYear ? parseInt(startYear) : 2025;
  const end = endYear ? parseInt(endYear) : 2050;
  
  try {
    let query;
    
    if (lod === 'nation') {
      query = `
        SELECT 
          time_year as year,
          lookups_nation as name,
          ${category}
        FROM nations_timeseries
        WHERE time_year BETWEEN $1 AND $2
        ORDER BY time_year, lookups_nation
      `;
    } else if (lod === 'region') {
      query = `
        SELECT 
          time_year as year,
          lookups_local_authority as name,
          lookups_nation,
          ${category}
        FROM local_authorities_timeseries
        WHERE time_year BETWEEN $1 AND $2
        ORDER BY time_year, lookups_local_authority
      `;
    } else if (lod === 'area') {
      query = `
        SELECT 
          time_year as year,
          small_area as name,
          urban_rural,
          area_type_display,
          ${category}
        FROM small_areas_timeseries
        WHERE time_year BETWEEN $1 AND $2
        ORDER BY time_year, small_area
        LIMIT 100000
      `;
    } else {
      return res.status(400).json({ error: 'Invalid LOD. Use: nation, region, or area' });
    }
    
    const startTime = Date.now();
    const result = await pool.query(query, [start, end]);
    const elapsed = Date.now() - startTime;
    
    console.log(`📈 Category timeseries: ${category}/${lod} (${start}-${end}) (${result.rows.length} rows in ${elapsed}ms)`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting category timeseries:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Unified ECCI Server running on http://localhost:${PORT}`);
  console.log(`📦 PMTiles: http://localhost:${PORT}/tiles/{file}`);
  console.log(`🗺️  Vector Tiles (PostGIS): http://localhost:${PORT}/tiles/{layer}/{z}/{x}/{y}.pbf`);
  console.log(`🔍 Search Areas: http://localhost:${PORT}/api/search-areas?q={query}`);
  console.log(`🎲 Random Area: http://localhost:${PORT}/api/random-area`);
  console.log(`📊 Area Data: http://localhost:${PORT}/api/area-data/{small_area}`);
  console.log(`🔥 Heatmap Data: http://localhost:${PORT}/api/heatmap-data/{field}/{lod}`);
  console.log(`📈 Field Stats: http://localhost:${PORT}/api/field-stats/{field}`);
  console.log(`📦 Category Data: http://localhost:${PORT}/api/category-data/{lod}`);
  console.log(`🎯 Category Filter: http://localhost:${PORT}/api/category/{category}/{lod}?min=X&max=Y`);
  console.log(`\n⏰ TimescaleDB Time-Series APIs:`);
  console.log(`📅 Year Data: http://localhost:${PORT}/api/timeseries/{lod}/{year}`);
  console.log(`📊 Area Trend: http://localhost:${PORT}/api/timeseries/{lod}/area/{id}`);
  console.log(`📈 Category Trend: http://localhost:${PORT}/api/timeseries/{lod}/category/{category}?startYear=X&endYear=Y`);
  console.log(`📁 Tiles directory: ${path.join(__dirname, 'tiles')}\n`);
});
