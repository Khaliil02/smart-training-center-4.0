package com.goodgovit.stc.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAdministratifDto {
    private long totalUtilisateurs;
    private Map<String, Long> utilisateursParRole; // e.g. {"ETUDIANT": 50, "ENSEIGNANT": 10}
    private long totalSalles;
    private Map<String, Long> sallesParType;
    private long devicesOnline;
    private long devicesOffline;
    private long alertesActives;
    private long totalInscriptions;
    private long inscriptionsEnCours;
    private long inscriptionsTerminees;
}
