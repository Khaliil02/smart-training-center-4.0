package com.goodgovit.stc.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReponseDto {
    private Long id;
    private String texte;
    private boolean estCorrecte;
}
