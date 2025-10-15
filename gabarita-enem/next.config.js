/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DB_HOST: process.env.DB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    DB_PORT: process.env.DB_PORT || '4000',
    DB_USERNAME: process.env.DB_USERNAME || '37MjaWfm8GRRgyG.root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'eDLwd5fy5zQjILv2',
    DB_DATABASE: process.env.DB_DATABASE || 'appenem_db',
    JWT_SECRET: process.env.JWT_SECRET || 'gabarita-enem-secret-key-2024'
  }
}

module.exports = nextConfig