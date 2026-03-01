package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlerteDto {
    private Long id;
    private String type; // TypeAlerte enum name
    private String message;
    private LocalDateTime dateHeure;
    private String statut; // StatutAlerte enum name
    private String source; // SourceDonnee enum name
    private Long salleId;
    private String salleNom;
    private Long capteurId;
}
