@echo off
REM Start development environment with Docker Compose
REM This allows hot reload without full rebuilds

echo.
echo 🚀 Starting Smart Training Center 4.0 in Development Mode...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Check if containers are already running
for /f %%i in ('docker ps --filter "name=stc-.*-dev" --format "table {{.Names}}" ^| find /v "NAMES"') do (
    if "%%i" neq "" (
        echo ⚠️  Development containers are already running.
        echo Run: docker compose -f docker-compose.dev.yml down
        echo      then run this script again.
        pause
        exit /b 1
    )
)

echo 📦 Starting services...
docker compose -f docker-compose.dev.yml up -d

if errorlevel 1 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)

echo.
echo ✅ Development environment started!
echo.
echo 📋 Service URLs:
echo    Frontend:  http://localhost:4200
echo    Backend:   http://localhost:8080
echo    MySQL:     localhost:3306
echo    MQTT:      localhost:1883
echo.
echo 🔨 Quick commands:
echo    View backend logs:   docker compose -f docker-compose.dev.yml logs -f backend
echo    View frontend logs:  docker compose -f docker-compose.dev.yml logs -f frontend
echo    Rebuild backend:     docker compose -f docker-compose.dev.yml exec backend mvn clean package -DskipTests
echo    Stop all:            docker compose -f docker-compose.dev.yml down
echo    Clean everything:    docker compose -f docker-compose.dev.yml down -v
echo.
echo 💡 Workflow:
echo    1. Edit files in your IDE
echo    2. Frontend auto-reloads on file change (ng serve)
echo    3. Backend auto-compiles on file change (mvn spring-boot:run)
echo    4. No need to rebuild Docker images!
echo.
pause
