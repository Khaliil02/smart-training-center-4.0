package com.goodgovit.stc.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatiereDto {
    private Long id;
    private String nom;
    private float coefficient;
    private Long specialiteId;
    private String specialiteNom;
}
