package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationDto {
    private Long id;
    private String type;
    private LocalDate date;
    private float noteMaximale;
    private float seuilValidation;
    private float coefficient;
    private String statut;
    private Long coursId;
    private String coursTitre;
}
