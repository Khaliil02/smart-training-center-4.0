package com.goodgovit.stc.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceDto {
    private float tauxReussite; // success rate (% inscriptions with progression >= 80)
    private float tauxPresence; // attendance rate
    private float progressionMoyenneGlobale; // average progression across all inscriptions
    private float noteMoyenneGlobale;
    private long totalInscrits;
    private long totalTermines;
    private long totalAbandonnes;
    private Map<String, Float> tauxReussiteParFiliere;
    private Map<String, Float> engagementParCours; // average progression per course
}
