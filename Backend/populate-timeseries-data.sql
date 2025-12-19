-- ============================================
-- Populate TimescaleDB Tables with 2025-2050 Projections
-- ============================================
-- Purpose: Generate realistic time-series data with trends and variations
-- Run this AFTER setup-timescaledb.sql

-- ============================================
-- Step 1: Populate Nations Time Series (2025-2050)
-- ============================================

INSERT INTO nations_timeseries (
  time_year, lookups_nation, geom,
  health_wellbeing, housing_comfort, road_mobility,
  air_quality, physical_activity, noise,
  dampness, excess_cold, excess_heat,
  congestion, road_safety,
  diet_change, hassle_costs, road_repairs, sum
)
SELECT 
  year_series.year AS time_year,
  n.lookups_nation,
  n.geom,
  
  -- Apply year-based trends to category aggregates
  -- Trend: gradual improvement over time with some random variation
  n.health_wellbeing * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.1 - 0.05)) AS health_wellbeing,
  n.housing_comfort * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.08 - 0.04)) AS housing_comfort,
  n.road_mobility * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.12 - 0.06)) AS road_mobility,
  
  -- Individual metrics with different trend rates
  n.air_quality * (1 + (year_series.year - 2025) * 0.020 + (random() * 0.1 - 0.05)) AS air_quality,
  n.physical_activity * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.08 - 0.04)) AS physical_activity,
  n.noise * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.1 - 0.05)) AS noise,
  n.dampness * (1 + (year_series.year - 2025) * 0.008 + (random() * 0.06 - 0.03)) AS dampness,
  n.excess_cold * (1 - (year_series.year - 2025) * 0.025 + (random() * 0.1 - 0.05)) AS excess_cold,  -- Decreasing (climate change)
  n.excess_heat * (1 + (year_series.year - 2025) * 0.035 + (random() * 0.15 - 0.075)) AS excess_heat,  -- Increasing (climate change)
  n.congestion * (1 + (year_series.year - 2025) * 0.022 + (random() * 0.12 - 0.06)) AS congestion,
  n.road_safety * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.1 - 0.05)) AS road_safety,
  
  n.diet_change * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.08 - 0.04)) AS diet_change,
  n.hassle_costs * (1 + (year_series.year - 2025) * 0.016 + (random() * 0.1 - 0.05)) AS hassle_costs,
  n.road_repairs * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.08 - 0.04)) AS road_repairs,
  n.sum * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.1 - 0.05)) AS sum
FROM 
  nations_aggregated_joined n
CROSS JOIN 
  generate_series(2025, 2050) AS year_series(year)
WHERE n.lookups_nation IS NOT NULL
ORDER BY year_series.year, n.lookups_nation;



-- ============================================
-- Step 2: Populate Local Authorities Time Series (2025-2050)
-- ============================================

INSERT INTO local_authorities_timeseries (
  time_year, lookups_local_authority, lookups_nation, geom,
  health_wellbeing, housing_comfort, road_mobility,
  air_quality, physical_activity, noise,
  dampness, excess_cold, excess_heat,
  congestion, road_safety,
  diet_change, hassle_costs, road_repairs, sum
)
SELECT 
  year_series.year AS time_year,
  la.lookups_local_authority,
  la.lookups_nation,
  la.geom,
  
  -- Apply year-based trends with regional variation
  la.health_wellbeing * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.12 - 0.06)) AS health_wellbeing,
  la.housing_comfort * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.10 - 0.05)) AS housing_comfort,
  la.road_mobility * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.15 - 0.075)) AS road_mobility,
  
  la.air_quality * (1 + (year_series.year - 2025) * 0.020 + (random() * 0.12 - 0.06)) AS air_quality,
  la.physical_activity * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.10 - 0.05)) AS physical_activity,
  la.noise * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.12 - 0.06)) AS noise,
  la.dampness * (1 + (year_series.year - 2025) * 0.008 + (random() * 0.08 - 0.04)) AS dampness,
  la.excess_cold * (1 - (year_series.year - 2025) * 0.025 + (random() * 0.12 - 0.06)) AS excess_cold,
  la.excess_heat * (1 + (year_series.year - 2025) * 0.035 + (random() * 0.18 - 0.09)) AS excess_heat,
  la.congestion * (1 + (year_series.year - 2025) * 0.022 + (random() * 0.15 - 0.075)) AS congestion,
  la.road_safety * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.12 - 0.06)) AS road_safety,
  
  la.diet_change * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.10 - 0.05)) AS diet_change,
  la.hassle_costs * (1 + (year_series.year - 2025) * 0.016 + (random() * 0.12 - 0.06)) AS hassle_costs,
  la.road_repairs * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.10 - 0.05)) AS road_repairs,
  la.sum * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.12 - 0.06)) AS sum
