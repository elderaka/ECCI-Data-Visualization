-- ECCI PostGIS Database Setup Script
-- Run this after creating the 'ecci' database and enabling PostGIS extension

-- 1. Create the database (run this as postgres superuser):
-- CREATE DATABASE ecci;
-- \c ecci
-- CREATE EXTENSION postgis;

-- 2. Import geometry files using ogr2ogr (run in PowerShell):
-- ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=ecci user=postgres password=postgres" -nln small_areas -overwrite d:\Websites\ECCI\PMTiles\small_areas_wgs84.gpkg
-- ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=ecci user=postgres password=postgres" -nln local_authorities -overwrite d:\Websites\ECCI\PMTiles\local_authorities_wgs84.gpkg
-- ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=ecci user=postgres password=postgres" -nln nations -overwrite d:\Websites\ECCI\PMTiles\nation_wgs84.gpkg

-- 3. Add data columns to small_areas table
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS air_quality DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS congestion DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS dampness DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS diet_change DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS excess_cold DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS excess_heat DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS hassle_costs DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS noise DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS physical_activity DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS road_repairs DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS road_safety DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS sum DOUBLE PRECISION;

-- 4. Create temporary table for CSV import
CREATE TEMP TABLE level1_temp (
    small_area TEXT,
    air_quality TEXT,
    congestion TEXT,
    dampness TEXT,
    diet_change TEXT,
    excess_cold TEXT,
    excess_heat TEXT,
    hassle_costs TEXT,
    noise TEXT,
    physical_activity TEXT,
    road_repairs TEXT,
    road_safety TEXT,
    sum TEXT
);

-- 5. Import CSV (run in psql or use COPY command):
-- \copy level1_temp FROM 'd:/Websites/ECCI/PMTiles/Level_1.csv' WITH (FORMAT csv, HEADER true);

-- 6. Update small_areas with data from CSV (converting NA to NULL)
UPDATE small_areas sa
SET 
    air_quality = CASE WHEN lt.air_quality = 'NA' THEN NULL ELSE lt.air_quality::DOUBLE PRECISION END,
    congestion = CASE WHEN lt.congestion = 'NA' THEN NULL ELSE lt.congestion::DOUBLE PRECISION END,
    dampness = CASE WHEN lt.dampness = 'NA' THEN NULL ELSE lt.dampness::DOUBLE PRECISION END,
    diet_change = CASE WHEN lt.diet_change = 'NA' THEN NULL ELSE lt.diet_change::DOUBLE PRECISION END,
    excess_cold = CASE WHEN lt.excess_cold = 'NA' THEN NULL ELSE lt.excess_cold::DOUBLE PRECISION END,
    excess_heat = CASE WHEN lt.excess_heat = 'NA' THEN NULL ELSE lt.excess_heat::DOUBLE PRECISION END,
    hassle_costs = CASE WHEN lt.hassle_costs = 'NA' THEN NULL ELSE lt.hassle_costs::DOUBLE PRECISION END,
    noise = CASE WHEN lt.noise = 'NA' THEN NULL ELSE lt.noise::DOUBLE PRECISION END,
    physical_activity = CASE WHEN lt.physical_activity = 'NA' THEN NULL ELSE lt.physical_activity::DOUBLE PRECISION END,
    road_repairs = CASE WHEN lt.road_repairs = 'NA' THEN NULL ELSE lt.road_repairs::DOUBLE PRECISION END,
    road_safety = CASE WHEN lt.road_safety = 'NA' THEN NULL ELSE lt.road_safety::DOUBLE PRECISION END,
    sum = CASE WHEN lt.sum = 'NA' THEN NULL ELSE lt.sum::DOUBLE PRECISION END
FROM level1_temp lt
WHERE sa.small_area = lt.small_area;

-- 7. Create spatial indexes for performance
CREATE INDEX IF NOT EXISTS small_areas_geom_idx ON small_areas USING GIST(geom);
CREATE INDEX IF NOT EXISTS small_areas_sa_idx ON small_areas(small_area);
CREATE INDEX IF NOT EXISTS local_authorities_geom_idx ON local_authorities USING GIST(geom);
CREATE INDEX IF NOT EXISTS nations_geom_idx ON nations USING GIST(geom);

-- 8. Analyze tables for query optimization
ANALYZE small_areas;
ANALYZE local_authorities;
ANALYZE nations;

-- 9. Verify data import
SELECT COUNT(*) as total_small_areas FROM small_areas;
SELECT COUNT(*) as small_areas_with_data FROM small_areas WHERE air_quality IS NOT NULL;
SELECT 
    MIN(excess_heat) as min_heat,
    MAX(excess_heat) as max_heat,
    AVG(excess_heat) as avg_heat
FROM small_areas 
WHERE excess_heat IS NOT NULL;
