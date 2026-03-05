-- ============================================================
-- Smart Training Center - Seed Data
-- MySQL - Uses INSERT IGNORE for idempotent re-runs
-- ============================================================

-- ------------------------------------------------------------
-- 1. Roles
-- ------------------------------------------------------------
INSERT IGNORE INTO
    roles (id, nom_role, description)
VALUES (
        1,
        'ETUDIANT',
        'Role etudiant'
    ),
    (
        2,
        'ENSEIGNANT',
        'Role enseignant'
    ),
    (
        3,
        'ADMINISTRATEUR',
        'Role administrateur'
    ),
    (
        4,
        'RESPONSABLE_ACADEMIQUE',
        'Role responsable academique'
    );

-- ------------------------------------------------------------
-- 2. Utilisateurs
-- ------------------------------------------------------------
INSERT IGNORE INTO
    utilisateurs (
        id,
        nom,
        prenom,
        email,
        mot_de_passe,
        date_inscription,
        etat_compte
    )
VALUES (
        1,
        'Admin',
        'System',
        'admin@stc.com',
        '$2b$10$s9kLVR2sS/0dJ0/BGl00POLNDrXXWEdpctAU0OfPT3TOgtPLZdCzG',
        '2025-01-01',
        'ACTIF'
    ),
    (
        2,
        'Benali',
        'Ahmed',
        'prof@stc.com',
        '$2b$10$yt6mHcSlzkbb3OP2t7H7e.9HNm9lEws/uXLmBJqwVBc0y27/auhLW',
        '2025-01-01',
        'ACTIF'
    ),
    (
        3,
        'Mansouri',
        'Sara',
        'etudiant1@stc.com',
        '$2b$10$oeXijElWRpLNPXfpWvt1nuWFSJydDo.KHa1ttX/vQ4SJ3oS0eG4G2',
        '2025-01-15',
        'ACTIF'
    ),
    (
        4,
        'Tazi',
        'Youssef',
        'etudiant2@stc.com',
        '$2b$10$oeXijElWRpLNPXfpWvt1nuWFSJydDo.KHa1ttX/vQ4SJ3oS0eG4G2',
        '2025-01-15',
        'ACTIF'
    ),
    (
        5,
        'Alaoui',
        'Fatima',
        'directeur@stc.com',
        '$2b$10$XYudMpdBiEsbOgDnP88Jf.YttHse.FxhP/O9vZkWM4rnFCkFcRkde',
        '2025-01-01',
        'ACTIF'
    );

-- ------------------------------------------------------------
-- 3. Utilisateur-Roles (join table)
-- ------------------------------------------------------------
INSERT IGNORE INTO
    utilisateur_roles (utilisateur_id, role_id)
VALUES (1, 3),
    (2, 2),
    (3, 1),
    (4, 1),
    (5, 4);

-- ------------------------------------------------------------
-- 4. Administrateurs
-- ------------------------------------------------------------
INSERT IGNORE INTO
    administrateurs (id, utilisateur_id)
VALUES (1, 1);

-- ------------------------------------------------------------
-- 5. Responsables Academiques
-- ------------------------------------------------------------
INSERT IGNORE INTO
    responsables_academiques (
        id,
        departement,
        domaine,
        date_affectation,
        utilisateur_id
    )
VALUES (
        1,
        'Informatique',
        'Sciences et Technologies',
        '2025-01-01',
        5
    );

-- ------------------------------------------------------------
-- 6. Enseignants
-- ------------------------------------------------------------
INSERT IGNORE INTO
    enseignants (
        id,
        specialite,
        utilisateur_id,
        responsable_id
    )
VALUES (1, 'Informatique', 2, 1);

-- ------------------------------------------------------------
-- 7. Etudiants
-- ------------------------------------------------------------
INSERT IGNORE INTO
    etudiants (
        id,
        matricule,
        progression_globale,
        utilisateur_id
    )
VALUES (1, 'ETU-2025-001', 0.0, 3),
    (2, 'ETU-2025-002', 0.0, 4);