FROM 
  local_authorities_aggregated_joined la
CROSS JOIN 
  generate_series(2025, 2050) AS year_series(year)
WHERE la.lookups_local_authority IS NOT NULL
ORDER BY year_series.year, la.lookups_local_authority;



-- ============================================
-- Step 3: Populate Small Areas Time Series (2025-2050)
-- WARNING: This creates ~1.2M rows and may take several minutes
-- ============================================

-- Optional: Only populate if you need granular small area projections
-- Comment out if you want to skip this and only use aggregated levels

INSERT INTO small_areas_timeseries (
  time_year, small_area, lookups_local_authority, lookups_nation, geom,
  health_wellbeing, housing_comfort, road_mobility,
  air_quality, physical_activity, noise,
  dampness, excess_cold, excess_heat,
  congestion, road_safety,
  diet_change, hassle_costs, road_repairs, sum
)
SELECT 
  year_series.year AS time_year,
  sa.small_area,
  sa.lookups_local_authority,
  sa.lookups_nation,
  sa.geom,
  
  -- Apply year-based trends with local variation
  sa.health_wellbeing * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.15 - 0.075)) AS health_wellbeing,
  sa.housing_comfort * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.12 - 0.06)) AS housing_comfort,
  sa.road_mobility * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.18 - 0.09)) AS road_mobility,
  
  sa.air_quality * (1 + (year_series.year - 2025) * 0.020 + (random() * 0.15 - 0.075)) AS air_quality,
  sa.physical_activity * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.12 - 0.06)) AS physical_activity,
  sa.noise * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.15 - 0.075)) AS noise,
  sa.dampness * (1 + (year_series.year - 2025) * 0.008 + (random() * 0.10 - 0.05)) AS dampness,
  sa.excess_cold * (1 - (year_series.year - 2025) * 0.025 + (random() * 0.15 - 0.075)) AS excess_cold,
  sa.excess_heat * (1 + (year_series.year - 2025) * 0.035 + (random() * 0.20 - 0.10)) AS excess_heat,
  sa.congestion * (1 + (year_series.year - 2025) * 0.022 + (random() * 0.18 - 0.09)) AS congestion,
  sa.road_safety * (1 + (year_series.year - 2025) * 0.018 + (random() * 0.15 - 0.075)) AS road_safety,
  
  sa.diet_change * (1 + (year_series.year - 2025) * 0.012 + (random() * 0.12 - 0.06)) AS diet_change,
  sa.hassle_costs * (1 + (year_series.year - 2025) * 0.016 + (random() * 0.15 - 0.075)) AS hassle_costs,
  sa.road_repairs * (1 + (year_series.year - 2025) * 0.010 + (random() * 0.12 - 0.06)) AS road_repairs,
  sa.sum * (1 + (year_series.year - 2025) * 0.015 + (random() * 0.15 - 0.075)) AS sum
FROM 
  small_areas_aggregated_joined sa
CROSS JOIN 
  generate_series(2025, 2050) AS year_series(year)
WHERE sa.small_area IS NOT NULL
ORDER BY year_series.year, sa.small_area;



-- ============================================
-- Step 4: Verify data population
-- ============================================



SELECT 'nations_timeseries' AS table_name, COUNT(*) AS total_rows, 
       MIN(time_year) AS min_year, MAX(time_year) AS max_year
FROM nations_timeseries
UNION ALL
SELECT 'local_authorities_timeseries', COUNT(*), 
       MIN(time_year), MAX(time_year)
FROM local_authorities_timeseries
UNION ALL
SELECT 'small_areas_timeseries', COUNT(*), 
       MIN(time_year), MAX(time_year)
FROM small_areas_timeseries;

-- Show sample data for England in 2025, 2035, 2050
SELECT time_year, lookups_nation, 
       ROUND(health_wellbeing::numeric, 2) AS health_wellbeing,
       ROUND(housing_comfort::numeric, 2) AS housing_comfort,
       ROUND(road_mobility::numeric, 2) AS road_mobility
FROM nations_timeseries
WHERE lookups_nation = 'England' AND time_year IN (2025, 2035, 2050)
ORDER BY time_year;


