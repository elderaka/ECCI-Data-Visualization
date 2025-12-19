-- ============================================
-- Category-grouped views for data presentation
-- Purpose: Easier querying for UI display like "Housing Comfort from X to Y"
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS nations_aggregated_joined CASCADE;
DROP VIEW IF EXISTS local_authorities_aggregated_joined CASCADE;
DROP VIEW IF EXISTS small_areas_aggregated_joined CASCADE;

-- ============================================
-- NATIONS: Category-grouped view
-- ============================================
CREATE VIEW nations_aggregated_joined AS
SELECT 
  lookups_nation,
  geom,
  
  -- 🏥 Health & Wellbeing (average of 3 metrics)
  ROUND(CAST((COALESCE(air_quality, 0) + COALESCE(physical_activity, 0) + COALESCE(noise, 0)) / 
    NULLIF((CASE WHEN air_quality IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN physical_activity IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN noise IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as health_wellbeing,
  air_quality,
  physical_activity,
  noise,
  
  -- 🏠 Housing Comfort (average of 3 metrics)
  ROUND(CAST((COALESCE(dampness, 0) + COALESCE(excess_cold, 0) + COALESCE(excess_heat, 0)) / 
    NULLIF((CASE WHEN dampness IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_cold IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_heat IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as housing_comfort,
  dampness,
  excess_cold,
  excess_heat,
  
  -- 🛣️ Road Mobility (average of 2 metrics)
  ROUND(CAST((COALESCE(congestion, 0) + COALESCE(road_safety, 0)) / 
    NULLIF((CASE WHEN congestion IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN road_safety IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as road_mobility,
  congestion,
  road_safety,
  
  -- Other metrics
  diet_change,
  hassle_costs,
  road_repairs,
  sum
FROM nations_aggregated;


-- ============================================
-- LOCAL AUTHORITIES: Category-grouped view
-- ============================================
CREATE VIEW local_authorities_aggregated_joined AS
SELECT 
  lookups_local_authority,
  lookups_nation,
  geom,
  
  -- 🏥 Health & Wellbeing (average of 3 metrics)
  ROUND(CAST((COALESCE(air_quality, 0) + COALESCE(physical_activity, 0) + COALESCE(noise, 0)) / 
    NULLIF((CASE WHEN air_quality IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN physical_activity IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN noise IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as health_wellbeing,
  air_quality,
  physical_activity,
  noise,
  
  -- 🏠 Housing Comfort (average of 3 metrics)
  ROUND(CAST((COALESCE(dampness, 0) + COALESCE(excess_cold, 0) + COALESCE(excess_heat, 0)) / 
    NULLIF((CASE WHEN dampness IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_cold IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_heat IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as housing_comfort,
  dampness,
  excess_cold,
  excess_heat,
  
  -- 🛣️ Road Mobility (average of 2 metrics)
  ROUND(CAST((COALESCE(congestion, 0) + COALESCE(road_safety, 0)) / 
    NULLIF((CASE WHEN congestion IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN road_safety IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as road_mobility,
  congestion,
  road_safety,
  
  -- Other metrics
  diet_change,
  hassle_costs,
  road_repairs,
  sum
FROM local_authorities_aggregated;


-- ============================================
-- SMALL AREAS: Category-grouped view
-- ============================================
CREATE VIEW small_areas_aggregated_joined AS
SELECT 
  small_area,
  lookups_local_authority,
  lookups_nation,
  geom,
  
  -- 🏥 Health & Wellbeing (average of 3 metrics)
  ROUND(CAST((COALESCE(air_quality, 0) + COALESCE(physical_activity, 0) + COALESCE(noise, 0)) / 
    NULLIF((CASE WHEN air_quality IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN physical_activity IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN noise IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as health_wellbeing,
  air_quality,
  physical_activity,
  noise,
  
  -- 🏠 Housing Comfort (average of 3 metrics)
  ROUND(CAST((COALESCE(dampness, 0) + COALESCE(excess_cold, 0) + COALESCE(excess_heat, 0)) / 
    NULLIF((CASE WHEN dampness IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_cold IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN excess_heat IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as housing_comfort,
  dampness,
  excess_cold,
  excess_heat,
  
  -- 🛣️ Road Mobility (average of 2 metrics)
  ROUND(CAST((COALESCE(congestion, 0) + COALESCE(road_safety, 0)) / 
    NULLIF((CASE WHEN congestion IS NOT NULL THEN 1 ELSE 0 END + 
            CASE WHEN road_safety IS NOT NULL THEN 1 ELSE 0 END), 0) AS numeric), 2) as road_mobility,
  congestion,
  road_safety,
  
  -- Other metrics
  diet_change,
  hassle_costs,
  road_repairs,
  sum
FROM small_areas_standardized;


-- ============================================
-- Usage Examples
-- ============================================

-- Example 1: Get all Housing Comfort data for a specific nation
-- SELECT lookups_nation, housing_comfort, dampness, excess_cold, excess_heat
-- FROM nations_aggregated_joined
-- WHERE lookups_nation = 'England';

-- Example 2: Get Road Mobility metrics for local authorities
-- SELECT lookups_local_authority, road_mobility, congestion, road_safety
-- FROM local_authorities_aggregated_joined
-- ORDER BY road_mobility DESC
-- LIMIT 10;

-- Example 3: Compare categories
-- SELECT 
--   lookups_nation,
--   health_wellbeing,
--   housing_comfort,
--   road_mobility
-- FROM nations_aggregated_joined;
