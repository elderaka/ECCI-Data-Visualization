module.exports = {
  apps: [
    {
      name: 'ecci-pmtiles',
      cwd: '/home/ec2-user/ecci/Backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ec2-user/ecci/logs/pmtiles-error.log',
      out_file: '/home/ec2-user/ecci/logs/pmtiles-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'ecci-postgis',
      cwd: '/home/ec2-user/ecci/Backend',
      script: 'server-postgis.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/ec2-user/ecci/logs/postgis-error.log',
      out_file: '/home/ec2-user/ecci/logs/postgis-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
