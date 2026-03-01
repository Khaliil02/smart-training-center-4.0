package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalleRequest {
    @NotBlank
    private String nomSalle;
    @Positive
    private int capacite;
    @NotBlank
    private String type; // TypeSalle enum name
}
