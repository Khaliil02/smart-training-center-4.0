package com.goodgovit.stc.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FiliereDto {
    private Long id;
    private String nom;
    private String description;
    private String niveau;
    private List<SpecialiteDto> specialites;
}
