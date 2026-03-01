package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionCoursDto {
    private Long id;
    private LocalDate dateInscription;
    private float progression;
    private float noteFinale;
    private String etat;
    private LocalDateTime dateDernierAcces;
    private Long etudiantId;
    private String etudiantMatricule;
    private String etudiantNom;
    private Long coursId;
    private String coursTitre;
}
