package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapteurIoTDto {
    private Long id;
    private String type; // TypeCapteur enum name
    private float valeurMesuree;
    private LocalDateTime dateHeureMesure;
    private boolean estEnLigne;
    private String firmwareVersion;
    private String adresseMac;
    private Long salleId;
    private String salleNom;
}
