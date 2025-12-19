-- ============================================
-- TimescaleDB Continuous Aggregates (Optional Performance Boost)
-- ============================================
-- Purpose: Pre-compute aggregated views for faster queries
-- Run this AFTER populate-timeseries-data.sql

-- ============================================
-- Continuous Aggregate: 5-year averages for nations
-- ============================================

CREATE MATERIALIZED VIEW nations_5year_avg
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket(5, time_year) AS bucket_year,
  lookups_nation,
  AVG(health_wellbeing) AS avg_health_wellbeing,
  AVG(housing_comfort) AS avg_housing_comfort,
  AVG(road_mobility) AS avg_road_mobility,
  AVG(air_quality) AS avg_air_quality,
  AVG(physical_activity) AS avg_physical_activity,
  AVG(noise) AS avg_noise,
  AVG(dampness) AS avg_dampness,
  AVG(excess_cold) AS avg_excess_cold,
  AVG(excess_heat) AS avg_excess_heat,
  AVG(congestion) AS avg_congestion,
  AVG(road_safety) AS avg_road_safety
FROM nations_timeseries
GROUP BY bucket_year, lookups_nation;



-- ============================================
-- Continuous Aggregate: 5-year averages for local authorities
-- ============================================

CREATE MATERIALIZED VIEW local_authorities_5year_avg
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket(5, time_year) AS bucket_year,
  lookups_local_authority,
  lookups_nation,
  AVG(health_wellbeing) AS avg_health_wellbeing,
  AVG(housing_comfort) AS avg_housing_comfort,
  AVG(road_mobility) AS avg_road_mobility,
  AVG(air_quality) AS avg_air_quality,
  AVG(physical_activity) AS avg_physical_activity,
  AVG(noise) AS avg_noise,
  AVG(dampness) AS avg_dampness,
  AVG(excess_cold) AS avg_excess_cold,
  AVG(excess_heat) AS avg_excess_heat,
  AVG(congestion) AS avg_congestion,
  AVG(road_safety) AS avg_road_safety
FROM local_authorities_timeseries
GROUP BY bucket_year, lookups_local_authority, lookups_nation;



-- ============================================
-- Add refresh policies (auto-update aggregates)
-- ============================================

SELECT add_continuous_aggregate_policy('nations_5year_avg',
  start_offset => NULL,
  end_offset => NULL,
  schedule_interval => INTERVAL '1 day'
);

SELECT add_continuous_aggregate_policy('local_authorities_5year_avg',
  start_offset => NULL,
  end_offset => NULL,
  schedule_interval => INTERVAL '1 day'
);



