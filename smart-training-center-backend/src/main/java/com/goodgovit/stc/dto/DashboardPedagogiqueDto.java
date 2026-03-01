package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardPedagogiqueDto {
    private Long enseignantId;
    private String enseignantNom;
    private int totalCours;
    private int totalEtudiants;
    private List<CoursStatsDto> coursStats;
}
