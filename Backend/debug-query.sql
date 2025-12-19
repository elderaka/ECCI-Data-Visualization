-- Check if spatial indexes exist and are being used
\d nations_aggregated
\d local_authorities_aggregated

-- Test query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT 
  ST_AsMVTGeom(
    ST_Transform(geom, 3857),
    ST_Transform(ST_MakeEnvelope(-10, 50, 2, 60, 4326), 3857),
    4096, 256, true
  ) AS geom,
  lookups_nation,
  air_quality, congestion, dampness, diet_change,
  excess_cold, excess_heat, hassle_costs, noise,
  physical_activity, road_repairs, road_safety, sum
FROM nations_aggregated
WHERE geom && ST_MakeEnvelope(-10, 50, 2, 60, 4326);

-- Check if index exists
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('nations_aggregated', 'local_authorities_aggregated');

-- Force vacuum and analyze
VACUUM ANALYZE nations_aggregated;
VACUUM ANALYZE local_authorities_aggregated;
