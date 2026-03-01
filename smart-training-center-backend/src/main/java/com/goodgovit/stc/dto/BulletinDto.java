package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinDto {
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantPrenom;
    private String matricule;
    private float moyenneGenerale;
    private List<BulletinLigneDto> lignes;
}
