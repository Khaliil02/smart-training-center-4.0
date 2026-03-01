package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialiteRequest {
    @NotBlank
    private String nom;
    @NotNull
    private Long filiereId;
}
