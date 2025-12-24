# Create Standardized Data Table

This guide explains how to create the standardized (Z-score) table for better heatmap visualization.

## What is Standardization?

Standardization converts raw values to **Z-scores** using the formula:
```
Z = (value - mean) / standard_deviation
```

**Benefits:**
- Values show how many standard deviations away from the average
- Typical range: -3 to +3 (99.7% of data falls within this range)
- Makes subtle differences visible even when raw values are clustered
- Perfect for heatmap visualization with centered color scales

## Run the SQL Script

### Option 1: Using psql command line
```bash
cd Backend
psql -U postgres -d ecci -f create-standardized-table.sql
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Connect to your `ecci` database
3. Open Query Tool (Tools → Query Tool)
4. Open file: `create-standardized-table.sql`
5. Click Execute (F5)

### Option 3: Using Node.js
```bash
cd Backend
node -e "const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'ecci', password: 'admin123', port: 5432 }); const sql = fs.readFileSync('create-standardized-table.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Standardized table created!'); pool.end(); }).catch(err => { console.error('❌ Error:', err); pool.end(); });"
```

## Verify the Results

The script automatically runs verification queries that show:

1. **Mean (should be ≈ 0)**: Z-scores are centered around zero
2. **StdDev (should be ≈ 1)**: Standard deviation normalized to 1
3. **Min/Max Z-scores**: Shows the range of standardized values
4. **Sample data**: First 10 rows to verify

Example output:
```
    field      | mean_should_be_near_0 | stddev_should_be_near_1 | min_zscore | max_zscore
---------------+-----------------------+-------------------------+------------+------------
 air_quality   |      0.0000000123     |        1.0000000000     |   -2.876   |    4.123
 congestion    |     -0.0000000089     |        0.9999999999     |   -3.234   |    2.987
 sum           |      0.0000000045     |        1.0000000001     |   -2.543   |    3.876
```

## What Was Created

The script creates:

1. **Table**: `small_areas_standardized`
   - Same structure as `small_areas`
   - All numeric fields converted to Z-scores
   - Geometry and lookup fields preserved

2. **Indexes**:
   - Spatial index on `geom` for fast map queries
   - Index on `lookups_local_authority` for aggregation
   - Index on `lookups_nation` for aggregation

## Backend Changes

The backend now automatically uses `small_areas_standardized`:
- Vector tiles pull from standardized data
- Aggregations (nation/LA level) use standardized values
- Field stats return Z-score ranges

## Frontend Changes

The heatmap now displays Z-scores:
- **Blue**: Below average (negative Z-scores)
- **Green**: Average (Z-score ≈ 0)
- **Red**: Above average (positive Z-scores)

Debug labels show Z-score values × 100 (e.g., "-125" = Z-score of -1.25)

## Troubleshooting

**Error: `table "small_areas" does not exist`**
- Run `setup-database.sql` first to create the original table

**Error: `permission denied`**
- Make sure you're running as PostgreSQL user with CREATE TABLE permissions

**Mean is not near 0**
- This is expected if you filter data (WHERE clauses)
- The mean is 0 for the entire dataset, not subsets

## Re-running the Script

The script is idempotent - it will drop and recreate the table each time.
Safe to run multiple times if data changes.

