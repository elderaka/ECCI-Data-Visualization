-- Drop and recreate as regular tables with proper indexes
DROP TABLE IF EXISTS nations_aggregated CASCADE;
DROP TABLE IF EXISTS local_authorities_aggregated CASCADE;

-- Create nations aggregated table
CREATE TABLE nations_aggregated AS
SELECT 
  n.lookups_nation,
  n.geom,
  ROUND(AVG(sa.air_quality)::numeric, 4) as air_quality,
  ROUND(AVG(sa.congestion)::numeric, 4) as congestion,
  ROUND(AVG(sa.dampness)::numeric, 4) as dampness,
  ROUND(AVG(sa.diet_change)::numeric, 4) as diet_change,
  ROUND(AVG(sa.excess_cold)::numeric, 4) as excess_cold,
  ROUND(AVG(sa.excess_heat)::numeric, 4) as excess_heat,
  ROUND(AVG(sa.hassle_costs)::numeric, 4) as hassle_costs,
  ROUND(AVG(sa.noise)::numeric, 4) as noise,
  ROUND(AVG(sa.physical_activity)::numeric, 4) as physical_activity,
  ROUND(AVG(sa.road_repairs)::numeric, 4) as road_repairs,
  ROUND(AVG(sa.road_safety)::numeric, 4) as road_safety,
  ROUND(AVG(sa.sum)::numeric, 4) as sum
FROM nations n
LEFT JOIN small_areas_standardized sa ON sa.lookups_nation = n.lookups_nation
GROUP BY n.lookups_nation, n.geom;

-- Create local authorities aggregated table
CREATE TABLE local_authorities_aggregated AS
SELECT 
  la.lookups_local_authority,
  la.lookups_nation,
  la.geom,
  ROUND(AVG(sa.air_quality)::numeric, 4) as air_quality,
  ROUND(AVG(sa.congestion)::numeric, 4) as congestion,
  ROUND(AVG(sa.dampness)::numeric, 4) as dampness,
  ROUND(AVG(sa.diet_change)::numeric, 4) as diet_change,
  ROUND(AVG(sa.excess_cold)::numeric, 4) as excess_cold,
  ROUND(AVG(sa.excess_heat)::numeric, 4) as excess_heat,
  ROUND(AVG(sa.hassle_costs)::numeric, 4) as hassle_costs,
  ROUND(AVG(sa.noise)::numeric, 4) as noise,
  ROUND(AVG(sa.physical_activity)::numeric, 4) as physical_activity,
  ROUND(AVG(sa.road_repairs)::numeric, 4) as road_repairs,
  ROUND(AVG(sa.road_safety)::numeric, 4) as road_safety,
  ROUND(AVG(sa.sum)::numeric, 4) as sum
FROM local_authorities la
LEFT JOIN small_areas_standardized sa ON sa.lookups_local_authority = la.lookups_local_authority
GROUP BY la.lookups_local_authority, la.lookups_nation, la.geom;

-- Add primary keys
ALTER TABLE nations_aggregated ADD PRIMARY KEY (lookups_nation);
ALTER TABLE local_authorities_aggregated ADD PRIMARY KEY (lookups_local_authority);

-- Create spatial indexes (THIS IS CRITICAL!)
CREATE INDEX nations_aggregated_geom_gist ON nations_aggregated USING GIST(geom);
CREATE INDEX local_authorities_aggregated_geom_gist ON local_authorities_aggregated USING GIST(geom);

-- Cluster tables by spatial index for better performance
CLUSTER nations_aggregated USING nations_aggregated_geom_gist;
CLUSTER local_authorities_aggregated USING local_authorities_aggregated_geom_gist;

-- Analyze tables
ANALYZE nations_aggregated;
ANALYZE local_authorities_aggregated;

-- Verify
SELECT 'nations_aggregated' as table_name, COUNT(*) as rows FROM nations_aggregated;
SELECT 'local_authorities_aggregated' as table_name, COUNT(*) as rows FROM local_authorities_aggregated;


