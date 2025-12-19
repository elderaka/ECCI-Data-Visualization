-- ============================================
-- TimescaleDB Setup for Time-Series Data (2025-2050)
-- ============================================
-- Purpose: Create time-series tables for category data with yearly projections
-- Run this FIRST before creating hypertables

-- Step 1: Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;



-- Step 2: Drop existing time-series tables if they exist
DROP TABLE IF EXISTS nations_timeseries CASCADE;
DROP TABLE IF EXISTS local_authorities_timeseries CASCADE;
DROP TABLE IF EXISTS small_areas_timeseries CASCADE;



-- ============================================
-- Step 3: Create time-series tables
-- ============================================

-- Nations Time Series (3-4 nations × 26 years = ~80-100 rows)
CREATE TABLE nations_timeseries (
  time_year INTEGER NOT NULL,
  lookups_nation TEXT NOT NULL,
  
  -- Geometry
  geom geometry(MultiPolygon, 4326),
  
  -- Category aggregates
  health_wellbeing DOUBLE PRECISION,
  housing_comfort DOUBLE PRECISION,
  road_mobility DOUBLE PRECISION,
  
  -- Individual metrics
  air_quality DOUBLE PRECISION,
  physical_activity DOUBLE PRECISION,
  noise DOUBLE PRECISION,
  dampness DOUBLE PRECISION,
  excess_cold DOUBLE PRECISION,
  excess_heat DOUBLE PRECISION,
  congestion DOUBLE PRECISION,
  road_safety DOUBLE PRECISION,
  
  -- Other metrics
  diet_change DOUBLE PRECISION,
  hassle_costs DOUBLE PRECISION,
  road_repairs DOUBLE PRECISION,
  sum DOUBLE PRECISION,
  
  PRIMARY KEY (time_year, lookups_nation)
);



-- Local Authorities Time Series (~380 LAs × 26 years = ~9,880 rows)
CREATE TABLE local_authorities_timeseries (
  time_year INTEGER NOT NULL,
  lookups_local_authority TEXT NOT NULL,
  lookups_nation TEXT,
  
  -- Geometry
  geom geometry(MultiPolygon, 4326),
  
  -- Category aggregates
  health_wellbeing DOUBLE PRECISION,
  housing_comfort DOUBLE PRECISION,
  road_mobility DOUBLE PRECISION,
  
  -- Individual metrics
  air_quality DOUBLE PRECISION,
  physical_activity DOUBLE PRECISION,
  noise DOUBLE PRECISION,
  dampness DOUBLE PRECISION,
  excess_cold DOUBLE PRECISION,
  excess_heat DOUBLE PRECISION,
  congestion DOUBLE PRECISION,
  road_safety DOUBLE PRECISION,
  
  -- Other metrics
  diet_change DOUBLE PRECISION,
  hassle_costs DOUBLE PRECISION,
  road_repairs DOUBLE PRECISION,
  sum DOUBLE PRECISION,
  
  PRIMARY KEY (time_year, lookups_local_authority)
);



-- Small Areas Time Series (~46k areas × 26 years = ~1.2M rows)
-- Note: This will be a large table, consider using only aggregated levels for time-series
CREATE TABLE small_areas_timeseries (
  time_year INTEGER NOT NULL,
  small_area TEXT NOT NULL,
  lookups_local_authority TEXT,
  lookups_nation TEXT,
  
  -- Geometry
  geom geometry(MultiPolygon, 4326),
  
  -- Category aggregates
  health_wellbeing DOUBLE PRECISION,
  housing_comfort DOUBLE PRECISION,
  road_mobility DOUBLE PRECISION,
  
  -- Individual metrics
  air_quality DOUBLE PRECISION,
  physical_activity DOUBLE PRECISION,
  noise DOUBLE PRECISION,
  dampness DOUBLE PRECISION,
  excess_cold DOUBLE PRECISION,
  excess_heat DOUBLE PRECISION,
  congestion DOUBLE PRECISION,
  road_safety DOUBLE PRECISION,
  
  -- Other metrics
  diet_change DOUBLE PRECISION,
  hassle_costs DOUBLE PRECISION,
  road_repairs DOUBLE PRECISION,
  sum DOUBLE PRECISION,
  
  PRIMARY KEY (time_year, small_area)
);



-- ============================================
-- Step 4: Convert to TimescaleDB Hypertables
-- ============================================

-- Convert nations table to hypertable (partitioned by year)
SELECT create_hypertable('nations_timeseries', 'time_year', 
  chunk_time_interval => 5,  -- 5-year chunks
  if_not_exists => TRUE
);



-- Convert local authorities table to hypertable
SELECT create_hypertable('local_authorities_timeseries', 'time_year', 
  chunk_time_interval => 5,  -- 5-year chunks
  if_not_exists => TRUE
);



-- Convert small areas table to hypertable
SELECT create_hypertable('small_areas_timeseries', 'time_year', 
  chunk_time_interval => 5,  -- 5-year chunks
  if_not_exists => TRUE
);



-- ============================================
-- Step 5: Create indexes for faster queries
-- ============================================

-- Nations indexes
CREATE INDEX idx_nations_ts_year ON nations_timeseries (time_year DESC);
CREATE INDEX idx_nations_ts_nation ON nations_timeseries (lookups_nation);
CREATE INDEX idx_nations_ts_geom ON nations_timeseries USING GIST (geom);

-- Local authorities indexes
CREATE INDEX idx_la_ts_year ON local_authorities_timeseries (time_year DESC);
CREATE INDEX idx_la_ts_la ON local_authorities_timeseries (lookups_local_authority);
CREATE INDEX idx_la_ts_nation ON local_authorities_timeseries (lookups_nation);
CREATE INDEX idx_la_ts_geom ON local_authorities_timeseries USING GIST (geom);

-- Small areas indexes
CREATE INDEX idx_sa_ts_year ON small_areas_timeseries (time_year DESC);
CREATE INDEX idx_sa_ts_area ON small_areas_timeseries (small_area);
CREATE INDEX idx_sa_ts_la ON small_areas_timeseries (lookups_local_authority);
CREATE INDEX idx_sa_ts_nation ON small_areas_timeseries (lookups_nation);
CREATE INDEX idx_sa_ts_geom ON small_areas_timeseries USING GIST (geom);



-- ============================================
-- Verify setup
-- ============================================

SELECT 
  hypertable_schema,
  hypertable_name,
  num_dimensions
FROM timescaledb_information.hypertables
WHERE hypertable_schema = 'public';


