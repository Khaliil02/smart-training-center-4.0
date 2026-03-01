package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardIoTDto {
    private Long salleId;
    private String salleNom;
    private EnvironnementDto environnementActuel;
    private List<CapteurIoTDto> capteurs;
    private List<AlerteDto> alertesRecentes;
}
