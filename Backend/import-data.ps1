# ECCI Database Import Script
# This script imports GeoPackage and CSV data into PostGIS

$DB_HOST = "localhost"
$DB_NAME = "ecci"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"  # Change this to your password

$BASE_DIR = "d:\Websites\ECCI"
$PMTILES_DIR = "$BASE_DIR\PMTiles"

Write-Host "===== ECCI PostGIS Data Import =====" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL with PostGIS extension" -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ PostgreSQL found" -ForegroundColor Green

# Check if ogr2ogr is installed
Write-Host "Checking ogr2ogr (GDAL) installation..." -ForegroundColor Yellow
$ogrPath = Get-Command ogr2ogr -ErrorAction SilentlyContinue
if (-not $ogrPath) {
    Write-Host "ERROR: ogr2ogr not found in PATH" -ForegroundColor Red
    Write-Host "Please install GDAL/OGR" -ForegroundColor Red
    Write-Host "Download from: https://gdal.org/download.html" -ForegroundColor Yellow
    Write-Host "Or use OSGeo4W: https://trac.osgeo.org/osgeo4w/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ ogr2ogr found" -ForegroundColor Green
Write-Host ""

# Step 1: Create database and enable PostGIS
Write-Host "Step 1: Creating database and enabling PostGIS..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
& psql -h $DB_HOST -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
& psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"
Write-Host "✓ Database created" -ForegroundColor Green
Write-Host ""

# Step 2: Import geometry files
Write-Host "Step 2: Importing geometry files with ogr2ogr..." -ForegroundColor Yellow

Write-Host "  Importing small_areas..." -ForegroundColor Cyan
& ogr2ogr -f "PostgreSQL" `
    "PG:host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" `
    -nln small_areas -overwrite `
    "$PMTILES_DIR\small_areas_wgs84.gpkg"
Write-Host "  ✓ small_areas imported" -ForegroundColor Green

Write-Host "  Importing local_authorities..." -ForegroundColor Cyan
& ogr2ogr -f "PostgreSQL" `
    "PG:host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" `
    -nln local_authorities -overwrite `
    "$PMTILES_DIR\local_authorities_wgs84.gpkg"
Write-Host "  ✓ local_authorities imported" -ForegroundColor Green

Write-Host "  Importing nations..." -ForegroundColor Cyan
& ogr2ogr -f "PostgreSQL" `
    "PG:host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" `
    -nln nations -overwrite `
    "$PMTILES_DIR\nation_wgs84.gpkg"
Write-Host "  ✓ nations imported" -ForegroundColor Green
Write-Host ""

# Step 3: Add data columns
Write-Host "Step 3: Adding data columns to small_areas table..." -ForegroundColor Yellow
$addColumnsSQL = @"
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS air_quality DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS congestion DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS dampness DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS diet_change DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS excess_cold DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS excess_heat DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS hassle_costs DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS noise DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS physical_activity DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS road_repairs DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS road_safety DOUBLE PRECISION;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS sum DOUBLE PRECISION;
"@
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c $addColumnsSQL
Write-Host "✓ Columns added" -ForegroundColor Green
Write-Host ""

# Step 4: Create temp table and import CSV
Write-Host "Step 4: Importing Level_1.csv data..." -ForegroundColor Yellow
$createTempSQL = @"
DROP TABLE IF EXISTS level1_temp;
CREATE TABLE level1_temp (
    small_area TEXT,
    air_quality TEXT,
    congestion TEXT,
    dampness TEXT,
    diet_change TEXT,
    excess_cold TEXT,
    excess_heat TEXT,
    hassle_costs TEXT,
    noise TEXT,
    physical_activity TEXT,
    road_repairs TEXT,
    road_safety TEXT,
    sum TEXT
);
"@
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c $createTempSQL

# Import CSV using \copy
$csvPath = "$PMTILES_DIR\Level_1.csv"
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\copy level1_temp FROM '$csvPath' WITH (FORMAT csv, HEADER true);"
Write-Host "✓ CSV data imported to temp table" -ForegroundColor Green
Write-Host ""

# Step 5: Join CSV data to geometry table
Write-Host "Step 5: Joining data to small_areas table (converting NA to NULL)..." -ForegroundColor Yellow
$updateSQL = @"
UPDATE small_areas sa
SET 
    air_quality = CASE WHEN lt.air_quality = 'NA' THEN NULL ELSE lt.air_quality::DOUBLE PRECISION END,
    congestion = CASE WHEN lt.congestion = 'NA' THEN NULL ELSE lt.congestion::DOUBLE PRECISION END,
    dampness = CASE WHEN lt.dampness = 'NA' THEN NULL ELSE lt.dampness::DOUBLE PRECISION END,
    diet_change = CASE WHEN lt.diet_change = 'NA' THEN NULL ELSE lt.diet_change::DOUBLE PRECISION END,
    excess_cold = CASE WHEN lt.excess_cold = 'NA' THEN NULL ELSE lt.excess_cold::DOUBLE PRECISION END,
    excess_heat = CASE WHEN lt.excess_heat = 'NA' THEN NULL ELSE lt.excess_heat::DOUBLE PRECISION END,
    hassle_costs = CASE WHEN lt.hassle_costs = 'NA' THEN NULL ELSE lt.hassle_costs::DOUBLE PRECISION END,
    noise = CASE WHEN lt.noise = 'NA' THEN NULL ELSE lt.noise::DOUBLE PRECISION END,
    physical_activity = CASE WHEN lt.physical_activity = 'NA' THEN NULL ELSE lt.physical_activity::DOUBLE PRECISION END,
    road_repairs = CASE WHEN lt.road_repairs = 'NA' THEN NULL ELSE lt.road_repairs::DOUBLE PRECISION END,
    road_safety = CASE WHEN lt.road_safety = 'NA' THEN NULL ELSE lt.road_safety::DOUBLE PRECISION END,
    sum = CASE WHEN lt.sum = 'NA' THEN NULL ELSE lt.sum::DOUBLE PRECISION END
FROM level1_temp lt
WHERE sa.small_area = lt.small_area;
"@
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c $updateSQL
Write-Host "✓ Data joined successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Create spatial indexes
Write-Host "Step 6: Creating spatial indexes..." -ForegroundColor Yellow
$indexSQL = @"
CREATE INDEX IF NOT EXISTS small_areas_geom_idx ON small_areas USING GIST(geom);
CREATE INDEX IF NOT EXISTS small_areas_sa_idx ON small_areas(small_area);
CREATE INDEX IF NOT EXISTS local_authorities_geom_idx ON local_authorities USING GIST(geom);
CREATE INDEX IF NOT EXISTS nations_geom_idx ON nations USING GIST(geom);
ANALYZE small_areas;
ANALYZE local_authorities;
ANALYZE nations;
"@
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c $indexSQL
Write-Host "✓ Indexes created" -ForegroundColor Green
Write-Host ""

# Step 7: Verify import
Write-Host "Step 7: Verifying data import..." -ForegroundColor Yellow
Write-Host ""
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_small_areas FROM small_areas;"
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as areas_with_data FROM small_areas WHERE air_quality IS NOT NULL;"
& psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT MIN(excess_heat) as min_heat, MAX(excess_heat) as max_heat, AVG(excess_heat)::numeric(10,2) as avg_heat FROM small_areas WHERE excess_heat IS NOT NULL;"
Write-Host ""

Write-Host "===== Import Complete! =====" -ForegroundColor Green
Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "Tables: small_areas, local_authorities, nations" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update password in Backend/server-postgis.js" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Test: http://localhost:3000/tiles/small_areas/10/512/340.pbf" -ForegroundColor White
Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD
