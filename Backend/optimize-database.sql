-- Database optimization for faster tile generation
-- Run this once to create pre-aggregated tables and indexes

-- ============================================
-- PART 1: Create indexes FIRST (for faster aggregation)
-- ============================================

-- Lookup field indexes for faster joins (CRITICAL for aggregation speed!)
CREATE INDEX IF NOT EXISTS small_areas_standardized_nation_idx ON small_areas_standardized (lookups_nation);
CREATE INDEX IF NOT EXISTS small_areas_standardized_la_idx ON small_areas_standardized (lookups_local_authority);

-- Spatial indexes on original tables (if not already created)
CREATE INDEX IF NOT EXISTS nations_geom_idx ON nations USING GIST (geom);
CREATE INDEX IF NOT EXISTS local_authorities_geom_idx ON local_authorities USING GIST (geom);
CREATE INDEX IF NOT EXISTS small_areas_standardized_geom_idx ON small_areas_standardized USING GIST (geom);

-- Analyze to update statistics before aggregation
ANALYZE nations;
ANALYZE local_authorities;
ANALYZE small_areas_standardized;

-- ============================================
-- PART 2: Create pre-aggregated tables
-- ============================================

-- Drop existing materialized views if they exist
DROP MATERIALIZED VIEW IF EXISTS nations_aggregated CASCADE;
DROP MATERIALIZED VIEW IF EXISTS local_authorities_aggregated CASCADE;

-- Create aggregated nations table (3-4 rows instead of 46k aggregations)
-- This should take ~10-20 seconds with proper indexes
CREATE MATERIALIZED VIEW nations_aggregated AS
SELECT 
  n.lookups_nation,
  n.geom,
  AVG(sa.air_quality) as air_quality,
  AVG(sa.congestion) as congestion,
  AVG(sa.dampness) as dampness,
  AVG(sa.diet_change) as diet_change,
  AVG(sa.excess_cold) as excess_cold,
  AVG(sa.excess_heat) as excess_heat,
  AVG(sa.hassle_costs) as hassle_costs,
  AVG(sa.noise) as noise,
  AVG(sa.physical_activity) as physical_activity,
  AVG(sa.road_repairs) as road_repairs,
  AVG(sa.road_safety) as road_safety,
  AVG(sa.sum) as sum
FROM nations n
LEFT JOIN small_areas_standardized sa ON sa.lookups_nation = n.lookups_nation
GROUP BY n.lookups_nation, n.geom;



-- Create aggregated local authorities table (~380 rows instead of 46k aggregations)
-- This should take ~30-60 seconds with proper indexes
CREATE MATERIALIZED VIEW local_authorities_aggregated AS
SELECT 
  la.lookups_local_authority,
  la.lookups_nation,
  la.geom,
  AVG(sa.air_quality) as air_quality,
  AVG(sa.congestion) as congestion,
  AVG(sa.dampness) as dampness,
  AVG(sa.diet_change) as diet_change,
  AVG(sa.excess_cold) as excess_cold,
  AVG(sa.excess_heat) as excess_heat,
  AVG(sa.hassle_costs) as hassle_costs,
  AVG(sa.noise) as noise,
  AVG(sa.physical_activity) as physical_activity,
  AVG(sa.road_repairs) as road_repairs,
  AVG(sa.road_safety) as road_safety,
  AVG(sa.sum) as sum
FROM local_authorities la
LEFT JOIN small_areas_standardized sa ON sa.lookups_local_authority = la.lookups_local_authority
GROUP BY la.lookups_local_authority, la.lookups_nation, la.geom;



-- ============================================
-- PART 3: Create spatial indexes on aggregated tables
-- ============================================

-- Spatial indexes on aggregated tables
CREATE INDEX nations_aggregated_geom_idx ON nations_aggregated USING GIST (geom);
CREATE INDEX local_authorities_aggregated_geom_idx ON local_authorities_aggregated USING GIST (geom);

-- Analyze aggregated tables
ANALYZE nations_aggregated;
ANALYZE local_authorities_aggregated;



-- ============================================
-- PART 3: Show statistics
-- ============================================

-- Show row counts
SELECT 'nations_aggregated' as table_name, COUNT(*) as row_count FROM nations_aggregated
UNION ALL
SELECT 'local_authorities_aggregated', COUNT(*) FROM local_authorities_aggregated
UNION ALL
SELECT 'small_areas_standardized', COUNT(*) FROM small_areas_standardized;

-- Show table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('nations', 'local_authorities', 'small_areas_standardized', 'nations_aggregated', 'local_authorities_aggregated')
ORDER BY tablename;

-- Show index information
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes 
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public' 
  AND tablename IN ('nations', 'local_authorities', 'small_areas_standardized', 'nations_aggregated', 'local_authorities_aggregated')
ORDER BY tablename, indexname;

