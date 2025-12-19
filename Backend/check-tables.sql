-- Quick check of materialized view structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nations_aggregated'
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'local_authorities_aggregated'
ORDER BY ordinal_position;

-- Test query to see if data exists
SELECT COUNT(*) as nations_count FROM nations_aggregated;
SELECT COUNT(*) as la_count FROM local_authorities_aggregated;

-- Sample row from each
SELECT * FROM nations_aggregated LIMIT 1;
SELECT * FROM local_authorities_aggregated LIMIT 1;
