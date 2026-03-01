package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialiteDto {
    private Long id;
    private String nom;
    private Long filiereId;
    private String filiereNom;
    private List<MatiereDto> matieres;
}
