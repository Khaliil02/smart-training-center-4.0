package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursStatsDto {
    private Long coursId;
    private String coursTitre;
    private int nombreInscrits;
    private float progressionMoyenne;
    private float tauxReussite; // % of students with progression >= 80
    private float noteMoyenne;
    private int totalEvaluations;
    private float tauxPresence;
}
