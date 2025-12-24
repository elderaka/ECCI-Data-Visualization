# TimescaleDB Setup Guide for pgAdmin

This guide walks you through setting up TimescaleDB time-series data (2025-2050) in PostgreSQL using pgAdmin.

---

## 📋 Prerequisites

1. **PostgreSQL installed** with pgAdmin 4
2. **TimescaleDB extension installed** on your PostgreSQL server
   - Download from: https://www.timescale.com/download
   - Or install via: `sudo apt-get install timescaledb-postgresql-15` (Linux)
   - Windows: Use the TimescaleDB installer

---

## 🚀 Step-by-Step Instructions

### **Step 1: Install TimescaleDB Extension (If Not Already Installed)**

If you haven't installed the TimescaleDB extension on your PostgreSQL server:

#### Windows (Using Installer):
1. Download TimescaleDB from: https://www.timescale.com/download
2. Run the installer and select your PostgreSQL version
3. Restart PostgreSQL service

#### Via Command Line (Alternative):
```powershell
# Add to postgresql.conf
shared_preload_libraries = 'timescaledb'

# Restart PostgreSQL
Restart-Service postgresql-x64-15  # Adjust version number
```

---

### **Step 2: Run SQL Files in pgAdmin**

Open **pgAdmin 4** and follow these steps:

#### **A. Connect to Your Database**
1. In pgAdmin, expand **Servers** → **PostgreSQL 15** → **Databases**
2. Right-click on **ecci** database
3. Select **Query Tool**

---

#### **B. Run File #1: Setup TimescaleDB Tables**

1. In the Query Tool, click **Open File** button (folder icon)
2. Navigate to: `d:\Websites\ECCI\Backend\setup-timescaledb.sql`
3. Click **Open**
4. Click **Execute/Run** button (▶️ or F5)

**Expected Output:**
```
TimescaleDB extension enabled successfully
Dropped existing time-series tables
Nations time-series table created
Local authorities time-series table created
Small areas time-series table created
Nations hypertable created (5-year chunks)
Local authorities hypertable created (5-year chunks)
Small areas hypertable created (5-year chunks)
Indexes created successfully
```

**⏱️ Estimated Time:** 5-10 seconds

---

#### **C. Run File #2: Populate Time-Series Data (2025-2050)**

1. Open a **new Query Tool** tab (right-click database → Query Tool)
2. Click **Open File** → `d:\Websites\ECCI\Backend\populate-timeseries-data.sql`
3. Click **Execute/Run** (▶️ or F5)

**Expected Output:**
```
Nations time-series data populated (2025-2050)
Local authorities time-series data populated (2025-2050)
Small areas time-series data populated (2025-2050) - This may take a few minutes...

table_name                    | total_rows | min_year | max_year
------------------------------|------------|----------|----------
nations_timeseries            | 104        | 2025     | 2050
local_authorities_timeseries  | 9880       | 2025     | 2050
small_areas_timeseries        | 1196000    | 2025     | 2050
```

**⏱️ Estimated Time:** 
- Nations: ~1 second
- Local Authorities: ~10 seconds
- Small Areas: **2-5 minutes** (creating ~1.2M rows)

**💡 Tip:** You can see progress in the bottom-right status bar of pgAdmin.

---

#### **D. Run File #3: Create Continuous Aggregates (Optional)**

This step is **optional** but recommended for faster queries on aggregated data.

1. Open a **new Query Tool** tab
2. Click **Open File** → `d:\Websites\ECCI\Backend\create-continuous-aggregates.sql`
3. Click **Execute/Run** (▶️ or F5)

**Expected Output:**
```
Nations 5-year continuous aggregate created
Local authorities 5-year continuous aggregate created
Continuous aggregate policies added
TimescaleDB continuous aggregates setup complete!
```

**⏱️ Estimated Time:** 10-20 seconds

---

### **Step 3: Verify Data**

Run this query in pgAdmin to verify the data was created successfully:

```sql
-- Check row counts
SELECT 'nations_timeseries' AS table_name, COUNT(*) AS total_rows 
FROM nations_timeseries
UNION ALL
SELECT 'local_authorities_timeseries', COUNT(*) 
FROM local_authorities_timeseries
UNION ALL
SELECT 'small_areas_timeseries', COUNT(*) 
FROM small_areas_timeseries;

-- Sample data for England across different years
SELECT time_year, lookups_nation,
       ROUND(health_wellbeing::numeric, 2) AS health_wellbeing,
       ROUND(housing_comfort::numeric, 2) AS housing_comfort,
       ROUND(road_mobility::numeric, 2) AS road_mobility
FROM nations_timeseries
WHERE lookups_nation = 'England' 
  AND time_year IN (2025, 2030, 2035, 2040, 2045, 2050)
ORDER BY time_year;
```

