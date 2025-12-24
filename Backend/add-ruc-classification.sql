-- Add RUC Classification Columns to Existing Database
-- Run this if you already have the small_areas table populated

-- 1. Add new columns for RUC classification
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS urban_rural TEXT;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS area_type_display TEXT;

-- 2. Create temporary table for lookups import
CREATE TEMP TABLE lookups_ruc_temp (
    small_area TEXT,
    population TEXT,
    households TEXT,
    local_authority TEXT,
    nation TEXT,
    urban_rural TEXT,
    area_type_display TEXT
);

-- 3. Import lookups CSV (run in psql or use COPY command):
-- \copy lookups_ruc_temp FROM 'd:/Websites/ECCI/dataset/lookups_with_classification.csv' WITH (FORMAT csv, HEADER true);

-- 4. Update small_areas with RUC classification
UPDATE small_areas sa
SET 
    urban_rural = lt.urban_rural,
    area_type_display = lt.area_type_display
FROM lookups_ruc_temp lt
WHERE sa.small_area = lt.small_area;

-- 5. Also update lookups columns if they don't exist yet
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='small_areas' AND column_name='lookups_local_authority') THEN
        ALTER TABLE small_areas ADD COLUMN lookups_local_authority TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='small_areas' AND column_name='lookups_nation') THEN
        ALTER TABLE small_areas ADD COLUMN lookups_nation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='small_areas' AND column_name='population') THEN
        ALTER TABLE small_areas ADD COLUMN population INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='small_areas' AND column_name='households') THEN
        ALTER TABLE small_areas ADD COLUMN households INTEGER;
    END IF;
END $$;

UPDATE small_areas sa
SET 
    population = CASE WHEN lt.population = 'NA' THEN NULL ELSE lt.population::INTEGER END,
    households = CASE WHEN lt.households = 'NA' THEN NULL ELSE lt.households::INTEGER END,
    lookups_local_authority = lt.local_authority,
    lookups_nation = lt.nation
FROM lookups_ruc_temp lt
WHERE sa.small_area = lt.small_area
  AND sa.lookups_local_authority IS NULL; -- Only update if not already set

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS small_areas_urban_rural_idx ON small_areas(urban_rural);
CREATE INDEX IF NOT EXISTS small_areas_la_idx ON small_areas(lookups_local_authority);
CREATE INDEX IF NOT EXISTS small_areas_nation_idx ON small_areas(lookups_nation);

-- 7. Verify the update
SELECT 
    'Total small areas' as metric,
    COUNT(*) as count 
FROM small_areas
UNION ALL
SELECT 
    'Areas with RUC classification',
    COUNT(*) 
FROM small_areas 
WHERE urban_rural IS NOT NULL
UNION ALL
SELECT 
    'Areas with lookups data',
    COUNT(*) 
FROM small_areas 
WHERE lookups_local_authority IS NOT NULL;

-- 8. Show classification breakdown
SELECT 
    urban_rural,
    area_type_display,
    COUNT(*) as count
FROM small_areas
WHERE urban_rural IS NOT NULL
GROUP BY urban_rural, area_type_display
ORDER BY urban_rural, count DESC;

-- 9. Analyze table for query optimization
ANALYZE small_areas;

-- Done! You can now query by urban_rural or area_type_display
-- Example queries:

-- Get all urban areas near major cities:
-- SELECT * FROM small_areas WHERE area_type_display = 'Urban (near major city)' LIMIT 10;

-- Get summary by area type:
-- SELECT area_type_display, AVG(sum) as avg_benefit, COUNT(*) as num_areas
-- FROM small_areas 
-- WHERE sum IS NOT NULL
-- GROUP BY area_type_display
-- ORDER BY avg_benefit DESC;

-- Compare urban vs rural:
-- SELECT urban_rural, 
--        AVG(air_quality) as avg_air_quality,
--        AVG(physical_activity) as avg_physical_activity,
--        AVG(sum) as avg_total_benefit
-- FROM small_areas
-- GROUP BY urban_rural;
