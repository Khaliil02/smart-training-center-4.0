package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private LocalDate dateInscription;
    private String etatCompte;
    private List<String> roles;
}