-- ------------------------------------------------------------
-- 8. Filieres
-- ------------------------------------------------------------
INSERT IGNORE INTO
    filieres (id, nom, description, niveau)
VALUES (
        1,
        'Informatique',
        'Filiere Informatique et Genie Logiciel',
        'Licence'
    ),
    (
        2,
        'Reseaux',
        'Filiere Reseaux et Telecommunications',
        'Licence'
    ),
    (
        3,
        'Intelligence Artificielle',
        'Filiere Intelligence Artificielle et Data Science',
        'Master'
    );

-- ------------------------------------------------------------
-- 9. Specialites
-- ------------------------------------------------------------
INSERT IGNORE INTO
    specialites (id, nom, filiere_id)
VALUES (1, 'Genie Logiciel', 1),
    (
        2,
        'Systemes Informatiques',
        1
    ),
    (
        3,
        'Administration Reseaux',
        2
    ),
    (4, 'Securite Informatique', 2),
    (5, 'Machine Learning', 3);

-- ------------------------------------------------------------
-- 10. Matieres
-- ------------------------------------------------------------
INSERT IGNORE INTO
    matieres (
        id,
        nom,
        coefficient,
        specialite_id
    )
VALUES (
        1,
        'Programmation Java',
        3.0,
        1
    ),
    (2, 'Base de Donnees', 2.5, 1),
    (3, 'Genie Logiciel', 2.0, 1),
    (
        4,
        'Systemes d Exploitation',
        2.0,
        2
    ),
    (
        5,
        'Architecture des Ordinateurs',
        2.0,
        2
    ),
    (
        6,
        'Reseaux Informatiques',
        3.0,
        3
    ),
    (
        7,
        'Protocoles de Communication',
        2.0,
        3
    ),
    (8, 'Cryptographie', 2.5, 4),
    (9, 'Python pour IA', 3.0, 5),
    (
        10,
        'Apprentissage Automatique',
        3.0,
        5
    );

-- ------------------------------------------------------------
-- 11. Salles
-- ------------------------------------------------------------
INSERT IGNORE INTO
    salles (id, nom_salle, capacite, type)
VALUES (1, 'Salle A101', 30, 'COURS'),
    (2, 'Labo B201', 20, 'LABO'),
    (
        3,
        'Amphi C301',
        200,
        'AMPHITHEATRE'
    );

-- ------------------------------------------------------------
-- 12. Capteurs IoT (3 per room)
-- ------------------------------------------------------------
INSERT IGNORE INTO
    capteurs_iot (
        id,
        type,
        valeur_mesuree,
        date_heure_mesure,
        est_en_ligne,
        firmware_version,
        adresse_mac,
        salle_id
    )
VALUES (
        1,
        'TEMPERATURE',
        22.5,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:01',
        1
    ),
    (
        2,
        'CO2',
        450.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:02',
        1
    ),
    (
        3,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:03',
        1
    ),
    (
        4,
        'TEMPERATURE',
        21.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:04',
        2
    ),
    (
        5,
        'CO2',
        500.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:05',
        2
    ),
    (
        6,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:06',
        2
    ),
    (
        7,
        'TEMPERATURE',
        23.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:07',
        3
    ),
    (
        8,
        'CO2',
        400.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:08',
        3
    ),
    (
        9,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-AA:BB:CC:DD:EE:09',
        3
    ),
    (
        10,
        'RFID_READER',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-RFID-READER-01',
        1
    ),
    (
        11,
        'RFID_READER',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'SIM-RFID-READER-02',
        2
    );

-- ------------------------------------------------------------
-- 13. RFID / QR Badges
-- ------------------------------------------------------------
INSERT IGNORE INTO
    rfid_qr (
        id,
        code_qr,
        statut,
        date_derniere_lecture,
        etudiant_id
    )
VALUES (
        1,
        'BADGE-ETU-001',
        'ACTIF',
        NULL,
        1
    ),
    (
        2,
        'BADGE-ETU-002',
        'ACTIF',
        NULL,
        2
    );

