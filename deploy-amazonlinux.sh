#!/bin/bash

# ECCI EC2 Deployment Script for Amazon Linux 2023
# Run this script on your EC2 instance after SSH connection

set -e  # Exit on error

echo "================================"
echo "ECCI Deployment Script"
echo "Amazon Linux 2023"
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
DB_PASSWORD="visdatpakrifky"  # Use env var or default
APP_DIR="/home/ec2-user/ecci"

echo -e "${YELLOW}Step 1: Update system packages${NC}"
sudo dnf update -y

echo -e "${YELLOW}Step 2: Install Node.js 20.x${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
    echo -e "${GREEN}Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

echo -e "${YELLOW}Step 3: Install Docker${NC}"
if ! command -v docker &> /dev/null; then
    sudo dnf install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    echo -e "${GREEN}Docker installed${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
    sudo systemctl start docker
fi

echo -e "${YELLOW}Step 4: Setup PostgreSQL with PostGIS using Docker${NC}"
# Remove existing container if it exists
if sudo docker ps -a | grep -q ecci-postgres; then
    echo "Removing existing PostgreSQL container..."
    sudo docker stop ecci-postgres 2>/dev/null || true
    sudo docker rm ecci-postgres 2>/dev/null || true
fi

# Create new container with name 'ecci'
echo "Creating PostgreSQL + PostGIS container..."
sudo docker run -d \
    --name ecci \
    -e POSTGRES_DB=ecci \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=visdatpakrifky \
    -p 5432:5432 \
    --restart unless-stopped \
    postgis/postgis:15-3.4

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 10

echo -e "${GREEN}PostgreSQL with PostGIS is running${NC}"

# Install PostgreSQL client tools for psql command
echo -e "${YELLOW}Step 5: Install PostgreSQL client and GDAL tools${NC}"
sudo dnf install -y postgresql15.x86_64 || {
    echo "Installing alternative PostgreSQL client..."
    sudo dnf install -y postgresql16.x86_64
}

# Install GDAL for ogr2ogr
echo "Installing PostgreSQL client and GDAL..."
# Install PostgreSQL client and GDAL 3.10 (Amazon Linux 2023 uses version-suffixed packages)
sudo dnf install -y postgresql15.x86_64 gdal310.x86_64 gdal310-libs.x86_64

echo -e "${YELLOW}Step 6: Install additional tools${NC}"
sudo dnf install -y nginx
sudo npm install -g pm2

echo -e "${YELLOW}Step 7: Verify PostgreSQL is ready${NC}"
# Test connection to Docker PostgreSQL
echo "Testing PostgreSQL connection..."
for i in {1..30}; do
    if PGPASSWORD="visdatpakrifky" psql -h localhost -U postgres -d "ecci" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}PostgreSQL is ready!${NC}"
        break
    fi
    echo "Waiting for PostgreSQL... ($i/30)"
    sleep 1
done

# Create ecci_user and grant permissions
PGPASSWORD="visdatpakrifky" psql -h localhost -U postgres -d "ecci" <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ecci') THEN
        CREATE USER ecci WITH PASSWORD 'visdatpakrifky';
    END IF;
END
\$\$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE 'ecci' TO 'ecci';
ALTER DATABASE 'ecci' OWNER TO 'ecci';
GRANT ALL ON SCHEMA public TO 'ecci';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO 'ecci';

-- Create PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_version();
EOF

echo -e "${GREEN}PostGIS extension verified and user created${NC}"

echo -e "${YELLOW}Step 8: Verify application files${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    echo "Please upload the project files using WinSCP to /home/ec2-user/ecci"
    exit 1
else
    echo -e "${GREEN}Application directory exists${NC}"
fi

cd $APP_DIR

echo -e "${YELLOW}Step 8: Install dependencies${NC}"
cd Backend
npm install
cd ../Frontend
npm install

echo -e "${YELLOW}Step 9: Import geographic data${NC}"
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

echo -e "${YELLOW}Step 10: Import CSV data${NC}"
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

echo -e "${YELLOW}Step 11: Update backend configuration${NC}"
cd $APP_DIR/Backend

# Update server-postgis.js with correct credentials
sed -i "s/password: 'admin123'/password: '$DB_PASSWORD'/g" server-postgis.js

echo -e "${YELLOW}Step 12: Build frontend${NC}"
cd $APP_DIR/Frontend

# Update API URLs to use relative paths
sed -i "s|http://localhost:3001|''|g" src/heatmap-control.ts

npm run build

echo -e "${YELLOW}Step 13: Setup Nginx${NC}"
sudo tee /etc/nginx/conf.d/ecci.conf > /dev/null <<'NGINX_CONF'
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
        root /home/ec2-user/ecci/Frontend/dist;
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

# Remove default server block if exists
sudo rm -f /etc/nginx/conf.d/default.conf

sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${YELLOW}Step 14: Create logs directory${NC}"
mkdir -p $APP_DIR/logs

echo -e "${YELLOW}Step 15: Update ecosystem config${NC}"
# Update paths in ecosystem.config.js for ec2-user
sed -i "s|/home/ubuntu/ecci|/home/ec2-user/ecci|g" $APP_DIR/ecosystem.config.js

echo -e "${YELLOW}Step 16: Start services with PM2${NC}"
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

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
