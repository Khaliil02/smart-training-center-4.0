# Smart Training Center 4.0

### Plateforme IoT-LMS Intelligente pour Centres de Formation

**PFE (Projet de Fin d'Etudes) — GOOD GOV IT Service & Solution**

Application web full-stack combinant un LMS (Learning Management System) avec un systeme de monitoring environnemental IoT. La plateforme gere les cours, les evaluations, la progression des etudiants et la surveillance en temps reel des salles via des capteurs MQTT. Concue pour etre hardware-ready des le premier jour.

---

## Tech Stack

| Layer        | Technology                                                       |
| ------------ | ---------------------------------------------------------------- |
| Frontend     | Angular 17 (standalone components, Angular Material, ng2-charts) |
| Backend      | Spring Boot 3.2.5 (Java 17, REST API, Spring Security)           |
| Database     | MySQL 8.0                                                        |
| IoT Protocol | MQTT (Eclipse Mosquitto broker)                                  |
| Real-time    | WebSocket (STOMP over SockJS)                                    |
| Security     | JWT Authentication, RBAC (4 roles)                               |
| DevOps       | Docker, Docker Compose                                           |

---

## Architecture

```
                        WebSocket (STOMP/SockJS)
                 ┌─────────────────────────────────────┐
                 │                                     │
                 v                                     │
        ┌────────────────┐       REST API       ┌─────────────────┐        ┌──────────┐
        │    Angular 17   │ <=================> │  Spring Boot API │ <====> │  MySQL   │
        │    Frontend     │                     │    (Port 8080)   │        │  8.0     │
        │   (Port 4200)   │                     └─────────────────┘        └──────────┘
        └────────────────┘                              │
                                                        │ MQTT Client
                                                        v
                                                ┌─────────────────┐
                                                │   Mosquitto      │
                                                │   MQTT Broker    │
                                                │   (Port 1883)    │
                                                └─────────────────┘
                                                   │           │
                                          MQTT Pub/Sub    MQTT Pub/Sub
                                                   │           │
                                                   v           v
                                          ┌──────────────┐  ┌───────────────┐
                                          │ IoT Simulator │  │ ESP32 Devices │
                                          │ (Python/Java) │  │ (Future HW)   │
                                          └──────────────┘  └───────────────┘
```

---

## Project Structure

```
dali_pfe/
├── smart-training-center-backend/    # Spring Boot API
├── smart-training-center-frontend/   # Angular 17 SPA
├── iot-simulator/                    # Python standalone IoT simulator
├── mosquitto/                        # Mosquitto broker config
├── docs/                             # Hardware documentation
│   ├── ESP32_FIRMWARE_SPEC.md
│   └── HARDWARE_INTEGRATION_GUIDE.md
├── docker-compose.yml
└── README.md
```

---

## Features

### 1. Authentification & Securite

- Authentification JWT (JSON Web Token)
- RBAC avec 4 roles : Etudiant, Enseignant, Administrateur, Responsable Academique
- Audit trail complet des actions utilisateurs

### 2. Catalogue & LMS

- Gestion hierarchique : filieres, specialites, matieres, certifications
- Gestion des cours avec workflow d'approbation
- Progression conditionnelle (seuil >= 80% requis pour avancer)
- Quiz et evaluations avec correction automatique
- Generation de bulletins

### 3. Smart Training Center (IoT)

- Integration MQTT pour la communication avec les capteurs
- Monitoring environnemental en temps reel (temperature, CO2, presence)
- Suivi de presence par RFID
- Alertes basees sur des seuils configurables
- Surveillance de la sante des appareils (device health monitoring)
- Architecture hardware-ready (transition simulateur vers materiel sans modification de code)

### 4. Tableaux de Bord

- Dashboard pedagogique (progression etudiants, resultats)
- Dashboard administratif (gestion globale)
- Dashboard decisionnel (statistiques, rapports)
- Dashboard IoT (charts temps reel, etat des salles)

### 5. Gestion des Utilisateurs

- CRUD complet des utilisateurs
- Attribution et gestion des roles
- Gestion de profil

---

## Roles & Permissions

| Role                   | Access                                                      |
| ---------------------- | ----------------------------------------------------------- |
| Etudiant               | Cours, evaluations, progression, bulletin, profil           |
| Enseignant             | Gestion cours, evaluations, dashboard pedagogique           |
| Administrateur         | Tout : utilisateurs, IoT, alertes, appareils, salles, audit |
| Responsable Academique | Dashboards decisionnels, approbation cours, rapports        |

---

## Prerequisites

**Option 1 — Docker (recommande)**

- Docker & Docker Compose

**Option 2 — Developpement local**

- Java 17+
- Node.js 18+
- MySQL 8.0
- Mosquitto MQTT Broker

---

## Quick Start (Docker)

```bash
git clone <repo-url>
cd dali_pfe
docker-compose up -d
```

| Service     | URL                                   |
| ----------- | ------------------------------------- |
| Frontend    | http://localhost:4200                 |
| Backend API | http://localhost:8080                 |
| Swagger UI  | http://localhost:8080/swagger-ui.html |
| MQTT Broker | localhost:1883                        |

---

## Quick Start (Local Development)

### 1. Demarrer MySQL

Creer la base de donnees sur le port 3306 :

```sql
CREATE DATABASE stc_db;
```

### 2. Demarrer Mosquitto

Lancer le broker MQTT Mosquitto sur le port par defaut (1883).

### 3. Demarrer le Backend

```bash
cd smart-training-center-backend
mvn spring-boot:run -Dspring-boot.run.profiles=simulator
```

### 4. Demarrer le Frontend

```bash
cd smart-training-center-frontend
ng serve
```

### 5. (Optionnel) Demarrer le simulateur Python

```bash
cd iot-simulator
pip install -r requirements.txt
python iot_simulator.py
```

---

## Default Accounts (Seed Data)

| Role                   | Email             | Password     |
| ---------------------- | ----------------- | ------------ |
| Administrateur         | admin@stc.com     | admin123     |
| Enseignant             | prof@stc.com      | prof123      |
| Etudiant               | etudiant1@stc.com | etudiant123  |
| Etudiant               | etudiant2@stc.com | etudiant123  |
| Responsable Academique | directeur@stc.com | directeur123 |

---

## API Documentation

La documentation interactive de l'API est disponible via Swagger UI :

```
http://localhost:8080/swagger-ui.html
```

### Principaux groupes d'endpoints

| Endpoint               | Description           |
| ---------------------- | --------------------- |
| `/api/auth/**`         | Authentication        |
| `/api/cours/**`        | Course management     |
| `/api/evaluations/**`  | Evaluations & quizzes |
| `/api/catalogue/**`    | Training catalog      |
| `/api/utilisateurs/**` | User management       |
| `/api/salles/**`       | Room management       |
| `/api/presence/**`     | Attendance            |
| `/api/alertes/**`      | Alerts                |
| `/api/iot/devices/**`  | IoT device management |
| `/api/dashboard/**`    | Dashboards            |
| `/api/audit/**`        | Audit logs            |

---

## How to Connect Real Hardware

La plateforme est concue pour une transition transparente du simulateur vers du materiel reel. Aucune modification de code n'est requise dans le backend ou le frontend.

1. Lire `docs/ESP32_FIRMWARE_SPEC.md` pour les specifications firmware requises
2. Suivre `docs/HARDWARE_INTEGRATION_GUIDE.md` pour la procedure de transition etape par etape
3. Points cles :
   - Changer `SPRING_PROFILES_ACTIVE` vers `production` (desactive le simulateur interne)
   - Enregistrer les appareils physiques via l'interface d'administration
   - Flasher les ESP32 avec la configuration correspondante (topics MQTT, broker address)
   - Connecter les appareils au meme broker MQTT
4. **Zero modification de code** requise dans le backend ou le frontend

---

## IoT Simulator

Deux simulateurs sont disponibles, produisant des donnees identiques :

- **Simulateur Spring Boot** : active automatiquement avec le profil `simulator`. Integre directement dans le backend.
- **Simulateur Python** : alternative standalone situee dans `iot-simulator/`. Utile pour tester independamment du backend.

Les deux utilisent des topics MQTT et des schemas JSON identiques, garantissant une compatibilite totale avec le materiel reel.

Voir `iot-simulator/README.md` pour la documentation detaillee du simulateur Python.

---

## License

Projet de Fin d'Etudes (PFE) — Projet academique

Developpe pour **GOOD GOV IT Service & Solution**
