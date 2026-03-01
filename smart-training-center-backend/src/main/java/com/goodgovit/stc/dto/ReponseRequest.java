package com.goodgovit.stc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReponseRequest {
    @NotBlank
    private String texte;
    private boolean estCorrecte;
}