-- ------------------------------------------------------------
-- 14. Cours
-- ------------------------------------------------------------
INSERT IGNORE INTO
    cours (
        id,
        titre,
        description,
        contenu,
        filiere,
        niveau,
        duree_estimee,
        est_actif,
        statut,
        enseignant_id,
        salle_id
    )
VALUES (
        1,
        'Introduction a Java',
        'Cours d introduction a la programmation Java',
        'Contenu du cours Java...',
        'Informatique',
        'Licence',
        40,
        true,
        'PUBLIE',
        1,
        1
    ),
    (
        2,
        'Base de Donnees Relationnelles',
        'Cours sur les bases de donnees relationnelles et SQL',
        'Contenu du cours BDD...',
        'Informatique',
        'Licence',
        35,
        true,
        'PUBLIE',
        1,
        1
    ),
    (
        3,
        'Reseaux et Protocoles',
        'Cours sur les fondamentaux des reseaux informatiques',
        'Contenu du cours Reseaux...',
        'Reseaux',
        'Licence',
        30,
        true,
        'PUBLIE',
        1,
        2
    ),
    (
        4,
        'Intelligence Artificielle',
        'Introduction a l IA et au Machine Learning',
        'Contenu du cours IA...',
        'Intelligence Artificielle',
        'Master',
        45,
        true,
        'BROUILLON',
        1,
        3
    ),
    (
        5,
        'Securite des Systemes',
        'Cours de securite informatique et cryptographie',
        'Contenu du cours Securite...',
        'Informatique',
        'Licence',
        25,
        true,
        'PUBLIE',
        1,
        2
    );

-- ------------------------------------------------------------
-- 15. Evaluations
-- ------------------------------------------------------------
INSERT IGNORE INTO
    evaluations (
        id,
        type,
        date,
        note_maximale,
        seuil_validation,
        coefficient,
        statut,
        cours_id
    )
VALUES (
        1,
        'QUIZ',
        '2025-03-01',
        20.0,
        80.0,
        1.0,
        'PUBLIEE',
        1
    ),
    (
        2,
        'EXAMEN',
        '2025-04-15',
        20.0,
        80.0,
        2.0,
        'BROUILLON',
        1
    ),
    (
        3,
        'TP',
        '2025-03-10',
        20.0,
        80.0,
        1.5,
        'PUBLIEE',
        2
    );

-- ------------------------------------------------------------
-- 16. Quizzes
-- ------------------------------------------------------------
INSERT IGNORE INTO
    quizzes (
        id,
        titre,
        description,
        cours_id
    )
VALUES (
        1,
        'Quiz Java - Chapitre 1',
        'Quiz sur les bases de Java',
        1
    ),
    (
        2,
        'Quiz BDD - SQL',
        'Quiz sur les requetes SQL',
        2
    );

-- ------------------------------------------------------------
-- 17. Questions
-- ------------------------------------------------------------
INSERT IGNORE INTO
    questions (id, enonce, type, quiz_id)
VALUES (
        1,
        'Quel est le type de retour de la methode main en Java?',
        'QCM',
        1
    ),
    (
        2,
        'Java est un langage compile et interprete.',
        'VRAI_FAUX',
        1
    ),
    (
        3,
        'Quelle classe est la classe parente de toutes les classes Java?',
        'QCM',
        1
    ),
    (
        4,
        'Quelle commande SQL permet de selectionner des donnees?',
        'QCM',
        2
    ),
    (
        5,
        'Une cle primaire peut contenir des valeurs NULL.',
        'VRAI_FAUX',
        2
    );

-- ------------------------------------------------------------
-- 18. Reponses
-- ------------------------------------------------------------
-- Question 1 answers
INSERT IGNORE INTO
    reponses (
        id,
        texte,
        est_correcte,
        question_id
    )
VALUES (1, 'void', true, 1),
    (2, 'int', false, 1),
    (3, 'String', false, 1),
    (4, 'boolean', false, 1);

