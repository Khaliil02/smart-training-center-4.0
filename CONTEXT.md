
# PROMPT: Build the "Smart Training Center 4.0" – Full-Stack IoT & LMS Platform

## 🎯 MISSION
Build a complete, production-ready full-stack web application called **"Smart Training Center 4.0"** — an IoT-integrated Learning Management System (LMS) for universities and training centers. The project is for a **PFE (Projet de Fin d'Études)** for an engineering degree, developed for the company **GOOD GOV IT Service & Solution**.

**Critical Requirement:** The application must be designed and built so that it is **ready to integrate with real physical IoT hardware (ESP32, RFID readers, environmental sensors) in the future**, without requiring any architectural changes. The current version uses a software simulator for demo purposes, but the MQTT topics, data formats, API contracts, and WebSocket channels must all be production-grade and hardware-compatible from day one.

---

## 📐 ARCHITECTURE OVERVIEW

### Tech Stack
| Layer            | Technology                         |
|------------------|------------------------------------|
| **Frontend**     | Angular 17+ (standalone components, Angular Material) |
| **Backend**      | Spring Boot 3.x (Java 17+), REST API |
| **Database**     | MySQL 8.x                         |
| **IoT**          | ESP32 microcontrollers, MQTT broker (Mosquitto) |
| **Real-time**    | WebSocket (STOMP over SockJS)      |
| **Security**     | JWT authentication, RBAC           |
| **DevOps**       | Docker, Docker Compose             |

### Architecture Pattern
- **Backend:** Layered architecture (Controller → Service → Repository → Entity)
- **Frontend:** Modular Angular with lazy-loaded feature modules
- **Communication:** REST API + WebSocket for real-time + MQTT for IoT
- **Database:** Relational (MySQL) with JPA/Hibernate
- **IoT Layer:** Abstracted behind interfaces — the backend consumes MQTT messages through a **hardware-agnostic adapter layer**, so swapping the simulator for real ESP32 devices requires zero code changes in the service or controller layers.

---

## 👥 ACTORS & ROLES (from Use Case Diagrams)

### 1. Étudiant / Apprenant (Student)
- Register attendance via RFID/QR code
- Follow courses online and in-person (text, video, quiz)
- Take evaluations with conditional progression (must score ≥ 80% to advance)
- View grades, bulletins, and results
- Track personal progression

### 2. Enseignant / Formateur (Teacher/Trainer)
- Create and manage courses (text, video, quiz content)
- View pedagogical dashboards
- Validate evaluations and grades
- Track student progression
- Define evaluations and grading scales (barèmes)

### 3. Administrateur du centre (Center Administrator)
- Authenticate via JWT
- View administrative dashboards
- Manage user accounts
- Manage real-time alerts
- Monitor environmental conditions (temperature, CO₂, presence)
- Supervise rooms and IoT equipment
- Control room access
- Manage training catalog (filières, spécialités, matières, certifications)
- Attach users to organizational structures
- View performance indicators (success rates, attendance, energy indicators)
- Ensure audit and traceability
- Define roles and permissions (RBAC)
- Track traceability and conformity

### 4. Responsable Académique / Direction (Academic Director)
- Manage roles and permissions (RBAC)
- View audit and traceability logs
- Access decision-making dashboards
- View performance indicators
- Validate programs
- Plan evaluations
- Track student progression
- Approve courses
- Generate reports

**All use cases «include» → "Se connecter (Auth JWT)"** — every action requires authentication.

---

## 📊 CLASS DIAGRAM – COMPLETE DATA MODEL

Generate the following JPA entities exactly as specified:

### Entity: `Utilisateur` (Base class / User)
```java
- idUtilisateur : int (PK, auto-generated)
- nom : String
- prenom : String
- email : String (unique)
- motDePasse : String (BCrypt hashed)
- dateInscription : LocalDate
- etatCompte : String ("ACTIF", "INACTIF", "SUSPENDU")
// Relationships:
- roles : Set<Role> (ManyToMany)
// Methods:
- seConnecter(email, motDePasse) → JWT token
- seDeconnecter()
- modifierProfil()
```

### Entity: `Role`
```java
- idRole : int (PK)
- nomRole : String ("ETUDIANT", "ENSEIGNANT", "ADMINISTRATEUR", "RESPONSABLE_ACADEMIQUE")
- description : String
```

### Entity: `Etudiant` (extends/linked to Utilisateur)
```java
- idEtudiant : int (PK)
- matricule : String (unique)
- progressionGlobale : float
// Relationships:
- inscriptions : List<InscriptionCours> (OneToMany)
- badge : RFID_QR (OneToOne)
- evaluations : List<Evaluation> (ManyToMany)
// Methods:
- sInscrire()
- suivreCours(cours : Cours)
- passerEvaluation(evaluation : Evaluation)
- consulterResultats()
- obtenirBadge(badge : RFID_QR)
```

### Entity: `Enseignant` (extends/linked to Utilisateur)
```java
- idEnseignant : int (PK)
- specialite : String
// Relationships:
- cours : List<Cours> (OneToMany) — creates/manages
- responsableAcademique : ResponsableAcademique (ManyToOne, "encadre")
// Methods:
- creerCours(cours : Cours)
- gererCatalogueCours()
- validerProgression(evaluation : Evaluation, etu : Etudiant)
- consulterStatistiques()
```

### Entity: `Administrateur` (extends/linked to Utilisateur)
```java
- idAdministrateur : int (PK)
// Methods:
- gererUtilisateurs()
- attribuerPermissions()
- consulterAudits()
- configurerSallesEtCapteurs()
```

### Entity: `ResponsableAcademique` (extends/linked to Utilisateur)
```java
- idResponsable : int (PK)
- departement : String
- domaine : String
- dateAffectation : LocalDate
// Relationships:
- enseignants : List<Enseignant> (OneToMany, "encadre")
// Methods:
- validerProgramme()
- planifierEvaluations()
- suivreProgression(etudiant : Etudiant)
- approuverCours(cours : Cours)
- genererRapports()
```

### Entity: `Cours`
```java
- idCours : int (PK)
- titre : String
- description : String
- contenu : String (or TEXT for rich content)
- filiere : String
- niveau : String
- dureeEstimee : int (in hours)
- estActif : boolean
// Relationships:
- enseignant : Enseignant (ManyToOne, "cree/gere")
- inscriptions : List<InscriptionCours> (OneToMany)
- evaluations : List<Evaluation> (OneToMany)
- capteurs : List<CapteurIoT> (ManyToMany, "alimente")
- salle : Salle (ManyToOne)
// Methods:
- ajouterContenu(contenu : String)
- modifierCours()
- supprimerCours()
```

### Entity: `InscriptionCours`
```java
- idInscription : int (PK)
- dateInscription : LocalDate
- progression : float (0.0 to 100.0)
- noteFinale : float
- etat : String ("EN_COURS", "TERMINÉ", "ABANDONNÉ")
- dateDernierAcces : LocalDateTime
// Relationships:
- etudiant : Etudiant (ManyToOne)
- cours : Cours (ManyToOne)
// Methods:
- mettreAJourProgression(valeur : float)
- verifierConditionValidation(seuil : float) : boolean  // returns true if progression >= seuil (80%)
```

### Entity: `Evaluation`
```java
- idEvaluation : int (PK)
- type : String ("QUIZ", "EXAMEN", "TP", "PROJET")
- date : LocalDate
- noteMaximale : float
- seuilValidation : float (default 80.0)
- coefficient : float
- statut : String ("BROUILLON", "PUBLIEE", "TERMINEE")
// Relationships:
- cours : Cours (ManyToOne)
- etudiants : List<Etudiant> (ManyToMany with scores)
- badge : RFID_QR (ManyToMany, "passe")
// Methods:
- calculerNote()
- verifierValidation() : boolean
- validerProgression(etudiant : Etudiant)
```

### Entity: `Salle` (Room)
```java
- idSalle : int (PK)
- nomSalle : String
- capacite : int
- type : String ("COURS", "TP", "AMPHITHEATRE", "LABO")
// Relationships:
- capteurs : List<CapteurIoT> (OneToMany, "equipe")
- cours : List<Cours> (OneToMany)
// Methods:
- reserverSalle(cours : Cours)
- surveillerEnvironnement()
```

### Entity: `CapteurIoT` (IoT Sensor)
```java
- idCapteur : int (PK)
- type : String ("TEMPERATURE", "CO2", "PRESENCE", "RFID_READER")
- valeurMesuree : float
- dateHeureMesure : LocalDateTime
- estEnLigne : boolean          // NEW — tracks sensor online/offline status
- firmwareVersion : String      // NEW — for real hardware tracking
- adresseMac : String           // NEW — MAC address for device identification
// Relationships:
- salle : Salle (ManyToOne, "equipe")
// Methods:
- envoyerDonnees()  // via MQTT
- declencherAlertes()  // threshold-based
```

### Entity: `RFID_QR` (Badge)
```java
- idBadge : int (PK)
- codeQR : String (unique)
- statut : String ("ACTIF", "INACTIF", "PERDU")
- dateDerniereLecture : LocalDateTime
// Relationships:
- etudiant : Etudiant (OneToOne, "possede")
// Methods:
- enregistrerPresence(etudiant : Etudiant)
- verifierIdentite() : boolean
```

### Entity: `TableauDeBord` (Dashboard)
```java
- idDashboard : int (PK)
- type : String ("PEDAGOGIQUE", "ADMINISTRATIF", "DECISIONNEL", "IOT")
- frequenceMiseAJour : String ("TEMPS_REEL", "QUOTIDIEN", "HEBDOMADAIRE")
- indicateurs : String (JSON or TEXT)
// Relationships:
- utilisateurs : List<Utilisateur> (ManyToMany, "consulte")
// Methods:
- genererRapports()
- afficherStatistiques()
```

### Relationships Summary (from Class Diagram):
- `ResponsableAcademique` 1 ——encadre——> 1..* `Enseignant`
- `Enseignant` 1 ——cree/gere——> 0..* `Cours`
- `Utilisateur` 1 ——possede——> 0..* `Role`
- `Etudiant` 0..* ——(InscriptionCours)——> 0..* `Cours`
- `Cours` 1 ——> 0..* `Evaluation`
- `Evaluation` 0..* ——passe——> 0..* `RFID_QR`
- `Etudiant` 1 ——possede——> 1 `RFID_QR`
- `Salle` 1 ——equipe——> 0..* `CapteurIoT`
- `CapteurIoT` 0..* ——alimente——> 0..* `Cours`
- `Etudiant` 0..* ——planifie——> 0..* `Evaluation`
- `ResponsableAcademique` 1 ——valide——> 0..* `Cours`
- `TableauDeBord` 0..* ——consulte——> 0..* `Utilisateur`
- `Administrateur` ——consulte——> `TableauDeBord`

---

## 🔧 MODULE 1: Administration & Security

### Authentication (JWT)
- POST `/api/auth/login` → returns JWT access token + refresh token
- POST `/api/auth/register` → register new user (admin-only for certain roles)
- POST `/api/auth/refresh` → refresh token
- JWT stored in HttpOnly cookie or localStorage
- Spring Security with `@PreAuthorize` annotations

### RBAC (Role-Based Access Control)
- 4 roles: `ETUDIANT`, `ENSEIGNANT`, `ADMINISTRATEUR`, `RESPONSABLE_ACADEMIQUE`
- Granular permissions per role
- API endpoints protected by role
- Angular route guards (`AuthGuard`, `RoleGuard`)

### Audit & Traceability
- Entity: `AuditLog` with fields: id, action, entityType, entityId, userId, timestamp, details
- Automatically log all CRUD operations
- Viewable by Admin and Responsable Académique

### User Management (Admin)
- CRUD operations on users
- Attach users to structures (filières, departments)
- Activate/deactivate accounts
- Assign/revoke roles

---

## 📚 MODULE 2: Catalogue & Advanced LMS

### Training Catalog
- **Filière** (Program): id, nom, description, niveau
- **Spécialité** (Specialty): id, nom, filière (FK)
- **Matière** (Subject): id, nom, spécialité (FK), coefficient
- **Certification**: id, nom, description, dateExpiration
- Full CRUD for each, managed by Admin

### Course Management
- Teachers create courses with: title, description, rich content (text/HTML), video URLs, attachments
- Courses linked to filière + matière
- Course status: BROUILLON, PUBLIE, ARCHIVE
- Approval workflow: Responsable Académique must approve

### Interactive Content
- Text lessons with rich formatting
- Embedded video (YouTube/uploaded)
- **Quizzes**: multiple choice, true/false, short answer
- Entity: `Quiz` → `Question` → `Reponse`

### Conditional Progression (≥ 80%)
- Students cannot access the next chapter/module until they score ≥ 80% on current evaluation
- `InscriptionCours.progression` tracks overall completion
- `InscriptionCours.verifierConditionValidation(80.0)` must return true
- Frontend shows locked/unlocked modules visually

### Evaluations & Grading
- Multiple evaluation types: QUIZ, EXAMEN, TP, PROJET
- Configurable coefficients and max scores
- Automatic grade calculation
- Bulletins (report cards) generated per student per filière

### Endpoints
```
GET    /api/cours                    — list all courses
POST   /api/cours                    — create course (ENSEIGNANT)
GET    /api/cours/{id}               — get course detail
PUT    /api/cours/{id}               — update course
DELETE /api/cours/{id}               — delete course
POST   /api/cours/{id}/inscription   — enroll student
GET    /api/cours/{id}/progression   — get student progression
POST   /api/evaluations              — create evaluation
POST   /api/evaluations/{id}/submit  — student submits answers
GET    /api/etudiants/{id}/bulletin   — get student report card
GET    /api/catalogue/filieres       — list filières
GET    /api/catalogue/specialites    — list spécialités
GET    /api/catalogue/matieres       — list matières
GET    /api/catalogue/certifications — list certifications
```

---

## 🏢 MODULE 3: Smart Training Center (IoT)

### ⚡ HARDWARE-READINESS REQUIREMENT
> **This is a core architectural requirement.** The entire IoT layer must be designed so that replacing the software simulator with real ESP32 hardware requires **only plugging in the devices and pointing them at the MQTT broker** — no backend code changes, no API changes, no database schema changes. The simulator must produce messages in **exactly the same format** that real hardware would.

### Room Management
- CRUD for rooms (Salle)
- Room types: COURS, TP, AMPHITHEATRE, LABO
- Room capacity tracking
- Room reservation system linked to courses/schedule

### IoT Sensors (CapteurIoT)
- Sensor types: TEMPERATURE, CO2, PRESENCE, RFID_READER
- Each sensor linked to a room
- Sensors send data via MQTT to topic: `stc/salle/{salleId}/capteur/{type}`
- Backend subscribes to MQTT, persists readings, and pushes via WebSocket
- **Each sensor record stores**: `estEnLigne` (online status), `firmwareVersion`, `adresseMac` (MAC address) — ready for real device registration

### MQTT Integration (Hardware-Compatible Protocol)
```
MQTT Topics (fixed contract — simulator AND real hardware use the same topics):
  stc/salle/{salleId}/temperature     → JSON: {"sensorId": "...", "value": 23.5, "unit": "°C", "timestamp": "ISO8601"}
  stc/salle/{salleId}/co2             → JSON: {"sensorId": "...", "value": 650, "unit": "ppm", "timestamp": "ISO8601"}
  stc/salle/{salleId}/presence        → JSON: {"sensorId": "...", "count": 25, "detected": true, "timestamp": "ISO8601"}
  stc/rfid/{readerId}/scan            → JSON: {"badgeCode": "...", "readerId": "...", "timestamp": "ISO8601"}
  stc/device/{deviceId}/status        → JSON: {"deviceId": "...", "status": "ONLINE"|"OFFLINE", "firmware": "1.0.0", "mac": "AA:BB:CC:DD:EE:FF", "timestamp": "ISO8601"}
  stc/device/{deviceId}/heartbeat     → JSON: {"deviceId": "...", "uptime": 3600, "freeMemory": 45000, "timestamp": "ISO8601"}
```

> **All MQTT payloads are JSON with a fixed schema.** This ensures that when real ESP32 devices are programmed to publish to these topics with these JSON structures, the backend processes them identically to simulator messages.

### Device Registration & Management (Hardware-Ready)
- Admin can register new IoT devices via UI: assign `deviceId`, `type`, `salleId`, `adresseMac`
- Device status tracked via heartbeat messages (`stc/device/{deviceId}/heartbeat`)
- If no heartbeat received within configurable timeout (default 60s), mark device as `OFFLINE`
- Admin dashboard shows device fleet: online/offline count, firmware versions, last seen
- **API for future OTA firmware updates**: `POST /api/iot/devices/{id}/ota` (placeholder — returns 501 Not Implemented, but the route and DTO exist)

### Automatic Attendance (RFID/QR)
- Student scans RFID badge or QR code at room entrance
- RFID reader publishes to `stc/rfid/{readerId}/scan` with `badgeCode`
- Backend resolves `badgeCode` → student, records presence
- Entity: `Presence` with fields: id, etudiant (FK), salle (FK), dateHeure, methode ("RFID"/"QR"), source ("SIMULATOR"/"HARDWARE")
- Linked to course schedule for validation
- **The `source` field** distinguishes simulator-generated scans from real hardware scans for audit purposes

### Environmental Monitoring
- Real-time display of temperature, CO₂, presence per room
- Thresholds: Temperature > 30°C → alert, CO₂ > 1000ppm → alert
- Alerts pushed via WebSocket to admin dashboard
- Historical data stored for trend analysis (keep all readings, not just latest)

### Real-Time Alerts
- Entity: `Alerte` with fields: id, type, message, salle (FK), capteur (FK), dateHeure, statut ("ACTIVE"/"TRAITEE"), source ("SIMULATOR"/"HARDWARE")
- WebSocket endpoint: `/ws/alerts`
- Admin receives toast notifications in Angular

### Endpoints
```
GET    /api/salles                        — list rooms
POST   /api/salles                        — create room
GET    /api/salles/{id}/capteurs          — get sensors for room
GET    /api/salles/{id}/environnement     — get current readings
GET    /api/salles/{id}/environnement/historique?from=&to= — historical readings
GET    /api/salles/{id}/presences         — get attendance for room
POST   /api/presence/scan                 — record RFID/QR scan (manual/API fallback)
GET    /api/alertes                       — list active alerts
PUT    /api/alertes/{id}/traiter          — mark alert as handled
GET    /api/iot/devices                   — list all registered IoT devices
POST   /api/iot/devices                   — register new IoT device
PUT    /api/iot/devices/{id}              — update device config
GET    /api/iot/devices/{id}/status       — get device status & health
POST   /api/iot/devices/{id}/ota          — (placeholder) trigger OTA update → returns 501
WS     /ws/salles/{id}/realtime           — WebSocket for live sensor data
WS     /ws/alerts                         — WebSocket for alerts
```

### ESP32 Simulator (for demo — mirrors real hardware behavior)
Create a **Spring Boot `@Scheduled` component** (`IoTSimulatorService`) that:
- Publishes realistic sensor data to MQTT every 5 seconds using **exactly the same JSON schema** that real ESP32 devices would use
- Simulates RFID badge scans at random intervals
- Sends device heartbeat messages every 30 seconds
- Sends occasional `OFFLINE` status messages to test alerting
- Can be **toggled on/off** via configuration property: `stc.iot.simulator.enabled=true`
- When disabled (real hardware connected), the simulator stops and real devices take over — **no other changes needed**

Also provide a **standalone Python script** (`iot_simulator.py`) as an alternative simulator:
- Uses `paho-mqtt` library
- Connects to the same MQTT broker
- Publishes to the same topics with the same JSON format
- Configurable via command-line args: `--broker`, `--salle-id`, `--interval`
- This script can later be replaced by the actual ESP32 Arduino/MicroPython firmware

### 🔌 ESP32 Firmware Specification (Reference for Future Hardware)
Include a **README section** or a separate `docs/ESP32_FIRMWARE_SPEC.md` file that documents:
- Exact MQTT topics each sensor type should publish to
- JSON payload schema for each message type
- Recommended MQTT QoS levels (QoS 1 for sensor data, QoS 2 for RFID scans)
- Heartbeat interval (30 seconds)
- WiFi + MQTT connection parameters
- Pin mappings for common sensor modules (DHT22 for temperature, MH-Z19 for CO₂, HC-SR501 for presence, RC522 for RFID)
- Sample Arduino sketch outline (pseudocode, not full implementation)

---

## 📊 MODULE 4: BI & Dashboards

### Pedagogical Dashboard (Teacher)
- Number of students per course
- Average progression per course
- Pass/fail rates per evaluation
- Attendance rates

### Administrative Dashboard (Admin)
- Total users by role
- Room occupancy rates
- IoT sensor status (online/offline) — **shows device fleet health**
- Alert count and trends

### Decision-Making Dashboard (Responsable Académique)
- Success rates by filière/spécialité
- Attendance trends
- Energy/environmental indicators
- Comparative reports

### IoT Dashboard (Admin — Hardware Monitoring)
- **Device fleet overview**: total devices, online vs. offline, firmware version distribution
- **Per-room live monitoring**: gauges for temperature, CO₂; presence count
- **Alert timeline**: chronological list of triggered alerts
- **Sensor data history**: line charts with time-range selector

### Performance Indicators
- Taux de réussite (success rate)
- Taux de présence (attendance rate)
- Indicateurs énergétiques (energy indicators from IoT)
- Student engagement metrics

### Endpoints
```
GET /api/dashboard/pedagogique?enseignantId={id}
GET /api/dashboard/administratif
GET /api/dashboard/decisionnel
GET /api/dashboard/iot?salleId={id}
GET /api/dashboard/iot/fleet               — device fleet status
GET /api/dashboard/performance
```

### Frontend Charts
- Use **Chart.js** or **ng2-charts** in Angular
- Line charts for trends, bar charts for comparisons, pie charts for distributions
- Real-time gauge charts for IoT data
- Device status indicators (green/red dots for online/offline)

---

## 🗂️ PROJECT STRUCTURE

### Backend (Spring Boot)
```
smart-training-center-backend/
├── src/main/java/com/goodgovit/stc/
│   ├── StcApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── MqttConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── CorsConfig.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── CustomUserDetailsService.java
│   │   └── AuthEntryPoint.java
│   ├── entity/
│   │   ├── Utilisateur.java
│   │   ├── Role.java
│   │   ├── Etudiant.java
│   │   ├── Enseignant.java
│   │   ├── Administrateur.java
│   │   ├── ResponsableAcademique.java
│   │   ├── Cours.java
│   │   ├── InscriptionCours.java
│   │   ├── Evaluation.java
│   │   ├── Salle.java
│   │   ├── CapteurIoT.java
│   │   ├── RFID_QR.java
│   │   ├── TableauDeBord.java
│   │   ├── Presence.java
│   │   ├── Alerte.java
│   │   ├── AuditLog.java
│   │   ├── Filiere.java
│   │   ├── Specialite.java
│   │   ├── Matiere.java
│   │   ├── Certification.java
│   │   ├── Quiz.java
│   │   ├── Question.java
│   │   ├── Reponse.java
│   │   └── DeviceHeartbeat.java          // NEW — for hardware health tracking
│   ├── repository/
│   │   └── (one repository interface per entity)
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── UtilisateurService.java
│   │   ├── CoursService.java
│   │   ├── EvaluationService.java
│   │   ├── InscriptionService.java
│   │   ├── PresenceService.java
│   │   ├── SalleService.java
│   │   ├── CapteurService.java
│   │   ├── AlerteService.java
│   │   ├── DashboardService.java
│   │   ├── AuditService.java
│   │   ├── CatalogueService.java
│   │   ├── MqttService.java
│   │   ├── IoTDeviceService.java         // NEW — device registration & health
│   │   └── IoTSimulatorService.java      // NEW — togglable simulator
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── UtilisateurController.java
│   │   ├── CoursController.java
│   │   ├── EvaluationController.java
│   │   ├── InscriptionController.java
│   │   ├── PresenceController.java
│   │   ├── SalleController.java
│   │   ├── CapteurController.java
│   │   ├── AlerteController.java
│   │   ├── DashboardController.java
│   │   ├── AuditController.java
│   │   ├── CatalogueController.java
│   │   └── IoTDeviceController.java      // NEW — device management endpoints
│   ├── dto/
│   │   └── (DTOs for all request/response objects, including IoT payloads)
│   ├── mapper/
│   │   └── (MapStruct or manual mappers)
│   ├── mqtt/
│   │   ├── MqttSubscriber.java
│   │   ├── MqttMessageHandler.java       // Adapter — same handler for simulator & real HW
│   │   └── MqttPayloadSchemas.java       // NEW — constants for topic patterns & JSON schemas
│   ├── websocket/
│   │   └── WebSocketHandler.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── (custom exceptions)
├── src/main/resources/
│   ├── application.yml
│   ├── application-simulator.yml         // NEW — profile with simulator enabled
│   ├── application-production.yml        // NEW — profile with simulator disabled
│   └── data.sql (seed data)
├── pom.xml
├── Dockerfile
└── docs/
    └── ESP32_FIRMWARE_SPEC.md            // NEW — hardware integration guide
```

### Frontend (Angular)
```
smart-training-center-frontend/
├── src/app/
│   ├── core/
│   │   ├── guards/ (AuthGuard, RoleGuard)
│   │   ├── interceptors/ (JwtInterceptor, ErrorInterceptor)
│   │   ├── services/ (AuthService, ApiService, WebSocketService)
│   │   └── models/ (all TypeScript interfaces matching entities)
│   ├── shared/
│   │   ├── components/ (navbar, sidebar, footer, alert-toast, device-status-badge)
│   │   └── pipes/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── pedagogique/
│   │   │   ├── administratif/
│   │   │   ├── decisionnel/
│   │   │   └── iot/                      // includes device fleet view
│   │   ├── cours/
│   │   │   ├── cours-list/
│   │   │   ├── cours-detail/
│   │   │   ├── cours-create/
│   │   │   └── cours-viewer/ (for students, with progression)
│   │   ├── evaluations/
│   │   │   ├── evaluation-list/
│   │   │   ├── evaluation-take/ (quiz interface)
│   │   │   └── evaluation-results/
│   │   ├── catalogue/
│   │   │   ├── filieres/
│   │   │   ├── specialites/
│   │   │   ├── matieres/
│   │   │   └── certifications/
│   │   ├── users/
│   │   │   ├── user-list/
│   │   │   ├── user-detail/
│   │   │   └── user-profile/
│   │   ├── salles/
│   │   │   ├── salle-list/
│   │   │   ├── salle-detail/ (with live IoT data)
│   │   │   └── salle-monitoring/
│   │   ├── presence/
│   │   │   ├── scan/
│   │   │   └── attendance-report/
│   │   ├── alerts/
│   │   │   └── alert-panel/
│   │   ├── audit/
│   │   │   └── audit-log/
│   │   ├── devices/                      // NEW — IoT device management
│   │   │   ├── device-list/
│   │   │   ├── device-register/
│   │   │   └── device-detail/
│   │   └── bulletins/
│   │       └── bulletin-view/
│   ├── app.routes.ts
│   └── app.component.ts
├── angular.json
├── package.json
└── Dockerfile
```

### Python IoT Simulator (standalone alternative)
```
iot-simulator/
├── iot_simulator.py                      — main simulator script
├── requirements.txt                      — paho-mqtt
├── config.yaml                           — broker URL, salle IDs, intervals
└── README.md                             — usage instructions
```

### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: stc_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"       # MQTT standard port — ESP32 devices connect here
      - "9001:9001"       # WebSocket port for browser MQTT clients (optional)
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log

  backend:
    build: ./smart-training-center-backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - mosquitto
    environment:
      SPRING_PROFILES_ACTIVE: simulator   # Change to "production" when real hardware is connected
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/stc_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      MQTT_BROKER_URL: tcp://mosquitto:1883

  frontend:
    build: ./smart-training-center-frontend
    ports:
      - "4200:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

> **To switch from simulator to real hardware:** Change `SPRING_PROFILES_ACTIVE` from `simulator` to `production`. Connect ESP32 devices to the same MQTT broker on port 1883. That's it.

---

## 🔐 SECURITY REQUIREMENTS
1. All passwords BCrypt hashed
2. JWT tokens with 24h expiry, refresh tokens with 7d expiry
3. CORS configured for Angular frontend origin
4. All API endpoints require authentication except `/api/auth/**`
5. Role-based endpoint protection:
   - `ETUDIANT` → courses, evaluations, own profile, own bulletin
   - `ENSEIGNANT` → own courses, evaluations, student progression
   - `ADMINISTRATEUR` → all management, IoT, alerts, users, devices
   - `RESPONSABLE_ACADEMIQUE` → dashboards, reports, approvals, audit
6. Input validation with `@Valid` and Bean Validation
7. SQL injection prevention via JPA parameterized queries
8. XSS prevention in Angular (built-in sanitization)
9. **MQTT broker secured** with username/password authentication (configurable in mosquitto.conf)

---

## 🌐 REAL-TIME FEATURES
1. **WebSocket for IoT data**: Live temperature, CO₂, presence updates per room
2. **WebSocket for alerts**: Push new alerts to admin UI instantly
3. **WebSocket for attendance**: Show live scan confirmations
4. **WebSocket for device status**: Push online/offline state changes
5. Use STOMP protocol over SockJS for browser compatibility

---

## 📋 SEED DATA (data.sql)
Include initial seed data:
- 4 roles: ETUDIANT, ENSEIGNANT, ADMINISTRATEUR, RESPONSABLE_ACADEMIQUE
- 1 admin user (admin@stc.com / admin123)
- 1 teacher (prof@stc.com / prof123)
- 2 students (etudiant1@stc.com, etudiant2@stc.com / etudiant123)
- 1 responsable (directeur@stc.com / directeur123)
- 3 filières: Informatique, Réseaux, Intelligence Artificielle
- 5 spécialités
- 10 matières
- 3 rooms with sensors (including registered device records with MAC addresses)
- 5 sample courses with content
- Sample quizzes and evaluations
- 3 IoT devices per room (temperature, CO₂, presence sensors) with `estEnLigne=true`

---

## ✅ BUSINESS RULES
1. **Conditional Progression**: A student MUST score ≥ 80% on the current module's evaluation before the next module is unlocked
2. **Attendance**: Presence is only valid if scanned within the scheduled course time window
3. **Alerts**: Auto-generated when sensor values exceed thresholds (temp > 30°C, CO₂ > 1000ppm)
4. **Course Approval**: Courses in BROUILLON status must be approved by ResponsableAcademique before becoming PUBLIE
5. **Bulletin Generation**: Weighted average of all evaluations per matière, per student
6. **Badge Status**: PERDU badge cannot record presence; must be replaced by admin
7. **Device Health**: If no heartbeat received within 60 seconds, mark device as OFFLINE and trigger alert
8. **Data Source Tagging**: All IoT-generated records (presence, alerts, sensor readings) are tagged with `source` ("SIMULATOR" or "HARDWARE") for audit transparency

---

## 🧪 TESTING
- Backend: JUnit 5 + Mockito for unit tests, Spring Boot Test for integration tests
- Frontend: Jasmine + Karma for unit tests
- Minimum coverage: Service layer 80%, Controller layer 70%
- **IoT-specific tests**: Test MQTT message parsing, threshold alerting, heartbeat timeout detection

---

## 📝 DELIVERABLES
1. Complete working Spring Boot backend with all entities, repositories, services, controllers
2. Complete Angular frontend with all pages, forms, dashboards, charts
3. Docker Compose for full deployment
4. README.md with setup instructions (including **"How to connect real hardware"** section)
5. Seed data for demo
6. IoT simulator (Spring Boot scheduled task + standalone Python script)
7. All API endpoints documented (Swagger/OpenAPI)
8. **`docs/ESP32_FIRMWARE_SPEC.md`** — complete specification for programming real ESP32 devices to work with this platform
9. **`docs/HARDWARE_INTEGRATION_GUIDE.md`** — step-by-step guide for transitioning from simulator to real hardware

---

## 🔌 HARDWARE INTEGRATION ARCHITECTURE SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE (Demo)                         │
│                                                                 │
│  ┌──────────────────┐     MQTT      ┌──────────────────┐       │
│  │  IoT Simulator   │──────────────▶│  Mosquitto       │       │
│  │  (Spring @Sched  │   Same JSON   │  MQTT Broker     │       │
│  │   or Python)     │   Same Topics │  Port 1883       │       │
│  └──────────────────┘               └────────┬─────────┘       │
│                                              │                  │
│                                     ┌────────▼─────────┐       │
│                                     │  Spring Boot     │       │
│                                     │  MqttSubscriber  │       │
│                                     │  (unchanged)     │       │
│                                     └────────┬─────────┘       │
│                                              │ WebSocket        │
│                                     ┌────────▼─────────┐       │
│                                     │  Angular Frontend│       │
│                                     └──────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 FUTURE STATE (Real Hardware)                     │
│                                                                 │
│  ┌──────────────────┐     MQTT      ┌──────────────────┐       │
│  │  ESP32 + DHT22   │──────────────▶│  Mosquitto       │       │
│  │  ESP32 + MH-Z19  │   Same JSON   │  MQTT Broker     │       │
│  │  ESP32 + RC522   │   Same Topics │  Port 1883       │       │
│  └──────────────────┘               └────────┬─────────┘       │
│                                              │                  │
│                                     ┌────────▼─────────┐       │
│                                     │  Spring Boot     │       │
│                                     │  MqttSubscriber  │       │
│                                     │  (UNCHANGED!)    │       │
│                                     └────────┬─────────┘       │
│                                              │ WebSocket        │
│                                     ┌────────▼─────────┐       │
│                                     │  Angular Frontend│       │
│                                     │  (UNCHANGED!)    │       │
│                                     └──────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

**The only difference between demo and production is the data source. The platform is hardware-ready from day one.**

---

## ⚠️ IMPORTANT NOTES
- This is a PFE (engineering degree final project) — code quality and architecture matter
- All comments and variable names can be in English, but UI labels should be in **French**
- The application must be fully functional and demo-ready
- Follow REST best practices (proper HTTP methods, status codes, pagination)
- Use DTOs — never expose entities directly in API responses
- Handle errors gracefully with proper error messages
- Implement pagination for all list endpoints
- **The IoT architecture must be hardware-agnostic** — the adapter pattern ensures the backend doesn't care whether data comes from a simulator or real ESP32 devices
