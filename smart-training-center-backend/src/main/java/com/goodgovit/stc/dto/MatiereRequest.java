package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatiereRequest {
    @NotBlank
    private String nom;
    private float coefficient = 1.0f;
    @NotNull
    private Long specialiteId;
}
