package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursRequest {
    @NotBlank
    private String titre;
    private String description;
    private String contenu;
    private String filiere;
    private String niveau;
    private int dureeEstimee;
    private Long salleId;
}
