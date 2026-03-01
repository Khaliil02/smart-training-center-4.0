package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationRequest {
    @NotBlank
    private String nom;
    private String description;
    private LocalDate dateExpiration;
}