-- Question 2 answers
INSERT IGNORE INTO
    reponses (
        id,
        texte,
        est_correcte,
        question_id
    )
VALUES (5, 'Vrai', true, 2),
    (6, 'Faux', false, 2);

-- Question 3 answers
INSERT IGNORE INTO
    reponses (
        id,
        texte,
        est_correcte,
        question_id
    )
VALUES (7, 'Object', true, 3),
    (8, 'Class', false, 3),
    (9, 'Main', false, 3),
    (10, 'System', false, 3);

-- Question 4 answers
INSERT IGNORE INTO
    reponses (
        id,
        texte,
        est_correcte,
        question_id
    )
VALUES (11, 'SELECT', true, 4),
    (12, 'GET', false, 4),
    (13, 'FETCH', false, 4),
    (14, 'RETRIEVE', false, 4);

-- Question 5 answers
INSERT IGNORE INTO
    reponses (
        id,
        texte,
        est_correcte,
        question_id
    )
VALUES (15, 'Vrai', false, 5),
    (16, 'Faux', true, 5);

-- ------------------------------------------------------------
-- 19. Certifications
-- ------------------------------------------------------------
INSERT IGNORE INTO
    certifications (
        id,
        nom,
        description,
        date_expiration
    )
VALUES (
        1,
        'Oracle Certified Java SE',
        'Certification Java SE officielle Oracle',
        '2027-12-31'
    ),
    (
        2,
        'CCNA Cisco',
        'Certification Cisco Certified Network Associate',
        '2027-06-30'
    ),
    (
        3,
        'AWS Cloud Practitioner',
        'Certification Amazon Web Services Cloud Practitioner',
        '2028-01-31'
    );

-- ------------------------------------------------------------
-- 20. InscriptionCours (Student Course Enrollments)
-- ------------------------------------------------------------
INSERT IGNORE INTO
    inscriptions_cours (
        id,
        date_inscription,
        progression,
        note_finale,
        etat,
        date_dernier_acces,
        etudiant_id,
        cours_id
    )
VALUES (
        1,
        '2025-01-20',
        85.0,
        15.5,
        'EN_COURS',
        '2025-03-01 10:30:00',
        1,
        1
    ),
    (
        2,
        '2025-01-20',
        60.0,
        12.0,
        'EN_COURS',
        '2025-02-28 14:00:00',
        1,
        2
    ),
    (
        3,
        '2025-01-22',
        100.0,
        18.0,
        'TERMINE',
        '2025-02-25 09:00:00',
        1,
        3
    ),
    (
        4,
        '2025-02-01',
        45.0,
        0.0,
        'EN_COURS',
        '2025-03-01 16:45:00',
        1,
        5
    ),
    (
        5,
        '2025-01-20',
        70.0,
        14.0,
        'EN_COURS',
        '2025-03-02 11:00:00',
        2,
        1
    ),
    (
        6,
        '2025-01-22',
        95.0,
        17.5,
        'TERMINE',
        '2025-02-27 13:30:00',
        2,
        2
    ),
    (
        7,
        '2025-02-01',
        30.0,
        0.0,
        'EN_COURS',
        '2025-03-01 08:15:00',
        2,
        3
    ),
    (
        8,
        '2025-02-05',
        0.0,
        0.0,
        'ABANDONNE',
        NULL,
        2,
        5
    );

-- ------------------------------------------------------------
-- 21. Presence Records
-- ------------------------------------------------------------
INSERT IGNORE INTO
    presences (
        id,
        date_heure,
        methode,
        source,
        etudiant_id,
        salle_id
    )
