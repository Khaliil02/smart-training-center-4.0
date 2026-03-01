package com.goodgovit.stc.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursDto {
    private Long id;
    private String titre;
    private String description;
    private String contenu;
    private String filiere;
    private String niveau;
    private int dureeEstimee;
    private boolean estActif;
    private String statut;
    private Long enseignantId;
    private String enseignantNom;
    private Long salleId;
    private String salleNom;
    private long nombreInscrits;
}
