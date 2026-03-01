package com.goodgovit.stc.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinLigneDto {
    private String coursTitre;
    private String filiere;
    private float noteFinale;
    private float progression;
    private String etat;
    private float coefficient;
    private float notePonderee;
}
