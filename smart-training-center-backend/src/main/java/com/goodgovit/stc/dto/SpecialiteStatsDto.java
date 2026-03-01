package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteStatsDto {
    private Long specialiteId;
    private String specialiteNom;
    private int totalEtudiants;
    private float tauxReussite;
    private float progressionMoyenne;
}
