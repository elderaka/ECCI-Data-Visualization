-- Force PostgreSQL to use spatial indexes by setting query planner hints
-- This makes spatial queries always use the GIST index

-- Increase work_mem for better spatial query performance (per connection)
ALTER DATABASE ecci SET work_mem = '256MB';

-- Force index scans over sequential scans for spatial queries
ALTER DATABASE ecci SET enable_seqscan = off;

-- Set random_page_cost lower (assumes SSD, makes index scans more attractive)
ALTER DATABASE ecci SET random_page_cost = 1.1;

-- Reconnect to apply settings
\c ecci

-- Show current settings
SHOW work_mem;
SHOW enable_seqscan;
SHOW random_page_cost;

-- Update table statistics to help query planner
ANALYZE nations_aggregated;
ANALYZE local_authorities_aggregated;
ANALYZE small_areas_standardized;


