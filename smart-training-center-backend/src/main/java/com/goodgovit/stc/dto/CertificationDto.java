package com.goodgovit.stc.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDto {
    private Long id;
    private String nom;
    private String description;
    private LocalDate dateExpiration;
}
