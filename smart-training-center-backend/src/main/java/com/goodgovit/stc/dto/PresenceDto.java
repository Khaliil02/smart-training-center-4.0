package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceDto {
    private Long id;
    private LocalDateTime dateHeure;
    private String methode; // MethodePresence enum name
    private String source; // SourceDonnee enum name
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantMatricule;
    private Long salleId;
    private String salleNom;
}
