-- ============================================
-- Regular Materialized Views (Aggregates Alternative)
-- ============================================
-- Purpose: Pre-compute aggregated views for faster queries
-- Run this AFTER populate-timeseries-data.sql
-- Note: These are regular materialized views, not TimescaleDB continuous aggregates
-- (Integer-based hypertables don't support continuous aggregates)

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS nations_5year_avg CASCADE;
DROP MATERIALIZED VIEW IF EXISTS local_authorities_5year_avg CASCADE;

-- ============================================
-- Materialized View: 5-year averages for nations
-- ============================================

CREATE MATERIALIZED VIEW nations_5year_avg AS
SELECT 
  (time_year / 5) * 5 AS bucket_year,
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
GROUP BY bucket_year, lookups_nation
ORDER BY bucket_year, lookups_nation;

CREATE INDEX ON nations_5year_avg (bucket_year);
CREATE INDEX ON nations_5year_avg (lookups_nation);

\echo 'Nations 5-year materialized view created'

-- ============================================
-- Materialized View: 5-year averages for local authorities
-- ============================================

CREATE MATERIALIZED VIEW local_authorities_5year_avg AS
SELECT 
  (time_year / 5) * 5 AS bucket_year,
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
GROUP BY bucket_year, lookups_local_authority, lookups_nation
ORDER BY bucket_year, lookups_local_authority;

CREATE INDEX ON local_authorities_5year_avg (bucket_year);
CREATE INDEX ON local_authorities_5year_avg (lookups_local_authority);
CREATE INDEX ON local_authorities_5year_avg (lookups_nation);

\echo 'Local authorities 5-year materialized view created'

-- ============================================
-- Verify the views
-- ============================================

SELECT 'nations_5year_avg' AS view_name, COUNT(*) AS total_rows FROM nations_5year_avg
UNION ALL
SELECT 'local_authorities_5year_avg', COUNT(*) FROM local_authorities_5year_avg;

\echo ''
\echo 'Materialized views setup complete!'
\echo 'Note: Run REFRESH MATERIALIZED VIEW to update when data changes:'
\echo '  REFRESH MATERIALIZED VIEW nations_5year_avg;'
\echo '  REFRESH MATERIALIZED VIEW local_authorities_5year_avg;'
