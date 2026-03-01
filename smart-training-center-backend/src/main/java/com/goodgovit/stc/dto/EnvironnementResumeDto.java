package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironnementResumeDto {
    private Long salleId;
    private String salleNom;
    private Float temperatureMoyenne;
    private Float co2Moyen;
    private Integer presenceMoyenne;
}
