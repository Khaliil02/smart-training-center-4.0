package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDecisionnelDto {
    private float tauxReussiteGlobal; // overall success rate
    private float tauxPresenceGlobal;
    private List<FiliereStatsDto> filiereStats;
    private List<EnvironnementResumeDto> indicateursEnvironnementaux;
}
