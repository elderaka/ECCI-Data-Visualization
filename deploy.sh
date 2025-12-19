#!/bin/bash

# ECCI EC2 Deployment Script
# Run this script on your EC2 instance after SSH connection

set -e  # Exit on error

echo "================================"
echo "ECCI Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="ecci"
DB_USER="ecci_user"
DB_PASSWORD="${DB_PASSWORD:-changeme123}"  # Use env var or default
APP_DIR="/home/ubuntu/ecci"

echo -e "${YELLOW}Step 1: Update system packages${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}Step 2: Install Node.js 20.x${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

echo -e "${YELLOW}Step 3: Install PostgreSQL and PostGIS${NC}"
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib postgis
    echo -e "${GREEN}PostgreSQL installed${NC}"
else
    echo -e "${GREEN}PostgreSQL already installed${NC}"
fi

echo -e "${YELLOW}Step 4: Install additional tools${NC}"
sudo apt install -y nginx gdal-bin
sudo npm install -g pm2

echo -e "${YELLOW}Step 5: Setup PostgreSQL database${NC}"
sudo -u postgres psql <<EOF
-- Drop existing database if needed (comment out for production)
-- DROP DATABASE IF EXISTS $DB_NAME;
-- DROP USER IF EXISTS $DB_USER;

-- Create database and user
CREATE DATABASE $DB_NAME;
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

echo -e "${GREEN}Database created successfully${NC}"

echo -e "${YELLOW}Step 6: Verify application files${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    echo "Please upload the project files using WinSCP to /home/ubuntu/ecci"
    exit 1
else
    echo -e "${GREEN}Application directory exists${NC}"
fi

cd $APP_DIR

echo -e "${YELLOW}Step 7: Install dependencies${NC}"
cd Backend
npm install
cd ../Frontend
npm install

echo -e "${YELLOW}Step 8: Import geographic data${NC}"
cd $APP_DIR/PMTiles

# Check if .gpkg files exist
if [ -f "nations_wgs84.gpkg" ]; then
    echo "Importing nations..."
    ogr2ogr -f PostgreSQL PG:"host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" \
      nations_wgs84.gpkg -nln nations -overwrite
fi

if [ -f "local_authorities_wgs84.gpkg" ]; then
    echo "Importing local authorities..."
    ogr2ogr -f PostgreSQL PG:"host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" \
      local_authorities_wgs84.gpkg -nln local_authorities -overwrite
fi

if [ -f "small_areas_wgs84.gpkg" ]; then
    echo "Importing small areas..."
    ogr2ogr -f PostgreSQL PG:"host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" \
      small_areas_wgs84.gpkg -nln small_areas -overwrite
fi

echo -e "${YELLOW}Step 9: Import CSV data${NC}"
cd $APP_DIR/Backend

# Create SQL import script
cat > /tmp/import-csv.sql <<'EOSQL'
-- Create temporary table for CSV import
CREATE TEMP TABLE temp_level1 (
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

-- Import CSV
\COPY temp_level1 FROM 'tiles/Level_1.csv' WITH (FORMAT csv, HEADER true);

-- Update small_areas table with data
UPDATE small_areas sa
SET
    air_quality = CASE WHEN t.air_quality = 'NA' THEN NULL ELSE t.air_quality::numeric END,
    congestion = CASE WHEN t.congestion = 'NA' THEN NULL ELSE t.congestion::numeric END,
    dampness = CASE WHEN t.dampness = 'NA' THEN NULL ELSE t.dampness::numeric END,
    diet_change = CASE WHEN t.diet_change = 'NA' THEN NULL ELSE t.diet_change::numeric END,
    excess_cold = CASE WHEN t.excess_cold = 'NA' THEN NULL ELSE t.excess_cold::numeric END,
    excess_heat = CASE WHEN t.excess_heat = 'NA' THEN NULL ELSE t.excess_heat::numeric END,
    hassle_costs = CASE WHEN t.hassle_costs = 'NA' THEN NULL ELSE t.hassle_costs::numeric END,
    noise = CASE WHEN t.noise = 'NA' THEN NULL ELSE t.noise::numeric END,
    physical_activity = CASE WHEN t.physical_activity = 'NA' THEN NULL ELSE t.physical_activity::numeric END,
    road_repairs = CASE WHEN t.road_repairs = 'NA' THEN NULL ELSE t.road_repairs::numeric END,
    road_safety = CASE WHEN t.road_safety = 'NA' THEN NULL ELSE t.road_safety::numeric END,
    sum = CASE WHEN t.sum = 'NA' THEN NULL ELSE t.sum::numeric END
FROM temp_level1 t
WHERE sa.small_area = t.small_area;
EOSQL

PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f /tmp/import-csv.sql

echo -e "${GREEN}Data import completed${NC}"

echo -e "${YELLOW}Step 10: Update backend configuration${NC}"
cd $APP_DIR/Backend

# Update server-postgis.js with correct credentials
sed -i "s/password: 'admin123'/password: '$DB_PASSWORD'/g" server-postgis.js

echo -e "${YELLOW}Step 11: Build frontend${NC}"
cd $APP_DIR/Frontend

# Update API URLs to use relative paths
sed -i "s|http://localhost:3001|''|g" src/heatmap-control.ts

npm run build

echo -e "${YELLOW}Step 12: Setup Nginx${NC}"
sudo tee /etc/nginx/sites-available/ecci > /dev/null <<'NGINX_CONF'
server {
    listen 80;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript application/x-protobuf;

    # Frontend static files
    location / {
        root /home/ubuntu/ecci/Frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # PostGIS API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Vector tiles
    location /tiles/ {
        proxy_pass http://localhost:3001/tiles/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PMTiles server
    location /pmtiles/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONF

sudo ln -sf /etc/nginx/sites-available/ecci /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo -e "${YELLOW}Step 13: Create logs directory${NC}"
mkdir -p $APP_DIR/logs

echo -e "${YELLOW}Step 14: Start services with PM2${NC}"
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Services running:"
pm2 status
echo ""
echo -e "Frontend: ${GREEN}http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)${NC}"
echo -e "PMTiles: ${GREEN}http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000${NC}"
echo -e "PostGIS: ${GREEN}http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check service status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all services"
echo "  sudo nginx -t       - Test nginx config"
echo ""
