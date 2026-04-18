# Shofe TMS - Haulage Truck Management

A containerized full-stack application for managing haulage truck operations. Built with React frontend, Node.js backend, and MySQL database.

## Project Structure

```
.
├── react/                 # React frontend (nginx)
├── backend/              # Node.js backend API
├── docker-compose.yml    # Docker Compose configuration
├── .dockerignore         # Files excluded from Docker builds
└── README.md            # This file
```

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Dev-Viny/Shofe_TMS.git
cd "Shofe_TMS"
```

### 2. Start all services

```bash
docker compose up
```

The application will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306

### 3. Stop services

```bash
docker compose down
```

## Services

### Frontend (React + Nginx)
- **Image**: `haulagetruckmanagement-frontend`
- **Port**: 80
- **Container**: `haulage-frontend`
- Serves the React application via Nginx

### Backend (Node.js)
- **Image**: `haulagetruckmanagement-backend`
- **Port**: 5000
- **Container**: `haulage-backend`
- Provides REST API endpoints
- Environment: Production
- Auto-restarts on failure

### Database (MySQL)
- **Image**: `mysql:8.0`
- **Port**: 3306
- **Container**: `haulage-db`
- Database: `haulage_truck_management`
- Persists data in `haulagetruckmanagement_db_data` volume

## Environment Variables

### Backend (`.env`)
```
DB_HOST=database
DB_PORT=3306
DB_USER=haulage_user
DB_PASSWORD=userpass123
DB_NAME=haulage_truck_management
NODE_ENV=production
PORT=5000
```

### Database
```
MYSQL_USER=haulage_user
MYSQL_PASSWORD=userpass123
MYSQL_ROOT_PASSWORD=rootpass123
MYSQL_DATABASE=haulage_truck_management
```

> **Security Note**: Change default passwords in production environments

## Development

### Rebuild images after code changes

```bash
docker compose build
docker compose up
```

### View logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
```

### Access database

```bash
docker exec -it haulage-db mysql -u haulage_user -p haulage_truck_management
```

Enter password: `userpass123`

## Production Deployment

For production use:

1. Update database passwords in `docker-compose.yml`
2. Set `NODE_ENV=production` in backend environment
3. Use a reverse proxy (Nginx/Traefik) for SSL/TLS
4. Use a secrets management tool instead of `.env` files
5. Deploy on Docker Swarm or Kubernetes for scaling

## Docker Images

Images are available on GitHub Container Registry:

```bash
# Pull images
docker pull ghcr.io/Dev-Viny/shofe-tms-frontend:latest
docker pull ghcr.io/Dev-Viny/shofe-tms-backend:latest
```

## Troubleshooting

### Backend container exits with code 1
```bash
docker compose logs backend
```
Check database connection and migrations.

### Port 80 already in use
```bash
# Use a different port
docker compose -f docker-compose.yml up -p 8080:80
```

### Database initialization fails
```bash
# Remove and recreate database volume
docker compose down -v
docker compose up
```

## License

Proprietary - Shofe TMS

## Support

For issues or questions, open an issue on GitHub.

## Login Credentials

 email : demo@example.com
 password : password123