VALUES (
        1,
        '2025-03-01 08:00:00',
        'RFID',
        'HARDWARE',
        1,
        1
    ),
    (
        2,
        '2025-03-01 08:02:00',
        'RFID',
        'HARDWARE',
        2,
        1
    ),
    (
        3,
        '2025-03-01 10:00:00',
        'QR',
        'WEB',
        1,
        2
    ),
    (
        4,
        '2025-03-01 10:05:00',
        'RFID',
        'HARDWARE',
        2,
        2
    ),
    (
        5,
        '2025-03-01 14:00:00',
        'RFID',
        'HARDWARE',
        1,
        3
    ),
    (
        6,
        '2025-03-01 14:01:00',
        'QR',
        'WEB',
        2,
        3
    ),
    (
        7,
        '2025-03-02 08:00:00',
        'RFID',
        'HARDWARE',
        1,
        1
    ),
    (
        8,
        '2025-03-02 08:03:00',
        'RFID',
        'HARDWARE',
        2,
        1
    ),
    (
        9,
        '2025-03-02 10:00:00',
        'QR',
        'WEB',
        1,
        2
    ),
    (
        10,
        '2025-03-02 10:01:00',
        'RFID',
        'HARDWARE',
        2,
        2
    ),
    (
        11,
        '2025-03-02 14:00:00',
        'RFID',
        'HARDWARE',
        1,
        3
    ),
    (
        12,
        '2025-03-02 14:02:00',
        'QR',
        'WEB',
        2,
        3
    ),
    (
        13,
        '2025-03-03 08:00:00',
        'RFID',
        'HARDWARE',
        1,
        1
    ),
    (
        14,
        '2025-03-03 08:05:00',
        'QR',
        'WEB',
        2,
        1
    ),
    (
        15,
        '2025-03-03 10:00:00',
        'RFID',
        'HARDWARE',
        1,
        2
    ),
    (
        16,
        '2025-03-03 10:02:00',
        'RFID',
        'HARDWARE',
        2,
        2
    ),
    (
        17,
        '2025-03-03 14:00:00',
        'QR',
        'WEB',
        1,
        3
    ),
    (
        18,
        '2025-03-03 14:03:00',
        'RFID',
        'HARDWARE',
        2,
        3
    ),
    (
        19,
        '2025-02-28 08:00:00',
        'RFID',
        'HARDWARE',
        1,
        1
    ),
    (
        20,
        '2025-02-28 08:01:00',
        'RFID',
        'HARDWARE',
        2,
        1
    );

-- ------------------------------------------------------------
-- 22. AuditLog Entries
-- ------------------------------------------------------------
INSERT IGNORE INTO
    audit_logs (
        id,
        action,
        entity_type,
        entity_id,
        user_id,
        timestamp,
        details
    )
VALUES (
        1,
        'LOGIN',
        'User',
        1,
        1,
        '2025-03-01 07:30:00',
        'Connexion administrateur'
    ),
    (
        2,
        'LOGIN',
        'User',
        2,
        2,
        '2025-03-01 07:45:00',
        'Connexion enseignant'
    ),
    (
        3,
        'LOGIN',
        'User',
        3,
        3,
        '2025-03-01 07:50:00',
        'Connexion etudiant Mansouri Sara'
    ),
    (
        4,
        'CREATE',
        'Cours',
        1,
        2,
        '2025-01-20 09:00:00',
        'Creation du cours: Introduction a Java'
    ),
    (
        5,
        'CREATE',
        'Cours',
        2,
        2,
        '2025-01-20 09:30:00',
        'Creation du cours: Base de Donnees Relationnelles'
    ),
    (
        6,
        'CREATE',
        'Cours',
        3,
        2,
        '2025-01-22 10:00:00',
        'Creation du cours: Reseaux et Protocoles'
    ),
    (
        7,
        'UPDATE',
        'Cours',
        1,
        2,
        '2025-02-15 11:00:00',
        'Mise a jour du contenu du cours Java'
    ),
    (
        8,
        'CREATE',
        'Evaluation',
        1,
        2,
        '2025-02-20 14:00:00',
        'Creation du quiz: Quiz Java - Chapitre 1'
    ),
    (
        9,
        'CREATE',
        'Evaluation',
        3,
        2,
        '2025-02-22 10:00:00',
        'Creation du TP: BDD Relationnelles'
    ),
    (
        10,
        'CREATE',
        'Presence',
        1,
        1,
        '2025-03-01 08:00:00',
        'Scan RFID: Mansouri Sara en Salle A101'
    ),
    (
        11,
        'CREATE',
        'Presence',
        2,
        1,
        '2025-03-01 08:02:00',
        'Scan RFID: Tazi Youssef en Salle A101'
    ),
    (
        12,
        'DELETE',
        'User',
        NULL,
        1,
        '2025-02-10 16:00:00',
        'Suppression d un compte test'
    ),
    (
        13,
        'UPDATE',
        'User',
        3,
        1,
        '2025-02-12 09:00:00',
        'Mise a jour du profil etudiant'
    ),
    (
        14,
        'LOGIN',
        'User',
        4,
        4,
        '2025-03-02 08:00:00',
        'Connexion etudiant Tazi Youssef'
    ),
    (
        15,
        'LOGIN',
        'User',
        5,
        5,
        '2025-03-02 09:00:00',
        'Connexion responsable academique'
    );

