package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FiliereRequest {
    @NotBlank
    private String nom;
    private String description;
    private String niveau;
}
