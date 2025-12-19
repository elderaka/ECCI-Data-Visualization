-- Add WGS84 geometry columns to aggregated tables
ALTER TABLE nations_aggregated 
  ADD COLUMN geom_4326 geometry(MultiPolygon, 4326),
  ADD COLUMN geom_27700 geometry(MultiPolygon, 27700);

ALTER TABLE local_authorities_aggregated 
  ADD COLUMN geom_4326 geometry(MultiPolygon, 4326),
  ADD COLUMN geom_27700 geometry(MultiPolygon, 27700);

-- Copy and transform geometries
UPDATE nations_aggregated SET 
  geom_27700 = geom,
  geom_4326 = ST_Transform(geom, 4326);

UPDATE local_authorities_aggregated SET 
  geom_27700 = geom,
  geom_4326 = ST_Transform(geom, 4326);

-- Create spatial indexes on WGS84 geometries (these are what tiles use)
CREATE INDEX idx_nations_agg_geom_4326 ON nations_aggregated USING GIST (geom_4326);
CREATE INDEX idx_local_authorities_agg_geom_4326 ON local_authorities_aggregated USING GIST (geom_4326);

-- Analyze tables to update statistics
ANALYZE nations_aggregated;
ANALYZE local_authorities_aggregated;

VACUUM ANALYZE nations_aggregated;
VACUUM ANALYZE local_authorities_aggregated;

SELECT 'Setup complete!' as status;
