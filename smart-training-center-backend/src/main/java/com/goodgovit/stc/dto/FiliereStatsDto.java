package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiliereStatsDto {
    private Long filiereId;
    private String filiereNom;
    private int totalEtudiants;
    private float tauxReussite;
    private float progressionMoyenne;
    private List<SpecialiteStatsDto> specialiteStats;
}
