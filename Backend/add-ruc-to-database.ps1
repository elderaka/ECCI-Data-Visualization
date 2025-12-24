# Add RUC Classification to PostgreSQL Database
# Run this script from PowerShell to add RUC columns to existing database

$dbName = "ecci"
$dbUser = "postgres"
$dbPassword = "admin123"
$dbHost = "localhost"
$dbPort = "5432"

$lookupsCsv = "d:/Websites/ECCI/dataset/lookups_with_classification.csv"
$sqlScript = "d:/Websites/ECCI/Backend/add-ruc-classification.sql"

Write-Host "[INFO] Adding RUC Classification to PostgreSQL..." -ForegroundColor Cyan

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $dbPassword

# Step 1: Add columns
Write-Host "`n[STEP 1] Adding columns..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS urban_rural TEXT;
ALTER TABLE small_areas ADD COLUMN IF NOT EXISTS area_type_display TEXT;
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to add columns" -ForegroundColor Red
    exit 1
}

# Step 2: Create temp table and import data
Write-Host "`n[STEP 2] Creating temp table..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
DROP TABLE IF EXISTS lookups_ruc_temp;
CREATE TABLE lookups_ruc_temp (
    small_area TEXT,
    population TEXT,
    households TEXT,
    local_authority TEXT,
    nation TEXT,
    urban_rural TEXT,
    area_type_display TEXT
);
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create temp table" -ForegroundColor Red
    exit 1
}

# Step 3: Import CSV data
Write-Host "`n[STEP 3] Importing lookups CSV..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "\copy lookups_ruc_temp FROM '$lookupsCsv' WITH (FORMAT csv, HEADER true);"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to import CSV" -ForegroundColor Red
    exit 1
}

# Step 4: Update small_areas table
Write-Host "`n[STEP 4] Updating small_areas with RUC data..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
UPDATE small_areas sa
SET 
    urban_rural = lt.urban_rural,
    area_type_display = lt.area_type_display
FROM lookups_ruc_temp lt
WHERE sa.small_area = lt.small_area;

DROP TABLE lookups_ruc_temp;
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to update table" -ForegroundColor Red
    exit 1
}

# Step 5: Create indexes
Write-Host "`n[STEP 5] Creating indexes..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
CREATE INDEX IF NOT EXISTS small_areas_urban_rural_idx ON small_areas(urban_rural);
CREATE INDEX IF NOT EXISTS small_areas_area_type_idx ON small_areas(area_type_display);
ANALYZE small_areas;
"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create indexes" -ForegroundColor Red
    exit 1
}

# Step 6: Verify
Write-Host "`n[STEP 6] Verifying data..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "
SELECT 
    'Total areas' as metric,
    COUNT(*) as count 
FROM small_areas
UNION ALL
SELECT 
    'Areas with RUC',
    COUNT(*) 
FROM small_areas 
WHERE urban_rural IS NOT NULL;

SELECT urban_rural, COUNT(*) as count
FROM small_areas
WHERE urban_rural IS NOT NULL
GROUP BY urban_rural
ORDER BY urban_rural;
"

Write-Host "`n[SUCCESS] RUC classification added successfully!" -ForegroundColor Green
Write-Host "`nNew columns available:" -ForegroundColor Cyan
Write-Host "  - urban_rural: Simple Urban/Rural flag" -ForegroundColor White
Write-Host "  - area_type_display: User-friendly description" -ForegroundColor White

# Clean up environment variable
Remove-Item Env:PGPASSWORD

