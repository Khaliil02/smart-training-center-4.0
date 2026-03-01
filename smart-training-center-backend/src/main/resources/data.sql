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
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '2025-01-01',
        'ACTIF'
    ),
    (
        2,
        'Benali',
        'Ahmed',
        'prof@stc.com',
        '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG',
        '2025-01-01',
        'ACTIF'
    ),
    (
        3,
        'Mansouri',
        'Sara',
        'etudiant1@stc.com',
        '$2a$10$ByIUiNaRfBKSV6urZoBBxe4UbJ/sS6u1ZaPORHlMJVJq7iRnSPzra',
        '2025-01-15',
        'ACTIF'
    ),
    (
        4,
        'Tazi',
        'Youssef',
        'etudiant2@stc.com',
        '$2a$10$ByIUiNaRfBKSV6urZoBBxe4UbJ/sS6u1ZaPORHlMJVJq7iRnSPzra',
        '2025-01-15',
        'ACTIF'
    ),
    (
        5,
        'Alaoui',
        'Fatima',
        'directeur@stc.com',
        '$2a$10$EqKcp1WFKAr1GOsQUEAqruTVjRKFrM2qraaRIWBqJFcn/ccxnWy5i',
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
        'AA:BB:CC:DD:01:01',
        1
    ),
    (
        2,
        'CO2',
        450.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:01:02',
        1
    ),
    (
        3,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:01:03',
        1
    ),
    (
        4,
        'TEMPERATURE',
        21.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:02:01',
        2
    ),
    (
        5,
        'CO2',
        500.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:02:02',
        2
    ),
    (
        6,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:02:03',
        2
    ),
    (
        7,
        'TEMPERATURE',
        23.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:03:01',
        3
    ),
    (
        8,
        'CO2',
        400.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:03:02',
        3
    ),
    (
        9,
        'PRESENCE',
        0.0,
        NOW(),
        true,
        '1.0.0',
        'AA:BB:CC:DD:03:03',
        3
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