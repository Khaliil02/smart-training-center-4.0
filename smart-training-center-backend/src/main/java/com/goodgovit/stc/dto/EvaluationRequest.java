package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationRequest {
    @NotBlank
    private String type;
    private LocalDate date;
    private float noteMaximale = 20.0f;
    private float seuilValidation = 80.0f;
    private float coefficient = 1.0f;
    @NotNull
    private Long coursId;
}
