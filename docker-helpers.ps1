# Quick docker commands for Smart Training Center 4.0
# Usage: .\docker-helpers.ps1 -Command <command>
# Or source it: . .\docker-helpers.ps1

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'restart', 'logs-backend', 'logs-frontend', 'logs-all', 
                 'build-backend', 'build-frontend', 'shell-backend', 'shell-frontend', 
                 'clean', 'status', 'help')]
    [string]$Command
)

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║  Smart Training Center 4.0 - Docker Commands Helper        ║
╚════════════════════════════════════════════════════════════╝

USAGE: .\docker-helpers.ps1 -Command <command>

COMMANDS:
  start           Start development environment
  stop            Stop all containers
  restart         Restart all containers
  status          Show container status
  
  logs-backend    View backend logs (live)
  logs-frontend   View frontend logs (live)
  logs-all        View all logs (live)
  
  build-backend   Rebuild backend (fast)
  build-frontend  Rebuild frontend
  
  shell-backend   Open shell in backend container
  shell-frontend  Open shell in frontend container
  
  clean           Remove all containers and volumes
  help            Show this help

EXAMPLES:
  .\docker-helpers.ps1 -Command start
  .\docker-helpers.ps1 -Command logs-backend
  .\docker-helpers.ps1 -Command build-backend
"@
}

function Start-Dev {
    Write-Host "🚀 Starting development environment..." -ForegroundColor Green
    docker compose -f docker-compose.dev.yml up -d
    Write-Host "✅ Started! Access at:" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:4200" -ForegroundColor Cyan
    Write-Host "   Backend:  http://localhost:8080" -ForegroundColor Cyan
}

function Stop-Dev {
    Write-Host "🛑 Stopping containers..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml down
    Write-Host "✅ Stopped!" -ForegroundColor Green
}

function Restart-Dev {
    Write-Host "🔄 Restarting containers..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml restart
    Write-Host "✅ Restarted!" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker ps --filter "name=stc-.*-dev" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Show-BackendLogs {
    Write-Host "📋 Backend Logs (Press Ctrl+C to exit):" -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml logs -f backend
}

function Show-FrontendLogs {
    Write-Host "📋 Frontend Logs (Press Ctrl+C to exit):" -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml logs -f frontend
}

function Show-AllLogs {
    Write-Host "📋 All Logs (Press Ctrl+C to exit):" -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml logs -f
}

function Build-Backend {
    Write-Host "🔨 Building backend..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml exec backend mvn clean package -DskipTests
    Write-Host "✅ Backend rebuilt!" -ForegroundColor Green
}

function Build-Frontend {
    Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml exec frontend ng build
    Write-Host "✅ Frontend rebuilt!" -ForegroundColor Green
}

function Open-BackendShell {
    Write-Host "🔓 Opening backend container shell..." -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml exec backend sh
}

function Open-FrontendShell {
    Write-Host "🔓 Opening frontend container shell..." -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml exec frontend sh
}

function Clean-All {
    Write-Host "⚠️  This will remove all containers and volumes!" -ForegroundColor Red
    $confirm = Read-Host "Continue? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "🧹 Cleaning..." -ForegroundColor Yellow
        docker compose -f docker-compose.dev.yml down -v
        Write-Host "✅ Cleaned!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Yellow
    }
}

# Execute command
switch ($Command) {
    'start'          { Start-Dev }
    'stop'           { Stop-Dev }
    'restart'        { Restart-Dev }
    'status'         { Show-Status }
    'logs-backend'   { Show-BackendLogs }
    'logs-frontend'  { Show-FrontendLogs }
    'logs-all'       { Show-AllLogs }
    'build-backend'  { Build-Backend }
    'build-frontend' { Build-Frontend }
    'shell-backend'  { Open-BackendShell }
    'shell-frontend' { Open-FrontendShell }
    'clean'          { Clean-All }
    'help'           { Show-Help }
}