**Expected Output:**
```
time_year | lookups_nation | health_wellbeing | housing_comfort | road_mobility
----------|----------------|------------------|-----------------|---------------
2025      | England        | 0.15             | 0.23            | 0.18
2030      | England        | 0.18             | 0.26            | 0.22
2035      | England        | 0.23             | 0.31            | 0.28
2040      | England        | 0.28             | 0.36            | 0.34
2045      | England        | 0.34             | 0.42            | 0.41
2050      | England        | 0.41             | 0.49            | 0.49
```

---

## 🎯 What Was Created

### **Three Time-Series Tables:**
1. **`nations_timeseries`** - 104 rows (4 nations × 26 years)
2. **`local_authorities_timeseries`** - ~9,880 rows (380 LAs × 26 years)
3. **`small_areas_timeseries`** - ~1.2M rows (46k areas × 26 years)

### **Data Includes:**
- **Years:** 2025 to 2050 (26 years)
- **Category Metrics:** health_wellbeing, housing_comfort, road_mobility
- **Individual Metrics:** air_quality, physical_activity, noise, dampness, excess_cold, excess_heat, congestion, road_safety
- **Trends:** Each metric has realistic year-over-year growth with random variation

---

## 📡 New API Endpoints

After setup, these APIs are available:

### **1. Get Data for Specific Year**
```
GET http://localhost:3000/api/timeseries/nation/2030
GET http://localhost:3000/api/timeseries/region/2040
GET http://localhost:3000/api/timeseries/area/2050
```

### **2. Get Time-Series Trend for Specific Area**
```
GET http://localhost:3000/api/timeseries/nation/area/England
GET http://localhost:3000/api/timeseries/region/area/Birmingham
```

### **3. Get Category Trends Across Years**
```
GET http://localhost:3000/api/timeseries/nation/category/housing_comfort?startYear=2025&endYear=2050
GET http://localhost:3000/api/timeseries/region/category/health_wellbeing?startYear=2030&endYear=2040
```

---

## 🔧 Troubleshooting

### **Error: "extension timescaledb does not exist"**
- Install TimescaleDB on your PostgreSQL server first
- Add `shared_preload_libraries = 'timescaledb'` to postgresql.conf
- Restart PostgreSQL service

### **Error: "out of memory"**
- The small_areas table creates 1.2M rows - this is normal
- Ensure PostgreSQL has at least 4GB RAM allocated
- You can skip small areas by commenting out Step 3 in `populate-timeseries-data.sql`

### **Slow Performance**
- Make sure indexes were created (check Step 5 in setup-timescaledb.sql)
- Run `VACUUM ANALYZE nations_timeseries;` after data population
- Consider using continuous aggregates for faster queries

---

## 📊 Query Examples

```sql
-- Get all data for year 2030
SELECT * FROM nations_timeseries WHERE time_year = 2030;

-- Get trend for England from 2025-2050
SELECT time_year, health_wellbeing, housing_comfort, road_mobility
FROM nations_timeseries
WHERE lookups_nation = 'England'
ORDER BY time_year;

-- Compare housing comfort across nations in 2040
SELECT lookups_nation, housing_comfort
FROM nations_timeseries
WHERE time_year = 2040
ORDER BY housing_comfort DESC;

-- Get average housing comfort per decade
SELECT 
  FLOOR(time_year / 10) * 10 AS decade,
  lookups_nation,
  AVG(housing_comfort) AS avg_housing_comfort
FROM nations_timeseries
GROUP BY decade, lookups_nation
ORDER BY decade, lookups_nation;
```

---

## ✅ Summary

You now have:
- ✅ TimescaleDB extension enabled
- ✅ Three hypertable time-series tables (nations, local authorities, small areas)
- ✅ 26 years of projected data (2025-2050) with realistic trends
- ✅ Optimized indexes for fast queries
- ✅ Three new API endpoints for time-series queries

**Total Data:** ~1.2M rows across all tables
**Disk Usage:** Approximately 500MB-1GB (with indexes)

---

**Questions or issues?** Check the Messages tab in pgAdmin for detailed error messages.
