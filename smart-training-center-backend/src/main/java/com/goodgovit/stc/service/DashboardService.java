package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.*;
import com.goodgovit.stc.entity.enums.*;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final InscriptionCoursRepository inscriptionRepository;
    private final EvaluationRepository evaluationRepository;
    private final PresenceRepository presenceRepository;
    private final SalleRepository salleRepository;
    private final CapteurIoTRepository capteurRepository;
    private final AlerteRepository alerteRepository;
    private final FiliereRepository filiereRepository;
    private final CapteurService capteurService;

    // ── Pedagogical Dashboard (Teacher) ──

    public DashboardPedagogiqueDto getPedagogique(Long enseignantId) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant non trouvé avec l'id: " + enseignantId));

        List<Cours> coursList = coursRepository.findByEnseignantId(enseignantId);
        String enseignantNom = enseignant.getUtilisateur().getNom() + " " + enseignant.getUtilisateur().getPrenom();

        Set<Long> uniqueStudents = new HashSet<>();
        List<CoursStatsDto> coursStats = new ArrayList<>();

        for (Cours cours : coursList) {
            List<InscriptionCours> inscriptions = inscriptionRepository.findByCoursId(cours.getId());

            inscriptions.forEach(i -> uniqueStudents.add(i.getEtudiant().getId()));

            float progressionMoyenne = 0;
            float noteMoyenne = 0;
            int passedCount = 0;

            if (!inscriptions.isEmpty()) {
                progressionMoyenne = (float) inscriptions.stream()
                        .mapToDouble(InscriptionCours::getProgression).average().orElse(0);
                noteMoyenne = (float) inscriptions.stream()
                        .mapToDouble(InscriptionCours::getNoteFinale).average().orElse(0);

                float seuil = 80.0f;
                List<Evaluation> evals = evaluationRepository.findByCoursId(cours.getId());
                if (!evals.isEmpty()) {
                    seuil = evals.get(0).getSeuilValidation();
                }
                final float finalSeuil = seuil;
                passedCount = (int) inscriptions.stream()
                        .filter(i -> i.getProgression() >= finalSeuil).count();
            }

            float tauxReussite = inscriptions.isEmpty() ? 0 :
                    (passedCount * 100.0f) / inscriptions.size();

            // Attendance rate: presences for the salle of this course
            float tauxPresence = 0;
            if (cours.getSalle() != null) {
                long presenceCount = presenceRepository.findBySalleId(cours.getSalle().getId()).size();
                int expectedAttendances = inscriptions.size(); // simplified
                tauxPresence = expectedAttendances > 0 ? Math.min((presenceCount * 100.0f) / expectedAttendances, 100.0f) : 0;
            }

            int totalEvals = evaluationRepository.findByCoursId(cours.getId()).size();

            coursStats.add(CoursStatsDto.builder()
                    .coursId(cours.getId())
                    .coursTitre(cours.getTitre())
                    .nombreInscrits(inscriptions.size())
                    .progressionMoyenne(Math.round(progressionMoyenne * 10.0f) / 10.0f)
                    .tauxReussite(Math.round(tauxReussite * 10.0f) / 10.0f)
                    .noteMoyenne(Math.round(noteMoyenne * 10.0f) / 10.0f)
                    .totalEvaluations(totalEvals)
                    .tauxPresence(Math.round(tauxPresence * 10.0f) / 10.0f)
                    .build());
        }

        return DashboardPedagogiqueDto.builder()
                .enseignantId(enseignantId)
                .enseignantNom(enseignantNom)
                .totalCours(coursList.size())
                .totalEtudiants(uniqueStudents.size())
                .coursStats(coursStats)
                .build();
    }

    // ── Administrative Dashboard (Admin) ──

    public DashboardAdministratifDto getAdministratif() {
        List<Utilisateur> users = utilisateurRepository.findAll();

        // Count users by role
        Map<String, Long> parRole = new HashMap<>();
        for (Utilisateur u : users) {
            for (Role r : u.getRoles()) {
                parRole.merge(r.getNomRole(), 1L, Long::sum);
            }
        }

        // Salles by type
        List<Salle> salles = salleRepository.findAll();
        Map<String, Long> sallesParType = salles.stream()
                .collect(Collectors.groupingBy(s -> s.getType().name(), Collectors.counting()));

        long devicesOnline = capteurRepository.findByEstEnLigne(true).size();
        long devicesOffline = capteurRepository.findByEstEnLigne(false).size();
        long alertesActives = alerteRepository.countByStatut(StatutAlerte.ACTIVE);

        List<InscriptionCours> allInscriptions = inscriptionRepository.findAll();
        long enCours = allInscriptions.stream().filter(i -> i.getEtat() == EtatInscription.EN_COURS).count();
        long terminees = allInscriptions.stream().filter(i -> i.getEtat() == EtatInscription.TERMINE).count();

        return DashboardAdministratifDto.builder()
                .totalUtilisateurs(users.size())
                .utilisateursParRole(parRole)
                .totalSalles(salles.size())
                .sallesParType(sallesParType)
                .devicesOnline(devicesOnline)
                .devicesOffline(devicesOffline)
                .alertesActives(alertesActives)
                .totalInscriptions(allInscriptions.size())
                .inscriptionsEnCours(enCours)
                .inscriptionsTerminees(terminees)
                .build();
    }

    // ── Decision-Making Dashboard (Responsable Académique) ──

    public DashboardDecisionnelDto getDecisionnel() {
        List<InscriptionCours> allInscriptions = inscriptionRepository.findAll();

        // Global success rate
        long passed = allInscriptions.stream().filter(i -> i.getProgression() >= 80.0f).count();
        float tauxReussiteGlobal = allInscriptions.isEmpty() ? 0 :
                (passed * 100.0f) / allInscriptions.size();

        // Global attendance rate
        long totalPresences = presenceRepository.findAll().size();
        long totalEtudiants = etudiantRepository.findAll().size();
        float tauxPresenceGlobal = totalEtudiants > 0 ? Math.min((totalPresences * 100.0f) / (totalEtudiants * 30), 100.0f) : 0; // rough estimate

        // Stats by filiere
        List<Filiere> filieres = filiereRepository.findAll();
        List<FiliereStatsDto> filiereStats = new ArrayList<>();

        for (Filiere filiere : filieres) {
            List<Cours> coursDansFiliere = coursRepository.findAll().stream()
                    .filter(c -> filiere.getNom().equals(c.getFiliere()))
                    .collect(Collectors.toList());

            Set<Long> studentsInFiliere = new HashSet<>();
            List<InscriptionCours> inscriptionsFiliere = new ArrayList<>();

            for (Cours cours : coursDansFiliere) {
                List<InscriptionCours> ci = inscriptionRepository.findByCoursId(cours.getId());
                inscriptionsFiliere.addAll(ci);
                ci.forEach(i -> studentsInFiliere.add(i.getEtudiant().getId()));
            }

            long passedFiliere = inscriptionsFiliere.stream().filter(i -> i.getProgression() >= 80.0f).count();
            float tauxReussiteFiliere = inscriptionsFiliere.isEmpty() ? 0 :
                    (passedFiliere * 100.0f) / inscriptionsFiliere.size();
            float progMoyFiliere = (float) inscriptionsFiliere.stream()
                    .mapToDouble(InscriptionCours::getProgression).average().orElse(0);

            // Specialite stats
            List<SpecialiteStatsDto> specStats = new ArrayList<>();
            if (filiere.getSpecialites() != null) {
                for (Specialite spec : filiere.getSpecialites()) {
                    // For specialite stats, we'd need courses linked to specialites
                    // Simplified: show counts from the filiere
                    specStats.add(SpecialiteStatsDto.builder()
                            .specialiteId(spec.getId())
                            .specialiteNom(spec.getNom())
                            .totalEtudiants(0) // would require specialite-course mapping
                            .tauxReussite(tauxReussiteFiliere) // inherit from filiere
                            .progressionMoyenne(progMoyFiliere)
                            .build());
                }
            }

            filiereStats.add(FiliereStatsDto.builder()
                    .filiereId(filiere.getId())
                    .filiereNom(filiere.getNom())
                    .totalEtudiants(studentsInFiliere.size())
                    .tauxReussite(Math.round(tauxReussiteFiliere * 10.0f) / 10.0f)
                    .progressionMoyenne(Math.round(progMoyFiliere * 10.0f) / 10.0f)
                    .specialiteStats(specStats)
                    .build());
        }

        // Environmental indicators per room
        List<Salle> salles = salleRepository.findAll();
        List<EnvironnementResumeDto> envIndicateurs = new ArrayList<>();
        for (Salle salle : salles) {
            List<CapteurIoT> capteurs = capteurRepository.findBySalleId(salle.getId());

            Float tempMoy = null;
            Float co2Moy = null;
            Integer presenceMoy = null;

            for (CapteurIoT c : capteurs) {
                switch (c.getType()) {
                    case TEMPERATURE: tempMoy = c.getValeurMesuree(); break;
                    case CO2: co2Moy = c.getValeurMesuree(); break;
                    case PRESENCE: presenceMoy = (int) c.getValeurMesuree(); break;
                    default: break;
                }
            }

            envIndicateurs.add(EnvironnementResumeDto.builder()
                    .salleId(salle.getId())
                    .salleNom(salle.getNomSalle())
                    .temperatureMoyenne(tempMoy)
                    .co2Moyen(co2Moy)
                    .presenceMoyenne(presenceMoy)
                    .build());
        }

        return DashboardDecisionnelDto.builder()
                .tauxReussiteGlobal(Math.round(tauxReussiteGlobal * 10.0f) / 10.0f)
                .tauxPresenceGlobal(Math.round(tauxPresenceGlobal * 10.0f) / 10.0f)
                .filiereStats(filiereStats)
                .indicateursEnvironnementaux(envIndicateurs)
                .build();
    }

    // ── IoT Dashboard ──

    public DashboardIoTDto getIoT(Long salleId) {
        Salle salle = salleRepository.findById(salleId)
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + salleId));

        EnvironnementDto env = capteurService.getEnvironnement(salleId);

        List<CapteurIoTDto> capteurs = capteurRepository.findBySalleId(salleId).stream()
                .map(this::toCapteurDto).collect(Collectors.toList());

        List<AlerteDto> alertes = alerteRepository.findBySalleId(salleId).stream()
                .sorted(Comparator.comparing(Alerte::getDateHeure).reversed())
                .limit(20)
                .map(this::toAlerteDto)
                .collect(Collectors.toList());

        return DashboardIoTDto.builder()
                .salleId(salle.getId())
                .salleNom(salle.getNomSalle())
                .environnementActuel(env)
                .capteurs(capteurs)
                .alertesRecentes(alertes)
                .build();
    }

    // ── Fleet Status ──

    public FleetStatusDto getFleetStatus() {
        List<CapteurIoT> allDevices = capteurRepository.findAll();
        long online = allDevices.stream().filter(CapteurIoT::isEstEnLigne).count();
        long offline = allDevices.size() - online;

        Map<String, Long> firmwareDist = allDevices.stream()
                .filter(d -> d.getFirmwareVersion() != null)
                .collect(Collectors.groupingBy(CapteurIoT::getFirmwareVersion, Collectors.counting()));

        Map<String, Long> parType = allDevices.stream()
                .collect(Collectors.groupingBy(d -> d.getType().name(), Collectors.counting()));

        List<IoTDeviceDto> deviceDtos = allDevices.stream()
                .map(c -> IoTDeviceDto.builder()
                        .id(c.getId())
                        .type(c.getType().name())
                        .adresseMac(c.getAdresseMac())
                        .firmwareVersion(c.getFirmwareVersion())
                        .estEnLigne(c.isEstEnLigne())
                        .valeurMesuree(c.getValeurMesuree())
                        .dateHeureMesure(c.getDateHeureMesure())
                        .salleId(c.getSalle().getId())
                        .salleNom(c.getSalle().getNomSalle())
                        .build())
                .collect(Collectors.toList());

        return FleetStatusDto.builder()
                .totalDevices(allDevices.size())
                .devicesOnline(online)
                .devicesOffline(offline)
                .firmwareDistribution(firmwareDist)
                .deviceParType(parType)
                .devices(deviceDtos)
                .build();
    }

    // ── Performance Indicators ──

    public PerformanceDto getPerformance() {
        List<InscriptionCours> allInscriptions = inscriptionRepository.findAll();

        long totalInscrits = allInscriptions.size();
        long totalTermines = allInscriptions.stream().filter(i -> i.getEtat() == EtatInscription.TERMINE).count();
        long totalAbandonnes = allInscriptions.stream().filter(i -> i.getEtat() == EtatInscription.ABANDONNE).count();
        long passed = allInscriptions.stream().filter(i -> i.getProgression() >= 80.0f).count();

        float tauxReussite = totalInscrits > 0 ? (passed * 100.0f) / totalInscrits : 0;
        float progressionMoyenne = (float) allInscriptions.stream()
                .mapToDouble(InscriptionCours::getProgression).average().orElse(0);
        float noteMoyenne = (float) allInscriptions.stream()
                .mapToDouble(InscriptionCours::getNoteFinale).average().orElse(0);

        // Attendance rate
        long totalPresences = presenceRepository.findAll().size();
        long totalEtudiants = etudiantRepository.findAll().size();
        float tauxPresence = totalEtudiants > 0 ? Math.min((totalPresences * 100.0f) / (totalEtudiants * 30), 100.0f) : 0;

        // Success rate per filiere
        Map<String, Float> tauxParFiliere = new LinkedHashMap<>();
        Map<String, List<InscriptionCours>> byFiliere = allInscriptions.stream()
                .filter(i -> i.getCours().getFiliere() != null)
                .collect(Collectors.groupingBy(i -> i.getCours().getFiliere()));

        for (Map.Entry<String, List<InscriptionCours>> entry : byFiliere.entrySet()) {
            long p = entry.getValue().stream().filter(i -> i.getProgression() >= 80.0f).count();
            float rate = entry.getValue().isEmpty() ? 0 : (p * 100.0f) / entry.getValue().size();
            tauxParFiliere.put(entry.getKey(), Math.round(rate * 10.0f) / 10.0f);
        }

        // Engagement per course (average progression)
        Map<String, Float> engagementParCours = new LinkedHashMap<>();
        Map<String, List<InscriptionCours>> byCours = allInscriptions.stream()
                .collect(Collectors.groupingBy(i -> i.getCours().getTitre()));

        for (Map.Entry<String, List<InscriptionCours>> entry : byCours.entrySet()) {
            float avg = (float) entry.getValue().stream()
                    .mapToDouble(InscriptionCours::getProgression).average().orElse(0);
            engagementParCours.put(entry.getKey(), Math.round(avg * 10.0f) / 10.0f);
        }

        return PerformanceDto.builder()
                .tauxReussite(Math.round(tauxReussite * 10.0f) / 10.0f)
                .tauxPresence(Math.round(tauxPresence * 10.0f) / 10.0f)
                .progressionMoyenneGlobale(Math.round(progressionMoyenne * 10.0f) / 10.0f)
                .noteMoyenneGlobale(Math.round(noteMoyenne * 10.0f) / 10.0f)
                .totalInscrits(totalInscrits)
                .totalTermines(totalTermines)
                .totalAbandonnes(totalAbandonnes)
                .tauxReussiteParFiliere(tauxParFiliere)
                .engagementParCours(engagementParCours)
                .build();
    }

    // ── Private DTO mappers ──

    private CapteurIoTDto toCapteurDto(CapteurIoT c) {
        return CapteurIoTDto.builder()
                .id(c.getId())
                .type(c.getType().name())
                .valeurMesuree(c.getValeurMesuree())
                .dateHeureMesure(c.getDateHeureMesure())
                .estEnLigne(c.isEstEnLigne())
                .firmwareVersion(c.getFirmwareVersion())
                .adresseMac(c.getAdresseMac())
                .salleId(c.getSalle().getId())
                .salleNom(c.getSalle().getNomSalle())
                .build();
    }

    private AlerteDto toAlerteDto(Alerte a) {
        return AlerteDto.builder()
                .id(a.getId())
                .type(a.getType().name())
                .message(a.getMessage())
                .dateHeure(a.getDateHeure())
                .statut(a.getStatut().name())
                .source(a.getSource().name())
                .salleId(a.getSalle() != null ? a.getSalle().getId() : null)
                .salleNom(a.getSalle() != null ? a.getSalle().getNomSalle() : null)
                .capteurId(a.getCapteur() != null ? a.getCapteur().getId() : null)
                .build();
    }
}
