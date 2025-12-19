-- Create standardized table with Z-scores for better visualization
-- Z-score formula: (value - mean) / stddev

-- Drop existing table if it exists
DROP TABLE IF EXISTS small_areas_standardized;

-- Create new table with standardized values
CREATE TABLE small_areas_standardized AS
WITH stats AS (
  -- Calculate mean and standard deviation for each field
  SELECT
    AVG(air_quality) AS air_quality_mean,
    STDDEV(air_quality) AS air_quality_stddev,
    AVG(congestion) AS congestion_mean,
    STDDEV(congestion) AS congestion_stddev,
    AVG(dampness) AS dampness_mean,
    STDDEV(dampness) AS dampness_stddev,
    AVG(diet_change) AS diet_change_mean,
    STDDEV(diet_change) AS diet_change_stddev,
    AVG(excess_cold) AS excess_cold_mean,
    STDDEV(excess_cold) AS excess_cold_stddev,
    AVG(excess_heat) AS excess_heat_mean,
    STDDEV(excess_heat) AS excess_heat_stddev,
    AVG(hassle_costs) AS hassle_costs_mean,
    STDDEV(hassle_costs) AS hassle_costs_stddev,
    AVG(noise) AS noise_mean,
    STDDEV(noise) AS noise_stddev,
    AVG(physical_activity) AS physical_activity_mean,
    STDDEV(physical_activity) AS physical_activity_stddev,
    AVG(road_repairs) AS road_repairs_mean,
    STDDEV(road_repairs) AS road_repairs_stddev,
    AVG(road_safety) AS road_safety_mean,
    STDDEV(road_safety) AS road_safety_stddev,
    AVG(sum) AS sum_mean,
    STDDEV(sum) AS sum_stddev
  FROM small_areas
)
SELECT
  sa.small_area,
  sa.lookups_local_authority,
  sa.lookups_nation,
  sa.geom,
  -- Standardized (Z-score) values
  CASE WHEN s.air_quality_stddev > 0 
    THEN (sa.air_quality - s.air_quality_mean) / s.air_quality_stddev 
    ELSE 0 END AS air_quality,
  CASE WHEN s.congestion_stddev > 0 
    THEN (sa.congestion - s.congestion_mean) / s.congestion_stddev 
    ELSE 0 END AS congestion,
  CASE WHEN s.dampness_stddev > 0 
    THEN (sa.dampness - s.dampness_mean) / s.dampness_stddev 
    ELSE 0 END AS dampness,
  CASE WHEN s.diet_change_stddev > 0 
    THEN (sa.diet_change - s.diet_change_mean) / s.diet_change_stddev 
    ELSE 0 END AS diet_change,
  CASE WHEN s.excess_cold_stddev > 0 
    THEN (sa.excess_cold - s.excess_cold_mean) / s.excess_cold_stddev 
    ELSE 0 END AS excess_cold,
  CASE WHEN s.excess_heat_stddev > 0 
    THEN (sa.excess_heat - s.excess_heat_mean) / s.excess_heat_stddev 
    ELSE 0 END AS excess_heat,
  CASE WHEN s.hassle_costs_stddev > 0 
    THEN (sa.hassle_costs - s.hassle_costs_mean) / s.hassle_costs_stddev 
    ELSE 0 END AS hassle_costs,
  CASE WHEN s.noise_stddev > 0 
    THEN (sa.noise - s.noise_mean) / s.noise_stddev 
    ELSE 0 END AS noise,
  CASE WHEN s.physical_activity_stddev > 0 
    THEN (sa.physical_activity - s.physical_activity_mean) / s.physical_activity_stddev 
    ELSE 0 END AS physical_activity,
  CASE WHEN s.road_repairs_stddev > 0 
    THEN (sa.road_repairs - s.road_repairs_mean) / s.road_repairs_stddev 
    ELSE 0 END AS road_repairs,
  CASE WHEN s.road_safety_stddev > 0 
    THEN (sa.road_safety - s.road_safety_mean) / s.road_safety_stddev 
    ELSE 0 END AS road_safety,
  CASE WHEN s.sum_stddev > 0 
    THEN (sa.sum - s.sum_mean) / s.sum_stddev 
    ELSE 0 END AS sum
FROM small_areas sa
CROSS JOIN stats s;

-- Create spatial index on geometry
CREATE INDEX small_areas_standardized_geom_idx ON small_areas_standardized USING GIST(geom);

-- Create index on lookup fields for faster aggregation
CREATE INDEX small_areas_standardized_la_idx ON small_areas_standardized(lookups_local_authority);
CREATE INDEX small_areas_standardized_nation_idx ON small_areas_standardized(lookups_nation);

-- Verify the standardization
SELECT 
  'air_quality' as field,
  AVG(air_quality) as mean_should_be_near_0,
  STDDEV(air_quality) as stddev_should_be_near_1,
  MIN(air_quality) as min_zscore,
  MAX(air_quality) as max_zscore
FROM small_areas_standardized
UNION ALL
SELECT 
  'congestion',
  AVG(congestion),
  STDDEV(congestion),
  MIN(congestion),
  MAX(congestion)
FROM small_areas_standardized
UNION ALL
SELECT 
  'sum',
  AVG(sum),
  STDDEV(sum),
  MIN(sum),
  MAX(sum)
FROM small_areas_standardized;

-- Show sample data
SELECT 
  small_area,
  lookups_local_authority,
  air_quality,
  congestion,
  dampness,
  sum
FROM small_areas_standardized
LIMIT 10;