-- ------------------------------------------------------------
-- 23. Alerte Records
-- ------------------------------------------------------------
INSERT IGNORE INTO
    alertes (
        id,
        type,
        message,
        date_heure,
        statut,
        source,
        salle_id,
        capteur_id
    )
VALUES (
        1,
        'TEMPERATURE_ELEVEE',
        'Temperature elevee detectee en Salle A101: 32.5 C',
        '2025-03-01 11:30:00',
        'ACTIVE',
        'SIMULATOR',
        1,
        1
    ),
    (
        2,
        'CO2_ELEVE',
        'Niveau CO2 eleve en Labo B201: 1200 ppm',
        '2025-03-01 14:15:00',
        'TRAITEE',
        'SIMULATOR',
        2,
        5
    ),
    (
        3,
        'DEVICE_OFFLINE',
        'Capteur temperature Amphi C301 hors ligne',
        '2025-03-02 06:00:00',
        'ACTIVE',
        'HARDWARE',
        3,
        7
    ),
    (
        4,
        'PRESENCE_ANORMALE',
        'Presence detectee en Salle A101 hors horaires',
        '2025-03-02 22:30:00',
        'ACTIVE',
        'HARDWARE',
        1,
        3
    ),
    (
        5,
        'TEMPERATURE_ELEVEE',
        'Temperature elevee en Labo B201: 35.0 C',
        '2025-03-03 09:45:00',
        'ACTIVE',
        'SIMULATOR',
        2,
        4
    ),
    (
        6,
        'CO2_ELEVE',
        'Niveau CO2 critique en Amphi C301: 1500 ppm',
        '2025-02-28 15:00:00',
        'TRAITEE',
        'SIMULATOR',
        3,
        8
    );

-- ------------------------------------------------------------
-- 24. DeviceHeartbeat Records
-- ------------------------------------------------------------
INSERT IGNORE INTO
    device_heartbeats (
        id,
        device_id,
        uptime,
        free_memory,
        timestamp,
        capteur_id
    )
VALUES (
        1,
        'SIM-AA:BB:CC:DD:EE:01',
        86400,
        524288,
        '2025-03-03 08:00:00',
        1
    ),
    (
        2,
        'SIM-AA:BB:CC:DD:EE:02',
        86400,
        480000,
        '2025-03-03 08:00:00',
        2
    ),
    (
        3,
        'SIM-AA:BB:CC:DD:EE:04',
        172800,
        512000,
        '2025-03-03 08:00:00',
        4
    ),
    (
        4,
        'SIM-AA:BB:CC:DD:EE:05',
        172800,
        490000,
        '2025-03-03 08:00:00',
        5
    ),
    (
        5,
        'SIM-RFID-READER-01',
        259200,
        460000,
        '2025-03-03 08:00:00',
        10
    ),
    (
        6,
        'SIM-RFID-READER-02',
        259200,
        470000,
        '2025-03-03 08:00:00',
        11
    );