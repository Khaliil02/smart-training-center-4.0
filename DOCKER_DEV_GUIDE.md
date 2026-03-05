# 🚀 Docker Development Guide — Smart Training Center 4.0

## Quick Start (Development Mode)

### Windows Users
```powershell
.\dev-start.bat
```

### macOS / Linux Users
```bash
chmod +x dev-start.sh
./dev-start.sh
```

---

## 📋 What Is Development Mode?

The development Docker setup allows you to:
- ✅ **Fix errors and rebuild WITHOUT full Docker rebuilds**
- ✅ **Live reload frontend code** (ng serve)
- ✅ **Auto-compile backend code** (mvn spring-boot:run)
- ✅ **Mount source code** as Docker volumes
- ✅ **Faster iteration** during development

---

## 📁 File Structure

```
dali_pfe/
├── docker-compose.yml          ← Production setup
├── docker-compose.dev.yml      ← Development setup (NEW!)
├── dev-start.bat               ← Windows quick start (NEW!)
├── dev-start.sh                ← macOS/Linux quick start (NEW!)
├── smart-training-center-backend/
│   ├── Dockerfile             ← Production image
│   ├── Dockerfile.dev         ← Development image (NEW!)
│   ├── pom.xml
│   └── src/
├── smart-training-center-frontend/
│   ├── Dockerfile             ← Production image
│   ├── Dockerfile.dev         ← Development image (NEW!)
│   ├── package.json
│   └── src/
├── mosquitto/
└── README.md
```

---

## 🔄 Development Workflow

### 1️⃣ Start Services
```bash
# Quick start (all services)
docker compose -f docker-compose.dev.yml up -d

# Or use the helper script
./dev-start.bat        # Windows
./dev-start.sh         # macOS/Linux
```

### 2️⃣ Make Changes
Edit files in your IDE normally:
```
src/app/features/dashboard/... (frontend)
src/main/java/com/goodgovit/stc/... (backend)
```

### 3️⃣ Auto-Reload
- ✅ **Frontend** changes → Auto-reload at `http://localhost:4200` (ng serve with polling)
- ✅ **Backend** changes → Auto-compile & restart (mvn spring-boot:run)

### 4️⃣ Check Logs
```bash
# View backend compilation
docker compose -f docker-compose.dev.yml logs -f backend

# View frontend hot reload
docker compose -f docker-compose.dev.yml logs -f frontend

# View all logs
docker compose -f docker-compose.dev.yml logs -f
```

---

## 🛠️ Useful Docker Commands

### View Logs in Real-Time
```bash
# Backend compilation/startup logs
docker compose -f docker-compose.dev.yml logs -f backend

# Frontend ng serve logs
docker compose -f docker-compose.dev.yml logs -f frontend

# All services
docker compose -f docker-compose.dev.yml logs -f
```

### Manually Rebuild Backend (if needed)
```bash
# Clean and rebuild
docker compose -f docker-compose.dev.yml exec backend mvn clean package -DskipTests

# Just compile
docker compose -f docker-compose.dev.yml exec backend mvn compile
```

### Access Backend Container Shell
```bash
docker compose -f docker-compose.dev.yml exec backend sh
```

### Access Frontend Container Shell
```bash
docker compose -f docker-compose.dev.yml exec frontend sh
```

### Install New npm Package (Frontend)
```bash
# Option 1: Inside container
docker compose -f docker-compose.dev.yml exec frontend npm install package-name

# Option 2: On your machine (then Docker syncs)
cd smart-training-center-frontend
npm install package-name
```

### Install New Maven Dependency (Backend)
```bash
# Edit pom.xml, then rebuild
docker compose -f docker-compose.dev.yml exec backend mvn install
```

### Stop All Services
```bash
docker compose -f docker-compose.dev.yml down
```

### Clean Everything (remove volumes)
```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## 🔍 Troubleshooting

### Frontend Not Hot-Reloading?
```bash
# The frontend uses polling (--poll 2000) because Docker volumes are slow
# If still not working, try:
docker compose -f docker-compose.dev.yml down frontend
docker compose -f docker-compose.dev.yml up -d frontend
```

### Backend Not Recompiling?
```bash
# Check logs
docker compose -f docker-compose.dev.yml logs -f backend

# If stuck, rebuild:
docker compose -f docker-compose.dev.yml exec backend mvn clean package -DskipTests
docker compose -f docker-compose.dev.yml restart backend
```

### Port Already in Use?
```bash
# Find process using port 8080
netstat -ano | findstr :8080          # Windows
lsof -i :8080                          # macOS/Linux

# Kill the process or change port in docker-compose.dev.yml
```

### Database Connection Issues?
```bash
# Check MySQL is healthy
docker compose -f docker-compose.dev.yml logs mysql

# Restart MySQL
docker compose -f docker-compose.dev.yml restart mysql
```

---

## 🔀 Switching Between Dev & Production

### Development (Recommended for coding)
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Production (Optimized image)
```bash
# Build optimized image
docker compose build

# Run
docker compose up -d
```

---

## 📝 Notes on Volume Mounts

| Service | Mount Type | Path | Purpose |
|---------|-----------|------|---------|
| Backend | Source Code | `./smart-training-center-backend/src` | Live compilation |
| Backend | Build File | `./smart-training-center-backend/pom.xml` | Maven configuration |
| Frontend | Full Project | `./smart-training-center-frontend` | Live reload |
| MySQL | Named Volume | `mysql_data_dev` | Persistent database |

---

## 🎯 Best Practices for Development

1. **Keep docker-compose.dev.yml running** — Don't stop it between edits
2. **Check logs regularly** — Use `docker compose logs -f`
3. **Use host IDE** — Edit files on your machine, not in the container
4. **Rebuild thoroughly before push** — Use production build before committing

```bash
# Before pushing to git
docker compose build
docker compose up -d
# Test thoroughly, then stop
docker compose down
```

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Start dev environment | `docker compose -f docker-compose.dev.yml up -d` |
| Stop all services | `docker compose -f docker-compose.dev.yml down` |
| View all logs | `docker compose -f docker-compose.dev.yml logs -f` |
| Backend logs only | `docker compose -f docker-compose.dev.yml logs -f backend` |
| Frontend logs only | `docker compose -f docker-compose.dev.yml logs -f frontend` |
| Rebuild backend | `docker compose -f docker-compose.dev.yml exec backend mvn clean package -DskipTests` |
| Clean everything | `docker compose -f docker-compose.dev.yml down -v` |
| Shell in backend | `docker compose -f docker-compose.dev.yml exec backend sh` |
| Shell in frontend | `docker compose -f docker-compose.dev.yml exec frontend sh` |

---

## ❓ FAQ

**Q: Do I need to rebuild the Docker image every time?**  
A: No! That's the whole point of development mode. Just edit files and they auto-reload.

**Q: Why is frontend slower to reload?**  
A: Docker volume performance on Windows/Mac is slower due to virtualization. We use polling (--poll 2000) to detect changes. It's still faster than full rebuilds.

**Q: Can I use both dev and prod simultaneously?**  
A: Not recommended (port conflicts). Use `docker compose -f docker-compose.dev.yml down` before switching.

**Q: How do I debug the backend?**  
A: Debug port 5005 is exposed. Configure your IDE (IntelliJ, VS Code) to connect to `localhost:5005`.

**Q: My changes aren't showing up, what do I do?**  
A: Try a hard refresh in the browser (`Ctrl+Shift+R`), or check docker logs with `docker compose logs -f`.

---

Good luck! 🎉
